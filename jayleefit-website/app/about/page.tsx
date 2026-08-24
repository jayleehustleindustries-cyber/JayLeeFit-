import Link from "next/link";

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-dark-secondary to-dark py-16 md:py-24">
        <div className="container-max text-center">
          <h1 className="text-5xl font-serif font-bold mb-6">
            About <span className="text-accent">JayLeeFit</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A transparent approach to fitness coaching, rooted in data and
            accountability.
          </p>
        </div>
      </section>

      {/* Coach Bio */}
      <section className="py-16 md:py-24">
        <div className="container-max grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-dark-secondary rounded-lg p-8 border border-accent/20 flex items-center justify-center">
            <div className="text-6xl">💪</div>
          </div>
          <div>
            <h2 className="text-4xl font-serif font-bold mb-6">Meet Jay Lee</h2>
            <p className="text-gray-300 mb-4">
              With years of hands-on coaching experience, Jay has helped dozens
              of clients achieve measurable body transformations. But frustrated
              with the lack of transparency in the coaching industry, Jay built
              a system that shows exactly how macros, daily tracking, and
              accountability drive results.
            </p>
            <p className="text-gray-300 mb-4">
              <strong>The philosophy:</strong> Your coach shouldn't hide the
              playbook. You should see every number, understand every decision,
              and own your transformation.
            </p>
            <p className="text-gray-300">
              That's why every JayLeeFit client gets a clear macro prescription,
              daily check-in cadence, and real-time progress tracking. No
              guessing. No shortcuts. Just results.
            </p>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 md:py-24 bg-dark-secondary">
        <div className="container-max">
          <h2 className="text-4xl font-serif font-bold mb-12 text-center">
            The JayLeeFit Methodology
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-dark p-6 rounded-lg border border-accent/30">
              <h3 className="text-2xl font-serif font-bold text-accent mb-4">
                1. Macro Prescription (Protein / Carbs / Fat)
              </h3>
              <p className="text-gray-300 mb-3">
                We don't say "eat less." We calculate your exact daily targets:
              </p>
              <div className="bg-dark-secondary p-4 rounded text-sm font-mono text-accent mb-3">
                <div>Protein: X grams (4 kcal/g)</div>
                <div>Carbs: Y grams (4 kcal/g)</div>
                <div>Fat: Z grams (9 kcal/g)</div>
                <div className="mt-2 border-t border-accent/30 pt-2">
                  Total Daily Calories = (P × 4) + (C × 4) + (F × 9)
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Your macros adjust every 4–6 weeks based on progress, energy,
                and adherence.
              </p>
            </div>

            <div className="bg-dark p-6 rounded-lg border border-accent/30">
              <h3 className="text-2xl font-serif font-bold text-accent mb-4">
                2. Daily Check-ins & Accountability
              </h3>
              <p className="text-gray-300 mb-3">
                Every morning (or evening), you log:
              </p>
              <ul className="space-y-2 text-gray-300 mb-3">
                <li>✓ Current weight</li>
                <li>✓ Yesterday's adherence (% of macros hit)</li>
                <li>✓ Energy level & how you felt</li>
                <li>✓ Any notes (sleep, stress, digestion)</li>
              </ul>
              <p className="text-gray-300 text-sm">
                This isn't busywork. The data reveals patterns: when you hit
                your macros, does your energy improve? Does consistency lead to
                steady weight loss? We extract signal from the noise.
              </p>
            </div>

            <div className="bg-dark p-6 rounded-lg border border-accent/30">
              <h3 className="text-2xl font-serif font-bold text-accent mb-4">
                3. Progress Tracking & Adjustments
              </h3>
              <p className="text-gray-300 mb-3">
                Every 4–6 weeks, we review:
              </p>
              <ul className="space-y-2 text-gray-300 mb-3">
                <li>• Average weekly weight change</li>
                <li>• Body composition trends (if photos/measurements available)</li>
                <li>• Adherence patterns</li>
                <li>• Energy & subjective feedback</li>
              </ul>
              <p className="text-gray-300 text-sm">
                Based on this, we tweak your macros up, down, or sideways. No
                guesswork. Pure data.
              </p>
            </div>

            <div className="bg-dark p-6 rounded-lg border border-accent/30">
              <h3 className="text-2xl font-serif font-bold text-accent mb-4">
                The Difference
              </h3>
              <p className="text-gray-300">
                Traditional coaching: "You need to eat cleaner and train harder."
                <br />
                JayLeeFit: "Your macros are P180g / C250g / F60g = 2,100 kcal.
                Last week you hit 87% adherence. Your weight is steady. Let's
                drop carbs by 20g and retest in 2 weeks."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Works */}
      <section className="py-16 md:py-24">
        <div className="container-max">
          <h2 className="text-4xl font-serif font-bold mb-12 text-center">
            Why This System Works
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-dark-secondary p-8 rounded-lg border border-accent/20">
              <h3 className="text-xl font-serif font-bold text-accent mb-4">
                ✓ You Know the Plan
              </h3>
              <p className="text-gray-300">
                No mystery. You see your exact targets and understand why they
                matter for your goals.
              </p>
            </div>
            <div className="bg-dark-secondary p-8 rounded-lg border border-accent/20">
              <h3 className="text-xl font-serif font-bold text-accent mb-4">
                ✓ Accountability Works
              </h3>
              <p className="text-gray-300">
                Daily logging keeps you present. You see the correlation between
                effort and results, which reinforces behavior.
              </p>
            </div>
            <div className="bg-dark-secondary p-8 rounded-lg border border-accent/20">
              <h3 className="text-xl font-serif font-bold text-accent mb-4">
                ✓ You Own the Data
              </h3>
              <p className="text-gray-300">
                Your progress is measurable, shareable, and truly yours. You're
                not dependent on a coach's "gut feeling."
              </p>
            </div>
            <div className="bg-dark-secondary p-8 rounded-lg border border-accent/20">
              <h3 className="text-xl font-serif font-bold text-accent mb-4">
                ✓ Adjustments Are Evidence-Based
              </h3>
              <p className="text-gray-300">
                When progress stalls, we don't guess. We review the data and
                make targeted changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-accent text-dark">
        <div className="container-max text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Ready to See the System in Action?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Book your intake today. Let's build your custom macro plan and get
            you started.
          </p>
          <Link
            href="/intake"
            className="btn-primary bg-dark text-accent hover:bg-dark-secondary border border-dark"
          >
            Start Your Intake
          </Link>
        </div>
      </section>
    </>
  );
}
