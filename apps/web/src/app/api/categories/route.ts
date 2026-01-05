import { NextResponse } from "next/server";
import { wcGet } from "@/lib/woocommerce";

export async function GET() {
  try {
    const categories = await wcGet<any[]>("/products/categories", {
      per_page: 50,
      hide_empty: true,
    });

    return NextResponse.json({ ok: true, categories });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
