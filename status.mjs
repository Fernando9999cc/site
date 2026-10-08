import { json, purin } from "../lib/purin.mjs";

// GET /.netlify/functions/status?id=psc_xxx  -> { status }
export default async (req) => {
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!/^psc_[A-Za-z0-9]+$/.test(id)) return json(400, { erro: "Cobrança inválida." });
  try {
    const r = await purin(`/charges/${id}`);
    if (!r.ok) return json(502, { erro: "Não foi possível consultar a cobrança." });
    return json(200, { status: r.data.status });
  } catch (e) {
    console.error(e);
    return json(500, { erro: "Consulta indisponível." });
  }
};
