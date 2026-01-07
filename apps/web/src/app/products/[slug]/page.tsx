export const dynamic = "force-dynamic";

import { wcGet } from "@/lib/woocommerce";

type WCImage = { src: string; alt?: string };
type WCCategory = { id: number; name: string; slug: string };

type WCProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: string;
  price_html?: string;
  images?: WCImage[];
  categories?: WCCategory[];
};

type CategoryNode = { id: number; slug: string; name: string; parent: number };

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function mapProduct(p: any): WCProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    short_description: p.short_description,
    price: p.price,
    price_html: p.price_html,
    images: (p.images || []).map((img: any) => ({ src: img.src, alt: img.alt })),
    categories: (p.categories || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
  };
}

async function getProductBySlug(slug: string) {
  const products = await wcGet<any[]>("/products", {
    slug,
    per_page: 1,
    status: "publish",
  });

  const product = products?.[0];
  if (!product) throw new Error("Not found");

  return mapProduct(product);
}

async function getAllCategories(): Promise<CategoryNode[]> {
  const cats = await wcGet<any[]>("/products/categories", {
    per_page: 100,
    hide_empty: false,
  });

  return (cats || []).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    parent: c.parent,
  }));
}

async function getRelatedByCategory(categoryId: number, excludeId: number, limit = 6) {
  const products = await wcGet<any[]>("/products", {
    per_page: Math.min(Math.max(limit + 6, 1), 20), // grab a bit more then randomize
    status: "publish",
    category: String(categoryId),
    orderby: "date",
    order: "desc",
  });

  const mapped = (products || [])
    .filter((p: any) => Number(p.id) !== Number(excludeId))
    .map(mapProduct);

  return shuffle(mapped).slice(0, limit);
}

async function getAccessoriesSuggestions(excludeId: number, limit = 6) {
  // Your known IDs from categories output
  const COLD_TUBS_ID = 20;
  const CAMPING_HOUSES_ID = 71;

  const [cold, camping] = await Promise.all([
    wcGet<any[]>("/products", {
      per_page: 10,
      status: "publish",
      category: String(COLD_TUBS_ID),
      orderby: "date",
      order: "desc",
    }),
    wcGet<any[]>("/products", {
      per_page: 10,
      status: "publish",
      category: String(CAMPING_HOUSES_ID),
      orderby: "date",
      order: "desc",
    }),
  ]);

  const combined = [...(cold || []), ...(camping || [])]
    .filter((p: any) => Number(p.id) !== Number(excludeId))
    .map(mapProduct);

  return shuffle(combined).slice(0, limit);
}

function ProductMiniCard({ p }: { p: WCProduct }) {
  const img = p.images?.[0]?.src;

  return (
    <a
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
          <div className="flex h-full items-center justify-center text-sm text-gray-500">No image</div>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug">{p.name}</h3>
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

      <div className="mt-3 text-sm font-medium text-gray-700">View →</div>
    </a>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolved = "then" in params ? await params : params;
  const slug = resolved.slug;

  const product = await getProductBySlug(slug);

  // Determine best category to use for "Related"
  const categories = await getAllCategories();
  const catMap = new Map<number, CategoryNode>(categories.map((c) => [c.id, c]));

  // Known parents from your structure
  const SAUNAS_PARENT_ID = 16;
  const HOT_TUBS_ID = 17;
  const ACCESSORIES_PARENT_ID = 18;

  const productCatIds = (product.categories || []).map((c) => c.id);

  const isHotTub = productCatIds.includes(HOT_TUBS_ID);

  // Find sauna subcategory (child of Saunas)
  const saunaChild = productCatIds
    .map((id) => catMap.get(id))
    .find((c) => c && c.parent === SAUNAS_PARENT_ID);

  // Find accessories subcategory (child of Accessories)
  const accessoriesChild = productCatIds
    .map((id) => catMap.get(id))
    .find((c) => c && c.parent === ACCESSORIES_PARENT_ID);

  // Choose related category priority:
  // Hot tub → HOT_TUBS_ID
  // else sauna child → that child id
  // else accessories child → that child id
  // else fallback: first product category id
  const relatedCategoryId =
    (isHotTub ? HOT_TUBS_ID : undefined) ??
    saunaChild?.id ??
    accessoriesChild?.id ??
    productCatIds[0];

  const [related, accessories] = await Promise.all([
    relatedCategoryId ? getRelatedByCategory(relatedCategoryId, product.id, 6) : Promise.resolve([]),
    getAccessoriesSuggestions(product.id, 6),
  ]);

  const img = product.images?.[0]?.src;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <a href="/products" className="text-sm text-white/70 hover:underline">
        ← Back to products
      </a>

      {/* Main product */}
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
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

          {/* Category chips */}
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
              Request a quote
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

      {/* Related */}
      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Related products</h2>
            <p className="mt-2 text-sm text-white/60">
              {isHotTub
                ? "More hot tubs you may like."
                : saunaChild
                  ? `More from ${saunaChild.name}.`
                  : accessoriesChild
                    ? `More from ${accessoriesChild.name}.`
                    : "Similar products from the same category."}
            </p>
          </div>
          {relatedCategoryId ? (
            <a
              href={`/products?category=${relatedCategoryId}`}
              className="hidden rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 sm:inline-flex"
            >
              View all →
            </a>
          ) : null}
        </div>

        {related.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductMiniCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            No related products found yet.
          </div>
        )}
      </section>

      {/* Accessories cross-sell */}
      <section className="mt-14">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-white">Recommended accessories</h2>
          <p className="mt-2 text-sm text-white/60">
            Cold tubs and camping houses that pair well with your purchase.
          </p>
        </div>

        {accessories.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {accessories.map((p) => (
              <ProductMiniCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            No accessories found yet.
          </div>
        )}
      </section>
    </main>
  );
}
