import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

/**
 * Stripe webhook — verifies the signature and logs completed orders.
 *
 * There is no database or Google Sheets write-back wired up yet, so nothing
 * here marks an item "sold" automatically. Until that's built, treat this
 * log line as your cue to flip the item's "In Stock" column to N by hand.
 * (Automating that write is a natural next step: it needs a Google service
 * account with edit access to the sheet, not just the read-only CSV export
 * this storefront uses today.)
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 400 }
    );
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(
      `[Old Light] Order paid — session ${session.id}, total ${
        (session.amount_total ?? 0) / 100
      } ${session.currency?.toUpperCase()}. Mark the purchased SKU(s) sold in the inventory sheet.`
    );
  }

  return NextResponse.json({ received: true });
}
