import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Premium Garden Saunas & Hot Tubs — Delivered & Installed
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/70">
              Choose from our best-selling saunas, hot tubs and accessories. Get expert advice,
              fast quotes, and professional installation across the UK.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quote"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                Get a Quote
              </Link>
              <Link
                href="/products"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Browse Products
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-white/60">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white">Fast delivery</div>
                <div>UK-wide options</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white">Expert guidance</div>
                <div>Friendly support</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white">Installation</div>
                <div>Professional team</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className="flex h-full items-center justify-center text-white/50">
                Hero image (replace later)
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-6 -left-6 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -top-6 -right-6 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
