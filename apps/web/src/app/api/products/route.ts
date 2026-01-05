import { NextResponse } from "next/server";
import { wcGet } from "@/lib/woocommerce";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Optional filters
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const perPage = Number(searchParams.get("per_page") || 24);

    const products = await wcGet<any[]>("/products", {
      per_page: Math.min(Math.max(perPage, 1), 100),
      status: "publish",
      ...(category ? { category } : {}),
      ...(search ? { search } : {}),
      orderby: "date",
      order: "desc",
    });

    return NextResponse.json({ ok: true, count: products.length, products });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
