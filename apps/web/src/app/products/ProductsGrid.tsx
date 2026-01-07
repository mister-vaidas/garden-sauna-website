"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: string;
  price_html?: string;
  images?: { src: string; alt?: string }[];
  categories?: { id: number; name: string; slug: string }[];
};

type Category = { id: number; name: string; slug: string; parent: number };

type ProductsGridProps = {
  q: string;
  page: number;
  category: string; // expected to be category ID as string (or "")
  sort: string;
};

export default function ProductsGrid({ q, page, category, sort }: ProductsGridProps) {
  const router = useRouter();

  const activeCategoryId = category ? Number(category) : null;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const mainCategorySlugs = ["saunas", "hot-tubs", "accessories"];

  const mainCats = useMemo(() => {
    const mains = mainCategorySlugs
      .map((s) => categories.find((c) => c.slug === s && c.parent === 0))
      .filter(Boolean) as Category[];
    return mains;
  }, [categories]);

  async function loadCategories() {
    const res = await fetch("/api/categories", { cache: "no-store" });
    const data = await res.json();
    if (data.ok) setCategories(data.categories || []);
  }

  async function loadProducts(opts: {
    catId?: number | null;
    q?: string;
    page?: number;
    sort?: string;
  }) {
    setLoading(true);

    const params = new URLSearchParams();

    if (opts.catId) params.set("category", String(opts.catId));
    if (opts.q) params.set("q", opts.q);
    if (opts.page && opts.page > 1) params.set("page", String(opts.page));
    if (opts.sort) params.set("sort", opts.sort);

    const url = `/api/products${params.toString() ? `?${params.toString()}` : ""}`;

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    setProducts(data.ok ? data.products : []);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // React to prop changes (server-driven searchParams)
  useEffect(() => {
    loadProducts({
      catId: Number.isFinite(activeCategoryId as number) ? activeCategoryId : null,
      q,
      page,
      sort,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, q, page, sort]);

  const pushWithParams = (next: Partial<{ category: string; q: string; page: number; sort: string }>) => {
    const params = new URLSearchParams();

    const nextCategory = next.category ?? category;
    const nextQ = next.q ?? q;
    const nextPage = next.page ?? page;
    const nextSort = next.sort ?? sort;

    if (nextCategory) params.set("category", nextCategory);
    if (nextQ) params.set("q", nextQ);
    if (nextPage && nextPage > 1) params.set("page", String(nextPage));
    if (nextSort) params.set("sort", nextSort);

    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="mt-6">
      {/* Top filter: main categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => router.push("/products")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeCategoryId === null
              ? "bg-white text-black"
              : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
          }`}
        >
          All
        </button>

        {mainCats.map((c) => (
          <button
            key={c.id}
            onClick={() => pushWithParams({ category: String(c.id), page: 1 })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategoryId === c.id
                ? "bg-white text-black"
                : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="text-sm text-white/70">Loading products…</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                    <h2 className="text-base font-semibold leading-snug">{p.name}</h2>
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
        )}
      </div>
    </div>
  );
}
