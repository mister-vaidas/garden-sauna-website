export const dynamic = "force-dynamic";

type WCProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  images?: { src: string; alt?: string }[];
};

async function getProducts() {
  const res = await fetch("http://localhost:3000/api/products", { cache: "no-store" }).catch(
    async () => fetch("/api/products", { cache: "no-store" })
  );

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Failed to load products");
  return data.products as WCProduct[];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Products</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Saunas, hot tubs, and accessories — browse the full range.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const img = p.images?.[0]?.src;
          return (
            <a
              key={p.id}
              href={`/products/${p.slug}`}
              className="group rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
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
                <h2 className="text-base font-medium leading-snug">{p.name}</h2>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold">{p.price ? `£${p.price}` : "—"}</div>
                </div>
              </div>

              <div className="mt-3 text-sm font-medium text-gray-700">View details →</div>
            </a>
          );
        })}
      </div>
    </main>
  );
}
