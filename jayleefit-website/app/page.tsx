import Link from "next/link";
import FeatureBlock from "@/components/feature-block";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-dark-secondary to-dark py-20 md:py-32">
        <div className="container-max text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            Transform Your Body Through
            <span className="text-accent"> Transparent Macros</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Most fitness coaches hide their system. We show you exactly how it
            works. Macro tracking + daily check-ins = proven results.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/intake" className="btn-primary">
              Start Your Intake
            </Link>
            <Link href="/about" className="btn-secondary">
              Learn Our Methodology
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 md:py-24">
        <div className="container-max">
          <h2 className="text-4xl font-serif font-bold text-center mb-12">
            The Problem with Generic Coaching
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-4 text-lg text-gray-300">
                <li className="flex gap-3">
                  <span className="text-red-500">✗</span>
                  <span>Coaches tell you to "eat less," but never show the math</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500">✗</span>
                  <span>
                    You don't know if you're hitting your macros day to day
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500">✗</span>
                  <span>
                    Progress tracking is scattered across texts, videos, Discord
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500">✗</span>
                  <span>
                    You can't see the exact reason why progress slowed (or stalled)
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-dark-secondary p-8 rounded-lg border border-red-500/30">
              <p className="text-gray-300">
                <strong>Our clients report:</strong> "I finally understand why
                my macros matter." "Seeing my daily check-ins tracked made all
                the difference." "For the first time, I knew exactly what to
                eat."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-dark-secondary">
        <div className="container-max">
          <h2 className="text-4xl font-serif font-bold text-center mb-12">
            How the JayLeeFit System Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureBlock
              icon="📊"
              title="Transparent Macro Targets"
              description="We calculate your exact Protein / Carbs / Fat in grams and total calories. You see the math—every decision is data-driven."
            />
            <FeatureBlock
              icon="✓"
              title="Daily Check-ins"
              description="Log your weight, adherence, and how you felt each day. Real accountability—not once a month, every single day."
            />
            <FeatureBlock
              icon="📈"
              title="Progress Metrics"
              description="Track body composition, strength gains, and energy. See patterns nobody else shows you."
            />
          </div>
        </div>
      </section>

      {/* The Roadmap */}
      <section className="py-16 md:py-24">
        <div className="container-max">
          <h2 className="text-4xl font-serif font-bold text-center mb-12">
            Your Coaching Journey
          </h2>
          <div className="space-y-8">
            <div className="flex gap-8 items-start">
              <div className="bg-accent text-dark rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold mb-2">
                  Phase 1: Intake & Foundation
                </h3>
                <p className="text-gray-300">
                  Complete your intake form. We review your goals, current stats,
                  and lifestyle. You'll receive your custom macro prescription and
                  your first week's check-in template.
                </p>
              </div>
            </div>
            <div className="flex gap-8 items-start">
              <div className="bg-accent text-dark rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold mb-2">
                  Phase 2: Daily Logging via Telegram Bot (coming soon)
                </h3>
                <p className="text-gray-300">
                  Text your weight, adherence, and notes to our Telegram bot.
                  Data flows straight to your tracking dashboard. No spreadsheets.
                </p>
              </div>
            </div>
            <div className="flex gap-8 items-start">
              <div className="bg-accent text-dark rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold mb-2">
                  Phase 3: Full Client App (coming soon)
                </h3>
                <p className="text-gray-300">
                  View your macros, log weight, see progress charts, and get
                  real-time coaching adjustments in a dedicated app. Built on the
                  same transparent system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-accent text-dark">
        <div className="container-max text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Ready to Transform Your Body the Right Way?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Start your intake today. We'll build your custom macro plan and walk
            you through the system. No hype. Just data.
          </p>
          <Link href="/intake" className="btn-primary bg-dark text-accent hover:bg-dark-secondary border border-dark">
            Begin Your Intake
          </Link>
        </div>
      </section>
    </>
  );
}
