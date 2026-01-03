import "server-only";

const WC_API_URL = process.env.WC_API_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function requireEnv(name: string, value?: string) {
  if (!value) throw new Error(`Missing env var: ${name}`);
}

function authHeader() {
  requireEnv("WC_CONSUMER_KEY", WC_CONSUMER_KEY);
  requireEnv("WC_CONSUMER_SECRET", WC_CONSUMER_SECRET);

  // WooCommerce REST API Basic Auth over HTTPS
  const token = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

export async function wcGet<T>(path: string, params?: Record<string, string | number | boolean>) {
  requireEnv("WC_API_URL", WC_API_URL);

  const url = new URL(`${WC_API_URL}${path.startsWith("/") ? path : `/${path}`}`);

  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
    },
    // avoid caching during development; later we can tune this
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WooCommerce API error ${res.status}: ${text.slice(0, 400)}`);
  }

  return (await res.json()) as T;
}
