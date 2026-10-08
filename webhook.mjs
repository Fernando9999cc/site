import crypto from "node:crypto";

// Purin calls this when a charge is paid. Payments also show up in the Purin dashboard.
// Set PURIN_WEBHOOK_SECRET in Netlify to verify the X-Webhook-Signature header (HMAC-SHA256 of the raw body).
export default async (req) => {
  if (req.method !== "POST") return new Response("ok");
  const raw = await req.text();
  const secret = process.env.PURIN_WEBHOOK_SECRET;

  if (secret) {
    const got = (req.headers.get("x-webhook-signature") || "").replace(/^sha256=/, "");
    const want = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    const a = Buffer.from(want), b = Buffer.from(got);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return new Response("assinatura inválida", { status: 401 });
    }
  }

  let ev = {};
  try { ev = JSON.parse(raw); } catch {}
  console.log("purin webhook", req.headers.get("x-webhook-id"), ev.event, ev.paymentId || ev.orderCode, ev.status);
  return new Response("ok");
};
