// Shared helpers. The API key lives only in the Netlify environment variable PURIN_API_KEY.
export const API = "https://api.purincash.com/v1";

// Prices are defined here, on the server, so the browser cannot change them.
export const PLANOS = {
  "site":            { nome: "Plano Site",            centavos: 21990 },
  "site-app":        { nome: "Plano Site + App",      centavos: 27990 },
  "autoatendimento": { nome: "Plano Autoatendimento", centavos: 74990 },
  "completo":        { nome: "Pacote completo",       centavos: 89990 },
};

export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function purin(path, init = {}) {
  const key = process.env.PURIN_API_KEY;
  if (!key) throw new Error("PURIN_API_KEY não configurada no Netlify.");
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}
