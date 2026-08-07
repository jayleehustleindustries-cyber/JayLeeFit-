"use client";

import { useRouter } from "next/navigation";
import IntakeForm from "@/components/intake-form";

export default function IntakePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/intake/success");
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-dark-secondary to-dark py-16 md:py-24">
        <div className="container-max text-center">
          <h1 className="text-5xl font-serif font-bold mb-6">
            Begin Your <span className="text-accent">Transformation</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Tell us about your fitness goals. We'll create your custom macro
            plan and get you started.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24">
        <div className="container-max max-w-2xl">
          <div className="bg-dark-secondary border border-accent/20 rounded-lg p-8 md:p-12">
            <IntakeForm onSuccess={handleSuccess} />
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="py-16 md:py-24 bg-dark-secondary">
        <div className="container-max max-w-3xl">
          <h2 className="text-3xl font-serif font-bold mb-8 text-center">
            What Happens Next
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="font-serif font-bold text-accent mb-2">
                1. We Review Your Intake
              </h3>
              <p className="text-gray-300">
                Within 24 hours, we'll review your goals and current stats.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-serif font-bold text-accent mb-2">
                2. Custom Macro Plan
              </h3>
              <p className="text-gray-300">
                You'll receive your exact P/F/C targets and total daily calories.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="font-serif font-bold text-accent mb-2">
                3. Start Logging
              </h3>
              <p className="text-gray-300">
                Begin your daily check-ins. We'll monitor your progress together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="container-max max-w-3xl">
          <h2 className="text-3xl font-serif font-bold mb-8 text-center">
            FAQ
          </h2>
          <div className="space-y-6">
            <div className="bg-dark-secondary p-6 rounded-lg border border-accent/20">
              <h3 className="text-lg font-serif font-bold text-accent mb-3">
                How quickly will I see results?
              </h3>
              <p className="text-gray-300">
                Most clients see measurable changes within 3–4 weeks of
                consistent macro tracking and daily adherence. Long-term
                transformation typically takes 12–16 weeks, depending on your
                starting point and goals.
              </p>
            </div>
            <div className="bg-dark-secondary p-6 rounded-lg border border-accent/20">
              <h3 className="text-lg font-serif font-bold text-accent mb-3">
                Do I need to count every gram of food?
              </h3>
              <p className="text-gray-300">
                Not perfectly. We aim for 80–90% accuracy with common food
                scales and app estimates. The goal is consistency and learning,
                not obsession.
              </p>
            </div>
            <div className="bg-dark-secondary p-6 rounded-lg border border-accent/20">
              <h3 className="text-lg font-serif font-bold text-accent mb-3">
                What if my schedule changes or I travel?
              </h3>
              <p className="text-gray-300">
                Your macros are flexible. We adjust based on your lifestyle. If
                you're traveling or your routine shifts, we modify the plan to
                keep you on track without unnecessary stress.
              </p>
            </div>
            <div className="bg-dark-secondary p-6 rounded-lg border border-accent/20">
              <h3 className="text-lg font-serif font-bold text-accent mb-3">
                What if I plateau?
              </h3>
              <p className="text-gray-300">
                Plateaus are normal. When progress stalls, we examine your data:
                adherence, sleep, stress, and training. We then adjust your
                macros strategically to restart progress.
              </p>
            </div>
            <div className="bg-dark-secondary p-6 rounded-lg border border-accent/20">
              <h3 className="text-lg font-serif font-bold text-accent mb-3">
                Is this just a diet plan?
              </h3>
              <p className="text-gray-300">
                No. This is a complete system combining macro strategy, daily
                accountability, and data-driven adjustments. Training and
                recovery matter too, and we factor them into your plan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
