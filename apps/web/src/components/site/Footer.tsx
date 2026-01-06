import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-white/10" />
              <div className="text-base font-semibold text-white">{site.name}</div>
            </div>
            <p className="mt-3 text-sm text-white/60">
              Premium garden saunas and hot tubs — supplied, delivered and installed with care.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">Shop</div>
            <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
              <Link href="/products" className="hover:text-white">All products</Link>
              <Link href="/quote" className="hover:text-white">Get a quote</Link>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">Company</div>
            <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
              <Link href="/contact" className="hover:text-white">Contact</Link>
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">Contact</div>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              <div>{site.address}</div>
              <div>{site.phone}</div>
              <div>{site.email}</div>
              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
                We aim to respond to quote requests within 24 hours.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} {site.name}. All rights reserved.</div>
          <div>Built by EMPEX DIGITAL LTD</div>
        </div>
      </div>
    </footer>
  );
}
