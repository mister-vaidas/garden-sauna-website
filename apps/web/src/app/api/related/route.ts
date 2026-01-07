import { NextResponse } from "next/server";
import { wcGet } from "@/lib/woocommerce";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category"); // category id
    const exclude = searchParams.get("exclude");   // product id
    const perPage = Number(searchParams.get("per_page") || 6);

    const products = await wcGet<any[]>("/products", {
      per_page: Math.min(Math.max(perPage, 1), 20),
      status: "publish",
      ...(category ? { category } : {}),
      orderby: "date",
      order: "desc",
    });

    const filtered = products
      .filter((p: any) => String(p.id) !== String(exclude))
      .sort(() => Math.random() - 0.5)
      .slice(0, perPage)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        price_html: p.price_html,
        images: (p.images || []).map((img: any) => ({ src: img.src, alt: img.alt })),
      }));

    return NextResponse.json({ ok: true, products: filtered });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
