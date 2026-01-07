import ProductsGrid from "./ProductsGrid";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const sp = await searchParams;

  const category = typeof sp.category === "string" ? sp.category : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "";

  const pageRaw = typeof sp.page === "string" ? sp.page : "1";
  const pageNum = Number(pageRaw);
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Products</h1>
        <p className="mt-2 text-sm text-white/70">
          Browse saunas, hot tubs and accessories.
        </p>
      </div>

      <ProductsGrid category={category} q={q} sort={sort} page={page} />
    </main>
  );
}
