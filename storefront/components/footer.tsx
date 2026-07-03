import Link from "next/link";
import CrossPromoBanner from "./cross-promo-banner";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-xl tracking-wide">
            RE<span className="text-acid">:</span>UP
          </p>
          <p className="mt-2 max-w-xs font-mono text-xs text-mute">
            Deadstock deals. Pre-owned heat. Authenticated men&apos;s &amp; women&apos;s
            streetwear, priced to move.
          </p>
        </div>

        <div className="font-mono text-xs uppercase tracking-widest">
          <p className="mb-3 text-mute">Shop</p>
          <ul className="flex flex-col gap-2">
            <li><Link href="/shop?category=Men" className="hover:text-acid">Men</Link></li>
            <li><Link href="/shop?category=Women" className="hover:text-acid">Women</Link></li>
            <li><Link href="/shop?sale=1" className="hover:text-acid">Sale</Link></li>
            <li><Link href="/about" className="hover:text-acid">About</Link></li>
          </ul>
        </div>

        <div className="font-mono text-xs uppercase tracking-widest">
          <p className="mb-3 text-mute">Get the drops first</p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="email@domain.com"
              className="w-full border border-line bg-transparent px-3 py-2 text-paper placeholder:text-mute focus:border-acid focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 bg-acid px-3 py-2 font-bold text-ink"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <CrossPromoBanner />

      <div className="px-4 py-4 text-center font-mono text-[10px] uppercase tracking-widest text-mute sm:px-6">
        © {new Date().getFullYear()} RE:UP. All pieces pre-owned &amp; authenticated by hand.
      </div>
    </footer>
  );
}
