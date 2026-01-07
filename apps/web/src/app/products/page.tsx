import ProductsGrid from "./ProductsGrid";

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Products</h1>
        <p className="mt-2 text-sm text-white/70">
          Browse saunas, hot tubs and accessories.
        </p>
      </div>

      <ProductsGrid />
    </main>
  );
}
