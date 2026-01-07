import ProductsGrid from "./ProductsGrid";

type SearchParams = Record<string, string | string[] | undefined>;

export default function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";

  const pageRaw = typeof searchParams.page === "string" ? searchParams.page : "1";
  const pageNum = Number(pageRaw);
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const category =
    typeof searchParams.category === "string" ? searchParams.category : "";

  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Products</h1>
        <p className="mt-2 text-sm text-white/70">
          Browse saunas, hot tubs and accessories.
        </p>
      </div>

      <ProductsGrid
        q={q}
        page={page}
        category={category}
        sort={sort}
      />
    </main>
  );
}
