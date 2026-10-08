import { PLANOS, json, purin } from "../lib/purin.mjs";

// POST /.netlify/functions/checkout
// body: { plano, metodo: "pix" | "cartao", nome, email, whatsapp }
export default async (req) => {
  if (req.method !== "POST") return json(405, { erro: "Use POST." });

  let b;
  try { b = await req.json(); } catch { return json(400, { erro: "Dados inválidos." }); }

  const plano = PLANOS[b.plano];
  if (!plano) return json(400, { erro: "Plano inválido." });

  const nome = String(b.nome || "").trim().slice(0, 120);
  const email = String(b.email || "").trim().slice(0, 160);
  const whatsapp = String(b.whatsapp || "").replace(/\D/g, "").slice(0, 15);
  if (!nome) return json(400, { erro: "Preencha seu nome." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { erro: "Informe um e-mail válido." });

  const site = process.env.URL || new URL(req.url).origin;
  const base = {
    valueCents: plano.centavos,
    description: `PROMIZE - ${plano.nome} (1ª mensalidade)`,
    callbackUrl: `${site}/.netlify/functions/webhook`,
    customer: { name: nome, email },
    metadata: JSON.stringify({ plano: b.plano, whatsapp }),
  };

  try {
    if (b.metodo === "cartao") {
      const r = await purin("/card-payments", {
        method: "POST",
        body: JSON.stringify({
          ...base,
          successUrl: `${site}/?pagamento=ok#planos`,
          cancelUrl: `${site}/?pagamento=cancelado#planos`,
        }),
      });
      if (!r.ok || !r.data.checkoutUrl) {
        console.error("card-payments", r.status, r.data);
        return json(502, { erro: "Não foi possível abrir o pagamento com cartão. Tente PIX ou fale com a equipe." });
      }
      return json(200, { tipo: "cartao", checkoutUrl: r.data.checkoutUrl, orderCode: r.data.orderCode });
    }

    const r = await purin("/charges", {
      method: "POST",
      body: JSON.stringify({ ...base, expiresIn: 1800 }),
    });
    if (!r.ok || !r.data.pix) {
      console.error("charges", r.status, r.data);
      const motivo = r.status === 401 ? "Chave da PurinCash inválida ou revogada." : (r.data && (r.data.message || r.data.error)) || "";
      return json(502, { erro: "Não foi possível gerar o PIX. " + motivo, codigo: "purin_" + r.status });
    }
    return json(200, {
      tipo: "pix",
      paymentId: r.data.paymentId,
      valor: r.data.amountCents,
      brCode: r.data.pix.brCode,
      qrCodeImage: r.data.pix.qrCodeImage,
      expiresAt: r.data.expiresAt,
    });
  } catch (e) {
    console.error("checkout falhou:", e && e.message, e && e.cause);
    if (!process.env.PURIN_API_KEY) {
      return json(500, { erro: "Pagamento ainda não configurado: falta a variável PURIN_API_KEY no Netlify.", codigo: "sem_chave" });
    }
    return json(500, { erro: "Não foi possível falar com a PurinCash agora. Tente de novo em alguns minutos.", codigo: "rede" });
  }
};
