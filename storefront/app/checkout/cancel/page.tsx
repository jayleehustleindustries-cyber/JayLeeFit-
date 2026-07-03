import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-warning">Checkout canceled</p>
      <h1 className="mt-4 font-display text-4xl tracking-wide">STILL IN YOUR CART.</h1>
      <p className="mt-4 max-w-md font-sans text-sm text-mute">
        Nothing was charged. Your cart is still saved — but these are one-off pieces,
        so don&apos;t sit on it too long.
      </p>
      <Link
        href="/shop"
        className="mt-8 bg-acid px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-ink hover:opacity-90"
      >
        Back To Shop
      </Link>
    </div>
  );
}
