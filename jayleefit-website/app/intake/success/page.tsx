import Link from "next/link";

export default function SuccessPage() {
  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || "https://oldlight.shop";
  const showStorefront = process.env.NEXT_PUBLIC_SHOW_STOREFRONT_PROMO === "true";

  return (
    <section className="py-24 md:py-32 flex items-center">
      <div className="container-max text-center max-w-2xl mx-auto">
        <div className="text-6xl mb-6">✓</div>

        <h1 className="text-5xl font-serif font-bold mb-6">
          Your Intake is <span className="text-accent">Received</span>
        </h1>

        <p className="text-xl text-gray-300 mb-8">
          Thank you for completing your intake form. We've received all your
          information and will review it within 24 hours.
        </p>

        <div className="bg-dark-secondary border border-accent/30 rounded-lg p-8 mb-8">
          <h2 className="text-lg font-serif font-bold text-accent mb-4">
            What Happens Now
          </h2>
          <ul className="text-gray-300 space-y-3 text-left">
            <li className="flex gap-3">
              <span className="text-accent">→</span>
              <span>
                We'll review your goals, current stats, and fitness background.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent">→</span>
              <span>
                We'll calculate your custom macro targets (Protein / Carbs / Fat
                in grams + total daily calories).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent">→</span>
              <span>
                You'll receive an email with your plan and your first week's
                check-in template.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent">→</span>
              <span>We'll onboard you to the Telegram bot for daily logging.</span>
            </li>
          </ul>
        </div>

        <p className="text-gray-400 mb-8">
          Questions? Reply to the email or reach out to
          <a
            href="mailto:jayleehustle.industries@gmail.com"
            className="text-accent hover:underline ml-1"
          >
            jayleehustle.industries@gmail.com
          </a>
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          {showStorefront && (
            <Link href={storefrontUrl} className="btn-secondary">
              Explore Old Light
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
