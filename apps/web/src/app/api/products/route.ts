import { NextResponse } from "next/server";
import { wcGet } from "@/lib/woocommerce";

export async function GET() {
  try {
    // Pull a small set first to test the pipeline
    const products = await wcGet<any[]>("/products", {
      per_page: 12,
      status: "publish",
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
