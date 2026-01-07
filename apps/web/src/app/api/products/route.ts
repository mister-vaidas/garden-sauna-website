import { NextResponse } from "next/server";
import { wcGet } from "@/lib/woocommerce";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const perPage = Number(searchParams.get("per_page") || 24);
    const orderby = searchParams.get("orderby") || "date"; // date | popularity | title | price
    const order = (searchParams.get("order") || "desc") as "asc" | "desc";

    const products = await wcGet<any[]>("/products", {
      per_page: Math.min(Math.max(perPage, 1), 100),
      status: "publish",
      ...(category ? { category } : {}),
      ...(search ? { search } : {}),
      orderby,
      order,
    });

    // Optional "random" shuffle on the server (useful for related)
    const random = searchParams.get("random") === "1";
    const finalProducts = random ? [...products].sort(() => Math.random() - 0.5) : products;

    // Return only what UI needs (lighter responses)
    const mapped = finalProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      price_html: p.price_html,
      images: (p.images || []).map((img: any) => ({ src: img.src, alt: img.alt })),
      categories: (p.categories || []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
    }));

    return NextResponse.json({ ok: true, count: mapped.length, products: mapped });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
