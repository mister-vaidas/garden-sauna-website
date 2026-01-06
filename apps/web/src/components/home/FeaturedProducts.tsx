export const dynamic = "force-dynamic";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: string;
  price_html?: string;
  images?: { src: string; alt?: string }[];
};

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/products`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!data.ok) return [];
  return (data.products as Product[]).slice(0, 3);
}

export default async function FeaturedProducts() {
  const products = await getProducts();

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-6 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold">Best sellers</h2>
          <p className="mt-2 text-sm text-white/60">Our most popular picks right now.</p>
        </div>
        <a
          href="/products"
          className="hidden rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 sm:inline-flex"
        >
          See all products
        </a>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {products.map((p) => {
          const img = p.images?.[0]?.src;
          return (
            <a
              key={p.id}
              href={`/products/${p.slug}`}
              className="group rounded-2xl border border-white/10 bg-white p-4 text-black shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={p.images?.[0]?.alt || p.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    No image
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-snug">{p.name}</h3>
                <div className="shrink-0 text-right">
                  {p.price_html ? (
                    <div
                      className="text-sm font-semibold"
                      dangerouslySetInnerHTML={{ __html: p.price_html }}
                    />
                  ) : (
                    <div className="text-sm font-semibold">{p.price ? `£${p.price}` : "—"}</div>
                  )}
                </div>
              </div>

              <div className="mt-3 text-sm font-medium text-gray-700">View details →</div>
            </a>
          );
        })}
      </div>

      <div className="mt-8 sm:hidden">
        <a
          href="/products"
          className="inline-flex w-full justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
        >
          See all products
        </a>
      </div>
    </section>
  );
}
