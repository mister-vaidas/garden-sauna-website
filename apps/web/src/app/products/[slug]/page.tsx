export const dynamic = "force-dynamic";

type WCProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: string;
  images?: { src: string; alt?: string }[];
};

async function getProduct(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/product?slug=${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to load product");
  return data.product as WCProduct;
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);
  const img = product.images?.[0]?.src;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <a href="/products" className="text-sm text-gray-600 hover:underline">
        ← Back to products
      </a>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border bg-gray-100">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={product.images?.[0]?.alt || product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-[360px] items-center justify-center text-sm text-gray-500">
              No image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <div className="mt-3 text-lg font-semibold">{product.price ? `£${product.price}` : "—"}</div>

          <div
            className="prose mt-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description || "" }}
          />

          <div className="mt-8 flex gap-3">
            <a
              href="/contact"
              className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
            >
              Request a quote
            </a>
            <a
              href="/builder"
              className="rounded-xl border px-5 py-3 text-sm font-medium"
            >
              Build your sauna
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
