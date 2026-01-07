"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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

export default function ProductsGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get("category");
  const activeCategoryId = categoryParam ? Number(categoryParam) : null;

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

  async function loadProducts(catId?: number | null) {
    setLoading(true);
    const url = catId ? `/api/products?category=${catId}` : `/api/products`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    setProducts(data.ok ? data.products : []);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // React to URL changes (mega menu, back/forward)
  useEffect(() => {
    loadProducts(activeCategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryParam]);

  return (
    <div className="mt-6">
      {/* Top filter: main categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => router.push("/products")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeCategoryId === null ? "bg-white text-black" : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
          }`}
        >
          All
        </button>

        {mainCats.map((c) => (
          <button
            key={c.id}
            onClick={() => router.push(`/products?category=${c.id}`)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategoryId === c.id ? "bg-white text-black" : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
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
