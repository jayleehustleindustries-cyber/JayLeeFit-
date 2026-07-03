import Link from "next/link";
import { getStripe } from "@/lib/stripe";
import ClearCartOnMount from "@/components/clear-cart-on-mount";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  let amountTotal: number | null = null;
  let email: string | null = null;

  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      amountTotal = session.amount_total ? session.amount_total / 100 : null;
      email = session.customer_details?.email ?? null;
    } catch {
      // session lookup is best-effort — still show the confirmation
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <ClearCartOnMount />
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Order confirmed</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-wide">SOLD. IT&apos;S YOURS.</h1>
      <p className="mt-4 max-w-md font-sans text-sm text-ash">
        {amountTotal
          ? `We charged ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amountTotal)}. `
          : ""}
        {email ? `A receipt is on the way to ${email}. ` : ""}
        Since every piece is one-off, it&apos;s already pulled from the shop — packed and
        shipping soon.
      </p>
      <Link
        href="/shop"
        className="mt-8 bg-gold px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-void hover:opacity-90"
      >
        Keep Browsing
      </Link>
    </div>
  );
}
