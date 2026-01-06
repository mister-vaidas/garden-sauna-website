"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { site } from "@/lib/site";

type Category = { id: number; name: string; slug: string; parent: number };
type Product = { id: number; name: string; slug: string };

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  const [cats, setCats] = useState<Category[]>([]);
  const [hotTubProducts, setHotTubProducts] = useState<Product[]>([]);
  const [accessoryProducts, setAccessoryProducts] = useState<Product[]>([]);

  // Known core structure (from your categories JSON)
  const SAUNAS_PARENT_ID = 16;
  const HOT_TUBS_PARENT_ID = 17;

  const closeTimer = useRef<NodeJS.Timeout | null>(null);
  const megaWrapRef = useRef<HTMLDivElement | null>(null);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };

  const scheduleCloseMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 150);
  };

  const closeMegaNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(false);
  };

  const accessoriesCategoryId = useMemo(() => {
    const accessories = cats.find((c) => c.slug === "accessories" && c.parent === 0);
    return accessories?.id ?? null;
  }, [cats]);

  const saunaSubcategories = useMemo(() => {
    return cats
      .filter((c) => c.parent === SAUNAS_PARENT_ID)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cats]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();
        if (data.ok) setCats(data.categories || []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    // Fetch hot tubs products for menu (top 12)
    (async () => {
      try {
        const res = await fetch(`/api/products?category=${HOT_TUBS_PARENT_ID}&per_page=12`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.ok) {
          setHotTubProducts(
            (data.products || []).map((p: any) => ({ id: p.id, name: p.name, slug: p.slug }))
          );
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!accessoriesCategoryId) return;

    (async () => {
      try {
        const res = await fetch(`/api/products?category=${accessoriesCategoryId}&per_page=12`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.ok) {
          setAccessoryProducts(
            (data.products || []).map((p: any) => ({ id: p.id, name: p.name, slug: p.slug }))
          );
        }
      } catch {}
    })();
  }, [accessoriesCategoryId]);

  // Close mega menu on Escape and click-outside
  useEffect(() => {
    if (!megaOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMegaNow();
    };

    const onPointerDown = (e: PointerEvent) => {
      const el = megaWrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) closeMegaNow();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [megaOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/10" />
          <span className="text-base font-semibold text-white">{site.name}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-white/80 hover:text-white">
            Home
          </Link>

          {/* Products mega menu */}
          <div
            ref={megaWrapRef}
            className="relative"
            onMouseEnter={openMega}
            onMouseLeave={scheduleCloseMega}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white"
              onClick={() => (megaOpen ? closeMegaNow() : openMega())}
              aria-haspopup="menu"
              aria-expanded={megaOpen}
            >
              Products <ChevronDown className="h-4 w-4" />
            </button>

            {megaOpen && (
              // IMPORTANT: no hover-gap. We use top-full + pt "bridge"
              <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3">
                <div className="w-[860px] rounded-2xl border border-white/10 bg-[#0b0b0c] p-6 shadow-xl">
                  <div className="grid grid-cols-12 gap-6">
                    {/* Column 1: Saunas with subcategories */}
                    <div className="col-span-5">
                      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                        Saunas
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {saunaSubcategories.map((c) => (
                          <Link
                            key={c.id}
                            href={`/products?category=${c.id}`}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
                            onClick={closeMegaNow}
                          >
                            {c.name}
                          </Link>
                        ))}
                        <Link
                          href={`/products?category=${SAUNAS_PARENT_ID}`}
                          className="col-span-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
                          onClick={closeMegaNow}
                        >
                          View all saunas →
                        </Link>
                      </div>
                    </div>

                    {/* Column 2: Hot Tubs (direct products) */}
                    <div className="col-span-4">
                      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                        Hot Tubs
                      </div>
                      <div className="space-y-2">
                        {hotTubProducts.length ? (
                          hotTubProducts.map((p) => (
                            <Link
                              key={p.id}
                              href={`/products/${p.slug}`}
                              className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
                              onClick={closeMegaNow}
                            >
                              {p.name}
                            </Link>
                          ))
                        ) : (
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                            No hot tubs added yet.
                          </div>
                        )}

                        <Link
                          href={`/products?category=${HOT_TUBS_PARENT_ID}`}
                          className="block rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
                          onClick={closeMegaNow}
                        >
                          View all hot tubs →
                        </Link>
                      </div>
                    </div>

                    {/* Column 3: Accessories (direct products) */}
                    <div className="col-span-3">
                      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                        Accessories
                      </div>
                      <div className="space-y-2">
                        {accessoriesCategoryId ? (
                          accessoryProducts.length ? (
                            accessoryProducts.map((p) => (
                              <Link
                                key={p.id}
                                href={`/products/${p.slug}`}
                                className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
                                onClick={closeMegaNow}
                              >
                                {p.name}
                              </Link>
                            ))
                          ) : (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                              Accessories coming soon.
                            </div>
                          )
                        ) : (
                          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                            Create “Accessories” category to show items here.
                          </div>
                        )}

                        <Link
                          href={accessoriesCategoryId ? `/products?category=${accessoriesCategoryId}` : "/products"}
                          className="block rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
                          onClick={closeMegaNow}
                        >
                          View all accessories →
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Bottom CTA bar */}
                  <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <div className="text-sm font-semibold text-white">Need help choosing?</div>
                      <div className="text-xs text-white/60">
                        Send a quote request and we’ll recommend the best option.
                      </div>
                    </div>
                    <Link
                      href="/quote"
                      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
                      onClick={closeMegaNow}
                    >
                      Get a Quote
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/contact" className="text-sm font-medium text-white/80 hover:text-white">
            Contact
          </Link>

          <Link
            href="/quote"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Get a Quote
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-black/90 md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <div className="flex flex-col gap-3">
              <Link onClick={() => setMobileOpen(false)} href="/" className="text-sm text-white/90">
                Home
              </Link>

              <details className="rounded-xl border border-white/10 bg-white/5 p-3">
                <summary className="cursor-pointer text-sm font-medium text-white/90">
                  Saunas
                </summary>
                <div className="mt-3 grid gap-2">
                  {saunaSubcategories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </details>

              <details className="rounded-xl border border-white/10 bg-white/5 p-3">
                <summary className="cursor-pointer text-sm font-medium text-white/90">
                  Hot Tubs
                </summary>
                <div className="mt-3 grid gap-2">
                  {hotTubProducts.slice(0, 8).map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80"
                    >
                      {p.name}
                    </Link>
                  ))}
                  <Link
                    href={`/products?category=${HOT_TUBS_PARENT_ID}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black"
                  >
                    View all hot tubs
                  </Link>
                </div>
              </details>

              <Link
                onClick={() => setMobileOpen(false)}
                href="/products"
                className="text-sm text-white/90"
              >
                Accessories (coming soon)
              </Link>

              <Link
                onClick={() => setMobileOpen(false)}
                href="/contact"
                className="text-sm text-white/90"
              >
                Contact
              </Link>

              <Link
                onClick={() => setMobileOpen(false)}
                href="/quote"
                className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
