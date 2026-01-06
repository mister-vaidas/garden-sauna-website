export default function Reviews() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Customer reviews</h2>
            <p className="mt-2 text-sm text-white/60">
              Real Google reviews will appear here (we’ll integrate next).
            </p>
          </div>
          <div className="text-sm text-white/70">
            ⭐⭐⭐⭐⭐ <span className="text-white/60">4.9 average</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            "Excellent service and quality. Installation was smooth and quick.",
            "Great advice before purchase. The sauna is amazing.",
            "Fast delivery and professional team. Highly recommended!",
          ].map((t, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-sm text-white/80">{t}</div>
              <div className="mt-4 text-xs text-white/50">Google review</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
