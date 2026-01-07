import { headers } from "next/headers";
export const dynamic = "force-dynamic";

type WCProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: string;
  price_html?: string;
  images?: { src: string; alt?: string }[];
  categories?: { id: number; name: string; slug: string }[];
};

async function getBaseUrl() {
  const h = await headers(); // IMPORTANT: await

  const proto =
    h.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    "localhost:3000";

  return `${proto}://${host}`;
}

async function getProduct(slug: string): Promise<WCProduct> {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}/api/product?slug=${encodeURIComponent(slug)}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!data.ok) throw new Error(data.error || "Failed to load product");
  return data.product as WCProduct;
}



export default async function ProductDetailPage({
  params,
}: {
  // Next 16.1 in some setups treats params as async
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProduct(slug);
  const img = product.images?.[0]?.src;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <a href="/products" className="text-sm text-white/70 hover:underline">
        ← Back to products
      </a>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={product.images?.[0]?.alt || product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-[360px] items-center justify-center text-sm text-white/60">
              No image
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-semibold text-white">{product.name}</h1>

          <div className="mt-3">
            {product.price_html ? (
              <div
                className="text-lg font-semibold text-white"
                dangerouslySetInnerHTML={{ __html: product.price_html }}
              />
            ) : (
              <div className="text-lg font-semibold text-white">
                {product.price ? `£${product.price}` : "—"}
              </div>
            )}
          </div>

          {product.categories?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.categories.map((c) => (
                <a
                  key={c.id}
                  href={`/products?category=${c.id}`}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  {c.name}
                </a>
              ))}
            </div>
          ) : null}

          <div
            className="prose prose-invert mt-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description || "" }}
          />

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/quote"
              className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-black hover:bg-white/90"
            >
              Get a quote
            </a>
            <a
              href="/products"
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
            >
              View more products
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
