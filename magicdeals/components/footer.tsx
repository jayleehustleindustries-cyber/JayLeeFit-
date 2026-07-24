import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-velvet-deep">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-lg font-bold text-foil">MAGICDEALS 007</p>
          <p className="mt-2 text-sm leading-relaxed text-fog">
            One-of-one secondhand finds, inspected and graded like a card
            trick. When it sells, it vanishes.
          </p>
        </div>

        <div className="font-mono text-xs uppercase tracking-widest">
          <p className="mb-3 text-goldbright">Table of contents</p>
          <ul className="space-y-2 text-fog">
            <li>
              <Link href="/shop" className="hover:text-bone">
                The Vault
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-bone">
                The Trick
              </Link>
            </li>
          </ul>
        </div>

        <div className="font-mono text-xs uppercase tracking-widest">
          <p className="mb-3 text-goldbright">Also dealing on</p>
          <ul className="space-y-2 text-fog">
            <li>Poshmark</li>
            <li>eBay</li>
            <li>Mercari</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line px-4 py-4 text-center font-mono text-[10px] uppercase tracking-widest text-fog">
        © {new Date().getFullYear()} MagicDeals 007 · Every deal disappears
        eventually
      </div>
    </footer>
  );
}
