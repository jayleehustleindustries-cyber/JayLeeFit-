'use client';

import { useState } from 'react';
import ApplyForm from './components/apply-form';
import AIEngine from './components/ai-engine';

export default function Home() {
  const [formComplete, setFormComplete] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleFormComplete = () => {
    setFormComplete(true);
    const investmentSection = document.getElementById('investment');
    if (investmentSection) {
      setTimeout(() => {
        investmentSection.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black/50 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center space-y-6">
            <div className="space-y-4 mb-8">
              <h1 className="text-6xl md:text-7xl font-bold operator-accent leading-tight">
                MAO Methodology
              </h1>
              <p className="text-xl md:text-2xl text-gray-300">
                Macro Optimization for Elite Performance
              </p>
            </div>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Transform your physique and performance through precision macro optimization.
              Get personalized coaching from Coach Jay, powered by advanced AI analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <a
                href="#apply"
                className="btn btn-primary"
              >
                Apply for a Package
              </a>
              <a
                href="#ai-engine"
                className="btn btn-secondary"
              >
                Explore AI Engine
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-black/50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center operator-accent mb-16">
            What's Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '📊',
                title: 'Macro Analysis',
                desc: 'Personalized macro calculations based on your goals, metabolism, and activity level.',
              },
              {
                icon: '🤖',
                title: 'AI-Powered Insights',
                desc: 'Real-time AI recommendations for optimization and progress tracking.',
              },
              {
                icon: '👨‍🏫',
                title: 'Expert Coaching',
                desc: 'Direct access to Coach Jay for guidance, accountability, and adjustments.',
              },
              {
                icon: '📈',
                title: 'Progress Tracking',
                desc: 'Advanced analytics dashboard showing your transformation journey.',
              },
              {
                icon: '🎯',
                title: 'Custom Protocols',
                desc: 'Tailored training and nutrition protocols specific to your body type.',
              },
              {
                icon: '🔄',
                title: 'Continuous Optimization',
                desc: 'Regular adjustments and fine-tuning as your body responds.',
              },
            ].map((service, i) => (
              <div
                key={i}
                className="group bg-gradient-to-br from-slate-900/50 to-slate-800/50 border operator-border rounded-lg p-8 hover:border-cyan-400/50 transition-all hover:operator-glow"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply Section */}
      <section id="apply" className="bg-black/70 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center operator-accent mb-4">
            Apply for a Package
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Complete this application to unlock pricing and get connected with Coach Jay.
            Once all phases are complete, your personalized package options will be revealed.
          </p>
          <div className="max-w-2xl mx-auto">
            <ApplyForm
              onComplete={handleFormComplete}
              showPricing={formComplete}
            />
          </div>
        </div>
      </section>

      {/* Investment / Pricing Section */}
      <section id="investment" className={`transition-all duration-500 ${formComplete ? 'bg-black/50 py-20' : 'bg-black/30 py-0'}`}>
        {formComplete ? (
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center operator-accent mb-4">
              Investment Packages
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
              Based on your application, here are your personalized options.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Starter',
                  price: '$297',
                  period: '/month',
                  features: [
                    'Initial macro calculation',
                    'AI Engine access',
                    'Monthly check-in',
                    'Email support',
                  ],
                },
                {
                  name: 'Elite',
                  price: '$597',
                  period: '/month',
                  featured: true,
                  features: [
                    'Complete macro optimization',
                    'Unlimited AI Engine',
                    'Bi-weekly coaching calls',
                    'Custom training protocol',
                    'Priority support',
                  ],
                },
                {
                  name: 'Premium',
                  price: '$997',
                  period: '/month',
                  features: [
                    'All Elite features',
                    'Weekly 1-on-1 coaching',
                    'Video form reviews',
                    'Personalized meal planning',
                    '24/7 chat support',
                  ],
                },
              ].map((pkg, i) => (
                <div
                  key={i}
                  className={`relative rounded-lg border transition-all ${
                    pkg.featured
                      ? 'bg-gradient-to-br from-cyan-400/20 to-amber-400/10 border-cyan-400/50 scale-105 operator-glow'
                      : 'bg-slate-900/50 border-operator-border hover:border-cyan-400/30'
                  } p-8`}
                >
                  {pkg.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold operator-accent">{pkg.price}</span>
                    <span className="text-gray-400">{pkg.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3 text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className={`btn w-full ${pkg.featured ? 'btn-primary' : 'btn-tertiary'}`}>
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-6 py-8 text-center">
            <p className="text-gray-400">
              ✓ Complete your application above to unlock pricing →
            </p>
          </div>
        )}
      </section>

      {/* Sample Split Section */}
      <section id="sample-split" className="bg-black/70 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center operator-accent mb-4">
            Sample Split
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Here's a typical weekly training split following MAO principles.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border operator-border rounded-lg p-8 space-y-4">
              <h3 className="text-xl font-bold text-cyan-400 mb-6">Weekly Training Schedule</h3>
              {[
                { day: 'Monday', focus: 'Chest & Triceps', macros: 'Caloric Surplus' },
                { day: 'Tuesday', focus: 'Back & Biceps', macros: 'Caloric Surplus' },
                { day: 'Wednesday', focus: 'Legs & Core', macros: 'High Carb' },
                { day: 'Thursday', focus: 'Shoulders & Traps', macros: 'Caloric Surplus' },
                { day: 'Friday', focus: 'Accessory & Conditioning', macros: 'Maintenance' },
                { day: 'Saturday', focus: 'Full Body Compound', macros: 'High Protein' },
                { day: 'Sunday', focus: 'Rest/Recovery', macros: 'Light Activity' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between p-3 rounded border border-slate-700 hover:border-cyan-400/50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-white">{item.day}</p>
                    <p className="text-sm text-gray-400">{item.focus}</p>
                  </div>
                  <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded">
                    {item.macros}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border operator-border rounded-lg p-8 space-y-6">
              <h3 className="text-xl font-bold text-amber-400 mb-6">Macro Optimization Strategy</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-white mb-2">Protein (40%)</p>
                  <p className="text-sm text-gray-400">Prioritized across all days for muscle synthesis and recovery.</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-2">Carbs (45%)</p>
                  <p className="text-sm text-gray-400">Strategically timed around training for energy and recovery.</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-2">Fats (15%)</p>
                  <p className="text-sm text-gray-400">Essential fatty acids for hormone production and health.</p>
                </div>
              </div>
              <div className="bg-cyan-400/10 border border-cyan-400/30 rounded p-4 mt-6">
                <p className="text-cyan-400 text-sm font-medium">
                  💡 These macros are adjusted based on your individual metrics, goals, and response.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Engine Section */}
      <section id="ai-engine" className="bg-black/50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center operator-accent mb-4">
            AI-Powered Engine
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Leverage advanced AI to optimize your training and nutrition in real-time.
          </p>
          <div className="max-w-3xl mx-auto">
            <AIEngine showEngine={true} />
          </div>
        </div>
      </section>

      {/* Coach Jay Section */}
      <section id="coach-jay" className="bg-black/70 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center operator-accent mb-12">
            Meet Coach Jay
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border operator-border rounded-lg p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💪</div>
                <p className="text-gray-400">Photo coming soon</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-white mb-4">Jay Lee</h3>
                <p className="text-cyan-400 font-semibold mb-6">Elite Fitness Coach & Macro Optimization Specialist</p>
              </div>
              <p className="text-gray-300 leading-relaxed">
                With over 10 years of experience in competitive bodybuilding and strength training,
                Coach Jay has helped hundreds of clients achieve their fitness goals through precision
                macro optimization and evidence-based training methodology.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Coach Jay's signature MAO (Macro Optimization) methodology combines cutting-edge sports
                nutrition science with personalized coaching to deliver consistent, measurable results.
                Every client receives a completely customized approach based on their genetics, lifestyle,
                and goals.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="bg-cyan-400/10 border border-cyan-400/30 rounded p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-400">500+</p>
                  <p className="text-xs text-gray-400 mt-1">Clients Transformed</p>
                </div>
                <div className="bg-amber-400/10 border border-amber-400/30 rounded p-4 text-center">
                  <p className="text-2xl font-bold text-amber-400">10+</p>
                  <p className="text-xs text-gray-400 mt-1">Years Experience</p>
                </div>
                <div className="bg-cyan-400/10 border border-cyan-400/30 rounded p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-400">98%</p>
                  <p className="text-xs text-gray-400 mt-1">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof / Testimonials Section */}
      <section id="proof" className="bg-black/50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center operator-accent mb-4">
            Proof in Results
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Real transformations from real clients following the MAO Methodology.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Michael R.',
                result: '+15 lbs Muscle, -8 lbs Fat',
                timeframe: 'In 12 Weeks',
                quote: 'The macro precision changed everything. I finally had a system that worked.',
              },
              {
                name: 'Sarah M.',
                result: '-22 lbs Fat, Visible Abs',
                timeframe: 'In 16 Weeks',
                quote: 'Coach Jay\'s personalized approach made nutrition simple and sustainable.',
              },
              {
                name: 'David K.',
                result: '+45 lbs on Lifts, Leaner',
                timeframe: 'In 12 Weeks',
                quote: 'The AI Engine helped me dial in every detail. My best transformation yet.',
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border operator-border rounded-lg p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-amber-400">★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="border-t operator-border pt-4">
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-cyan-400 font-semibold text-sm mb-1">{testimonial.result}</p>
                  <p className="text-gray-400 text-sm">{testimonial.timeframe}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="bg-black/70 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center operator-accent mb-12">
            Gallery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-slate-900/50 to-slate-800/50 border operator-border rounded-lg flex items-center justify-center hover:border-cyan-400/50 transition-all hover:operator-glow group"
              >
                <div className="text-center">
                  <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">📸</div>
                  <p className="text-gray-400 text-sm">Photo {i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pay Invoice Section */}
      <section id="pay-invoice" className="bg-black/50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center operator-accent mb-4">
            Payments & Invoices
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Manage your billing and payments securely.
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border operator-border rounded-lg p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded border border-slate-700 hover:border-cyan-400/30 transition-colors cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Invoice #INV-2026-001</p>
                    <p className="text-sm text-gray-400">Due: July 31, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cyan-400">$597.00</p>
                    <p className="text-xs text-amber-400">Pending</p>
                  </div>
                </div>
              </div>
              <div className="bg-cyan-400/10 border border-cyan-400/30 rounded p-4">
                <p className="text-sm text-gray-300 mb-3">
                  💳 Accepted payment methods:
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>✓ Credit/Debit Card (Stripe)</li>
                  <li>✓ ACH Bank Transfer</li>
                  <li>✓ Crypto (Bitcoin, Ethereum)</li>
                </ul>
              </div>
              <button className="btn btn-primary w-full">
                View & Pay Invoice
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-black/70 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center operator-accent mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'How long until I see results?',
                a: 'Most clients see visible changes within 4-6 weeks with consistent adherence to the protocol. Significant transformations typically occur within 8-12 weeks.',
              },
              {
                q: 'Do I need supplements?',
                a: 'Supplements are not required, but we recommend a quality multivitamin, protein powder, and omega-3s to support your goals. Coach Jay will provide specific recommendations.',
              },
              {
                q: 'What if I have dietary restrictions?',
                a: 'The MAO methodology is completely customizable. We accommodate vegetarian, vegan, keto, and any other dietary preferences or allergies.',
              },
              {
                q: 'Can I combine this with other training?',
                a: 'Yes, the system is flexible. We can integrate with your existing training if needed, though our sample split is optimized for MAO results.',
              },
              {
                q: 'What if my schedule changes?',
                a: 'Your protocol adjusts with you. Coach Jay provides ongoing support and can modify your plan based on life changes, injuries, or schedule shifts.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border operator-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full px-8 py-4 flex items-center justify-between hover:bg-cyan-400/5 transition-colors text-left"
                >
                  <p className="font-semibold text-white pr-4">{item.q}</p>
                  <span className="text-cyan-400 flex-shrink-0">
                    {expandedFaq === i ? '−' : '+'}
                  </span>
                </button>
                {expandedFaq === i && (
                  <div className="px-8 py-4 border-t operator-border bg-black/30">
                    <p className="text-gray-300">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
