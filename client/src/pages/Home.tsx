import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import ReactMarkdown from "react-markdown";

// ── Versioned campaign assets served with the application ──────────────────
const ASSETS = {
  coachPortrait: "/images/coach-jay-mao.jpg",
  galleryOperatorFocus: "/images/operator-focus.jpg",
  galleryAbsoluteFocus: "/images/absolute-focus.jpg",
  galleryTheVisionary: "/images/the-visionary.jpg",
};

// ── Training split data ──────────────────────────────────────────────────────
const TRAINING_SPLIT = [
  {
    day: "MON", label: "UPPER BODY — PUSH", muscles: "Chest, Shoulders, Triceps", count: 8,
    lifts: [
      { exercise: "Barbell Bench Press", sets: 4, reps: "6–8", rest: "2 min", note: "Primary strength movement — control the descent, 2 sec down" },
      { exercise: "Incline Dumbbell Press", sets: 4, reps: "10–12", rest: "90s", note: "Feel the upper chest stretch at the bottom of every rep" },
      { exercise: "Cable Chest Fly", sets: 3, reps: "12–15", rest: "60s", note: "Full stretch and squeeze — don't rush these" },
      { exercise: "Overhead Dumbbell Press", sets: 4, reps: "10–12", rest: "90s", note: "Keep core braced, don't arch the lower back" },
      { exercise: "Cable Lateral Raises", sets: 4, reps: "15–20", rest: "45s", note: "Light weight, full range — these build width" },
      { exercise: "Rear Delt Cable Fly", sets: 3, reps: "15", rest: "45s", note: "Elbows slightly bent, lead with the elbows" },
      { exercise: "Tricep Rope Pushdowns", sets: 4, reps: "12–15", rest: "60s", note: "Squeeze hard at the bottom, full extension" },
      { exercise: "Overhead Tricep Extension", sets: 3, reps: "12", rest: "60s", note: "Long head emphasis — keep elbows tight" },
    ]
  },
  {
    day: "TUE", label: "LOWER BODY — SQUAT", muscles: "Quads, Glutes, Hamstrings", count: 7,
    lifts: [
      { exercise: "Barbell Back Squat", sets: 4, reps: "5–6", rest: "2.5 min", note: "Top strength slot of the week — brace hard, hit depth, drive through mid-foot" },
      { exercise: "Romanian Deadlift", sets: 4, reps: "8–10", rest: "2 min", note: "Push the hips back, bar stays on the thighs — feel the hamstrings load" },
      { exercise: "Walking Lunges", sets: 3, reps: "12/leg", rest: "90s", note: "Long strides, torso tall — control the knee, no wobble" },
      { exercise: "Leg Press", sets: 3, reps: "12–15", rest: "90s", note: "Full range without the lower back rolling off the pad" },
      { exercise: "Seated Leg Curl", sets: 3, reps: "12–15", rest: "60s", note: "Squeeze a full second at the bottom of every rep" },
      { exercise: "Standing Calf Raise", sets: 4, reps: "15–20", rest: "45s", note: "Pause at the stretch, explode up — no bouncing" },
      { exercise: "Hanging Knee Raise", sets: 3, reps: "12–15", rest: "60s", note: "Slow and controlled — no swinging, exhale at the top" },
    ]
  },
  {
    day: "WED", label: "UPPER BODY — PULL", muscles: "Back, Rear Delts, Biceps", count: 7,
    lifts: [
      { exercise: "Weighted Pull-Ups", sets: 4, reps: "6–8", rest: "2 min", note: "Dead hang to chest-to-bar intent — add load only when all reps are clean" },
      { exercise: "Barbell Row", sets: 4, reps: "8–10", rest: "2 min", note: "Hinge at 45 degrees, pull to the lower ribs — no torso heave" },
      { exercise: "Lat Pulldown", sets: 3, reps: "10–12", rest: "90s", note: "Drive the elbows down, chest up — let the lats do the work" },
      { exercise: "Chest-Supported Row", sets: 3, reps: "12", rest: "90s", note: "Chest glued to the pad kills the momentum — strict reps only" },
      { exercise: "Face Pulls", sets: 3, reps: "15–20", rest: "45s", note: "Rope to the forehead, thumbs back — this is shoulder insurance" },
      { exercise: "Barbell Curl", sets: 3, reps: "10–12", rest: "60s", note: "Elbows pinned to your sides — no swinging the weight up" },
      { exercise: "Hammer Curl", sets: 3, reps: "12", rest: "60s", note: "Neutral grip, slow negative — builds the forearm and brachialis" },
    ]
  },
  {
    day: "THU", label: "CONDITIONING + CORE", muscles: "Engine, Trunk", count: 6,
    lifts: [
      { exercise: "Rower or Bike Intervals", sets: 6, reps: "60s hard / 90s easy", rest: "—", note: "Hard means hard — the last two intervals should be a negotiation" },
      { exercise: "Kettlebell Swings", sets: 4, reps: "20", rest: "60s", note: "Snap the hips, arms are just hooks — power comes from the hinge" },
      { exercise: "Farmer's Carry", sets: 4, reps: "40m", rest: "90s", note: "Heavy. Shoulders packed, walk tall — grip and trunk under load" },
      { exercise: "Plank", sets: 3, reps: "60s", rest: "45s", note: "Squeeze glutes and abs — a plank is a full-body contraction, not a rest" },
      { exercise: "Pallof Press", sets: 3, reps: "12/side", rest: "45s", note: "Resist the rotation — slow press out, slow return" },
      { exercise: "Ab Wheel Rollout", sets: 3, reps: "8–12", rest: "60s", note: "Only roll as far as you can keep the lower back flat" },
    ]
  },
  {
    day: "FRI", label: "LOWER BODY — HINGE", muscles: "Posterior Chain, Glutes", count: 7,
    lifts: [
      { exercise: "Trap Bar Deadlift", sets: 4, reps: "5–6", rest: "2.5 min", note: "Second strength slot — wedge in tight, push the floor away" },
      { exercise: "Front Squat", sets: 3, reps: "8", rest: "2 min", note: "Elbows high, torso vertical — quads and upper back earn their pay" },
      { exercise: "Hip Thrust", sets: 4, reps: "10–12", rest: "90s", note: "Full lockout with a one-second squeeze — chin tucked, ribs down" },
      { exercise: "Bulgarian Split Squat", sets: 3, reps: "10/leg", rest: "90s", note: "The one everybody skips — that's exactly why we do it" },
      { exercise: "Back Extension", sets: 3, reps: "12–15", rest: "60s", note: "Squeeze glutes at the top, don't hyperextend the spine" },
      { exercise: "Seated Calf Raise", sets: 4, reps: "15–20", rest: "45s", note: "Different angle than Tuesday — pause every rep at the stretch" },
      { exercise: "Weighted Decline Sit-Up", sets: 3, reps: "12–15", rest: "60s", note: "Control down, drive up — add load before adding reps" },
    ]
  },
  {
    day: "SAT", label: "FULL BODY — OPERATOR CIRCUIT", muscles: "Total Body, Engine", count: 5,
    lifts: [
      { exercise: "Dumbbell Thrusters", sets: 5, reps: "12", rest: "Circuit", note: "Squat to press in one motion — breathe at the top, keep moving" },
      { exercise: "Renegade Rows", sets: 5, reps: "8/side", rest: "Circuit", note: "Hips square to the floor — the anti-rotation is the exercise" },
      { exercise: "Push-Ups", sets: 5, reps: "15–20", rest: "Circuit", note: "Chest to the floor, full lockout — no half reps in the circuit" },
      { exercise: "Goblet Reverse Lunge", sets: 5, reps: "10/leg", rest: "Circuit", note: "Bell tight to the chest, knee kisses the floor — stay tall" },
      { exercise: "Sled Push or Hill Sprint", sets: 5, reps: "20m / 15s", rest: "2 min between rounds", note: "Finish the round with intent — this is where the week is won" },
    ]
  },
  {
    day: "SUN", label: "ACTIVE RECOVERY — RESET", muscles: "Recovery, Mobility", count: 5,
    lifts: [
      { exercise: "Zone 2 Walk (outdoor)", sets: 1, reps: "45–60 min", rest: "—", note: "Conversational pace, phone on do-not-disturb — this is thinking time" },
      { exercise: "Couch Stretch", sets: 2, reps: "90s/side", rest: "—", note: "Hip flexors take the beating all week — pay them back here" },
      { exercise: "90/90 Hip Switches", sets: 2, reps: "10/side", rest: "—", note: "Smooth transitions, no hands if you can — own the position" },
      { exercise: "Thoracic Openers", sets: 2, reps: "10/side", rest: "—", note: "Desk posture dies here — exhale into every rotation" },
      { exercise: "Box Breathing", sets: 1, reps: "5 min", rest: "—", note: "4s in, 4s hold, 4s out, 4s hold — recovery is a skill, train it" },
    ]
  },
];

// ── Nav component ────────────────────────────────────────────────────────────
function Nav({ activeSection }: { activeSection: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { label: "SERVICES", href: "#services" },
    { label: "APPLY", href: "#apply" },
    { label: "INVESTMENT", href: "#investment" },
    { label: "SAMPLE SPLIT", href: "#sample-split" },
    { label: "AI ENGINE", href: "#ai-engine" },
    { label: "COACH JAY", href: "#coach-jay" },
    { label: "PROOF", href: "#proof" },
    { label: "GALLERY", href: "#gallery" },
    { label: "PAY INVOICE", href: "#pay-invoice" },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0B]/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <a href="#" className="font-['Bebas_Neue'] text-xl tracking-widest text-white">JAYLEE FIT</a>
        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-5">
          {links.map(l => (
            <a key={l.href} href={l.href}
              className={`font-['JetBrains_Mono'] text-[10px] tracking-widest transition-colors ${activeSection === l.href.slice(1) ? 'text-red-500' : 'text-white/60 hover:text-white'}`}>
              {l.label}
            </a>
          ))}
          <a href="#apply" className="ml-2 px-3 py-1.5 bg-red-600 text-white font-['JetBrains_Mono'] text-[10px] tracking-widest hover:bg-red-500 transition-colors">
            APPLY
          </a>
        </div>
        {/* Mobile hamburger */}
        <button className="lg:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white" />
        </button>
      </div>
      {/* Mobile overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 bg-[#0A0A0B] z-40 flex flex-col items-center justify-center gap-6">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="font-['JetBrains_Mono'] text-lg tracking-widest text-white/80 hover:text-red-500 transition-colors">
              {l.label}
            </a>
          ))}
          <a href="#apply" onClick={() => setMenuOpen(false)}
            className="mt-4 px-6 py-3 bg-red-600 text-white font-['JetBrains_Mono'] text-sm tracking-widest">
            APPLY NOW
          </a>
        </div>
      )}
    </nav>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({ id, index, title, children, className = "" }: {
  id: string; index: string; title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <section id={id} className={`py-20 scroll-mt-14 ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-10">
          <span className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest">{index}</span>
          <div className="flex-1 h-px bg-white/10" />
          <span className="font-['Bebas_Neue'] text-3xl md:text-4xl tracking-widest text-white">{title}</span>
        </div>
        {children}
      </div>
    </section>
  );
}

// ── 4-Phase Application Form ─────────────────────────────────────────────────
function ApplyForm({ onQualified }: { onQualified: (pricing: Record<string, string>) => void }) {
  const capabilities = trpc.site.capabilities.useQuery();
  const intakeAvailable = capabilities.data?.applicationIntake === true;
  const [phase, setPhase] = useState(1);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  // Phase 1 state
  const [p1, setP1] = useState({ fullName: "", phone: "", location: "" });
  // Phase 2 state
  const [p2, setP2] = useState({ goal: "", trainingFrequency: "", trainingHistory: "", currentStats: "" });
  // Phase 3 state
  const [p3, setP3] = useState({ hoursPerWeek: "", equipmentAccess: "", biggestObstacle: "", willLog: "" });
  // Phase 4 state
  const [p4, setP4] = useState({ whyNow: "", startWindow: "", investmentAck: false, reviewAgreement: false });

  const phase1Mut = trpc.application.submitPhase1.useMutation();
  const phase2Mut = trpc.application.submitPhase2.useMutation();
  const phase3Mut = trpc.application.submitPhase3.useMutation();
  const phase4Mut = trpc.application.submitPhase4.useMutation();
  const applicationError = phase1Mut.error ?? phase2Mut.error ?? phase3Mut.error ?? phase4Mut.error;

  const inputCls = "w-full bg-white/5 border border-white/20 text-white font-['JetBrains_Mono'] text-sm px-3 py-2 focus:outline-none focus:border-red-500 transition-colors placeholder:text-white/30";
  const labelCls = "block font-['JetBrains_Mono'] text-xs tracking-widest text-white/60 mb-1";
  const selectCls = `${inputCls} appearance-none`;

  async function handlePhase1() {
    if (!email || !p1.fullName || !p1.location) return;
    await phase1Mut.mutateAsync({ email, fullName: p1.fullName, phone: p1.phone || undefined, location: p1.location });
    setPhase(2);
  }
  async function handlePhase2() {
    if (!p2.goal || !p2.trainingFrequency || !p2.trainingHistory) return;
    await phase2Mut.mutateAsync({ email, ...p2 });
    setPhase(3);
  }
  async function handlePhase3() {
    if (!p3.hoursPerWeek || !p3.equipmentAccess || !p3.biggestObstacle || !p3.willLog) return;
    await phase3Mut.mutateAsync({ email, ...p3 });
    setPhase(4);
  }
  async function handlePhase4() {
    if (!p4.whyNow || !p4.startWindow || !p4.investmentAck || !p4.reviewAgreement) return;
    const result = await phase4Mut.mutateAsync({ email, ...p4 });
    onQualified(result.pricing as Record<string, string>);
    setDone(true);
  }

  if (done) {
    return (
      <div className="text-center py-16">
        <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-4">// APPLICATION RECEIVED</div>
        <div className="font-['Bebas_Neue'] text-4xl text-white mb-4">QUALIFICATION COMPLETE</div>
        <p className="font-['JetBrains_Mono'] text-sm text-white/60 mb-8">Your application is queued for Coach Jay's review. Investment packages are now unlocked.</p>
        <a href="#investment" className="inline-block px-6 py-3 bg-red-600 text-white font-['JetBrains_Mono'] text-xs tracking-widest hover:bg-red-500 transition-colors">
          VIEW INVESTMENT PACKAGES →
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Stepper */}
      <div className="flex gap-2 mb-8">
        {[1,2,3,4].map(n => (
          <div key={n} className={`flex-1 h-1 ${n <= phase ? 'bg-red-600' : 'bg-white/10'} transition-colors`} />
        ))}
      </div>
      <div className="font-['JetBrains_Mono'] text-xs text-white/40 tracking-widest mb-6">
        PHASE {phase} OF 4 · APPLICATIONS ARE REVIEWED BY COACH JAY.
      </div>
      {!capabilities.isPending && !intakeAvailable && (
        <div className="mb-6 border border-amber-400/40 bg-amber-400/5 p-4 font-['JetBrains_Mono'] text-xs text-amber-200">
          ONLINE APPLICATIONS ARE TEMPORARILY PAUSED. No information entered below will be submitted until secure intake storage is connected.
        </div>
      )}
      {applicationError && (
        <p className="mb-5 font-['JetBrains_Mono'] text-xs text-red-400">SUBMISSION ERROR: {applicationError.message}</p>
      )}

      {/* Phase 1 */}
      {phase === 1 && (
        <div className="space-y-5">
          <div className="font-['Bebas_Neue'] text-2xl text-white mb-2">PHASE 1 — IDENTITY <span className="text-white/40 text-lg">// WHO IS APPLYING?</span></div>
          <div>
            <label className={labelCls}>EMAIL *</label>
            <input type="email" className={inputCls} placeholder="operator@company.com"
              value={email} onChange={e => setEmail(e.target.value)}
              required />
            <p className="font-['JetBrains_Mono'] text-xs text-white/30 mt-1">We'll use this email to contact you with your qualification results and next steps.</p>
          </div>
          <div>
            <label className={labelCls}>FULL NAME *</label>
            <input type="text" className={inputCls} placeholder="First and last name"
              value={p1.fullName} onChange={e => setP1({...p1, fullName: e.target.value})} required />
            <p className="font-['JetBrains_Mono'] text-xs text-white/30 mt-1">First and last. Coach Jay reviews every application personally.</p>
          </div>
          <div>
            <label className={labelCls}>PHONE</label>
            <input type="tel" className={inputCls} placeholder="Optional"
              value={p1.phone} onChange={e => setP1({...p1, phone: e.target.value})} />
            <p className="font-['JetBrains_Mono'] text-xs text-white/30 mt-1">Optional — for faster scheduling once you're approved.</p>
          </div>
          <div>
            <label className={labelCls}>LOCATION / TIMEZONE *</label>
            <input type="text" className={inputCls} placeholder="City, state, timezone"
              value={p1.location} onChange={e => setP1({...p1, location: e.target.value})} required />
            <p className="font-['JetBrains_Mono'] text-xs text-white/30 mt-1">City, state, timezone. Check-ins and Zoom calls are scheduled around it.</p>
          </div>
          <button onClick={handlePhase1} disabled={phase1Mut.isPending || !intakeAvailable}
            className="w-full py-3 bg-red-600 text-white font-['JetBrains_Mono'] text-xs tracking-widest hover:bg-red-500 transition-colors disabled:opacity-50">
            {phase1Mut.isPending ? "PROCESSING..." : "NEXT PHASE →"}
          </button>
        </div>
      )}

      {/* Phase 2 */}
      {phase === 2 && (
        <div className="space-y-5">
          <div className="font-['Bebas_Neue'] text-2xl text-white mb-2">PHASE 2 — MISSION PROFILE <span className="text-white/40 text-lg">// WHAT ARE WE BUILDING?</span></div>
          <div>
            <label className={labelCls}>YOUR SINGLE MOST IMPORTANT 12-WEEK GOAL *</label>
            <textarea className={`${inputCls} h-24 resize-none`} placeholder="One goal. Be specific. 'Get in shape' is not a mission."
              value={p2.goal} onChange={e => setP2({...p2, goal: e.target.value})} required />
          </div>
          <div>
            <label className={labelCls}>CURRENT TRAINING FREQUENCY *</label>
            <select className={selectCls} value={p2.trainingFrequency} onChange={e => setP2({...p2, trainingFrequency: e.target.value})} required>
              <option value="">SELECT —</option>
              <option value="NOT TRAINING RIGHT NOW">NOT TRAINING RIGHT NOW</option>
              <option value="1–2 DAYS PER WEEK">1–2 DAYS PER WEEK</option>
              <option value="3–4 DAYS PER WEEK">3–4 DAYS PER WEEK</option>
              <option value="5+ DAYS PER WEEK">5+ DAYS PER WEEK</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>TRAINING HISTORY *</label>
            <select className={selectCls} value={p2.trainingHistory} onChange={e => setP2({...p2, trainingHistory: e.target.value})} required>
              <option value="">SELECT —</option>
              <option value="NEW TO STRUCTURED TRAINING">NEW TO STRUCTURED TRAINING</option>
              <option value="1–3 YEARS">1–3 YEARS</option>
              <option value="3–10 YEARS">3–10 YEARS</option>
              <option value="10+ YEARS">10+ YEARS</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>CURRENT STATS</label>
            <input type="text" className={inputCls} placeholder="Height, weight, body fat % (estimates fine)"
              value={p2.currentStats} onChange={e => setP2({...p2, currentStats: e.target.value})} />
          </div>
          <button onClick={handlePhase2} disabled={phase2Mut.isPending || !intakeAvailable}
            className="w-full py-3 bg-red-600 text-white font-['JetBrains_Mono'] text-xs tracking-widest hover:bg-red-500 transition-colors disabled:opacity-50">
            {phase2Mut.isPending ? "PROCESSING..." : "NEXT PHASE →"}
          </button>
        </div>
      )}

      {/* Phase 3 */}
      {phase === 3 && (
        <div className="space-y-5">
          <div className="font-['Bebas_Neue'] text-2xl text-white mb-2">PHASE 3 — LOGISTICS & COMMITMENT <span className="text-white/40 text-lg">// CAN YOU EXECUTE?</span></div>
          <div>
            <label className={labelCls}>HOURS PER WEEK YOU CAN TRAIN *</label>
            <select className={selectCls} value={p3.hoursPerWeek} onChange={e => setP3({...p3, hoursPerWeek: e.target.value})} required>
              <option value="">SELECT —</option>
              <option value="2–3 HOURS">2–3 HOURS</option>
              <option value="4–6 HOURS">4–6 HOURS</option>
              <option value="7–9 HOURS">7–9 HOURS</option>
              <option value="10+ HOURS">10+ HOURS</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>EQUIPMENT ACCESS *</label>
            <select className={selectCls} value={p3.equipmentAccess} onChange={e => setP3({...p3, equipmentAccess: e.target.value})} required>
              <option value="">SELECT —</option>
              <option value="FULL GYM">FULL GYM</option>
              <option value="HOME SETUP (DUMBBELLS / BANDS)">HOME SETUP (DUMBBELLS / BANDS)</option>
              <option value="BODYWEIGHT ONLY">BODYWEIGHT ONLY</option>
              <option value="GYM + HOME">GYM + HOME</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>YOUR BIGGEST OBSTACLE *</label>
            <textarea className={`${inputCls} h-24 resize-none`} placeholder="What has killed your consistency before?"
              value={p3.biggestObstacle} onChange={e => setP3({...p3, biggestObstacle: e.target.value})} required />
          </div>
          <div>
            <label className={labelCls}>WILL YOU LOG WORKOUTS AND MEALS DAILY? *</label>
            <div className="flex gap-4 mt-2">
              {["YES — EVERY DAY", "NO"].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="willLog" value={opt}
                    checked={p3.willLog === opt} onChange={() => setP3({...p3, willLog: opt})}
                    className="accent-red-600" />
                  <span className="font-['JetBrains_Mono'] text-xs text-white/70">{opt}</span>
                </label>
              ))}
            </div>
            <p className="font-['JetBrains_Mono'] text-xs text-white/30 mt-1">The Accountability Loop only works if you feed it. 'No' does not disqualify you, but say it now.</p>
          </div>
          <button onClick={handlePhase3} disabled={phase3Mut.isPending || !intakeAvailable}
            className="w-full py-3 bg-red-600 text-white font-['JetBrains_Mono'] text-xs tracking-widest hover:bg-red-500 transition-colors disabled:opacity-50">
            {phase3Mut.isPending ? "PROCESSING..." : "NEXT PHASE →"}
          </button>
        </div>
      )}

      {/* Phase 4 */}
      {phase === 4 && (
        <div className="space-y-5">
          <div className="font-['Bebas_Neue'] text-2xl text-white mb-2">PHASE 4 — READINESS <span className="text-white/40 text-lg">// FINAL GATE.</span></div>
          <div>
            <label className={labelCls}>WHY NOW? *</label>
            <textarea className={`${inputCls} h-24 resize-none`} placeholder="What changed? Why is this the 12-week block where it actually happens?"
              value={p4.whyNow} onChange={e => setP4({...p4, whyNow: e.target.value})} required />
          </div>
          <div>
            <label className={labelCls}>PREFERRED START WINDOW *</label>
            <select className={selectCls} value={p4.startWindow} onChange={e => setP4({...p4, startWindow: e.target.value})} required>
              <option value="">SELECT —</option>
              <option value="IMMEDIATELY">IMMEDIATELY</option>
              <option value="WITHIN 2 WEEKS">WITHIN 2 WEEKS</option>
              <option value="WITHIN 30 DAYS">WITHIN 30 DAYS</option>
              <option value="JUST SCOUTING">JUST SCOUTING</option>
            </select>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={p4.investmentAck} onChange={e => setP4({...p4, investmentAck: e.target.checked})}
              className="mt-0.5 accent-red-600" />
            <span className="font-['JetBrains_Mono'] text-xs text-white/70">I understand MAO packages are premium coaching investments, not subscriptions, and pricing is revealed after qualification.</span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={p4.reviewAgreement} onChange={e => setP4({...p4, reviewAgreement: e.target.checked})}
              className="mt-0.5 accent-red-600" />
            <span className="font-['JetBrains_Mono'] text-xs text-white/70">I understand this application will be reviewed and submission does not guarantee acceptance.</span>
          </label>
          <button onClick={handlePhase4} disabled={phase4Mut.isPending || !intakeAvailable}
            className="w-full py-3 bg-red-600 text-white font-['JetBrains_Mono'] text-xs tracking-widest hover:bg-red-500 transition-colors disabled:opacity-50">
            {phase4Mut.isPending ? "PROCESSING..." : "COMPLETE QUALIFICATION →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── AI Engine component ──────────────────────────────────────────────────────
function AIEngine() {
  const capabilities = trpc.site.capabilities.useQuery();
  const aiAvailable = capabilities.data?.aiBlueprints === true;
  const [diagnostic, setDiagnostic] = useState({ objective: "", operator: "", commitment: "" });
  const [routeResult, setRouteResult] = useState<{ tier: string; rationale: string } | null>(null);
  const [form, setForm] = useState({ name: "", goals: "", fitnessLevel: "Intermediate", availability: "", focusArea: "", limitations: "" });
  const [plan, setPlan] = useState("");
  const [showBlueprint, setShowBlueprint] = useState(false);

  const generateMut = trpc.aiEngine.generatePlan.useMutation({
    onSuccess: (data) => setPlan(data.plan),
  });

  function runDiagnostic() {
    if (!diagnostic.objective || !diagnostic.operator || !diagnostic.commitment) return;
    let tier = "FOUNDATION";
    if (diagnostic.commitment === "5–7 HOURS") tier = "RECOMP";
    if (diagnostic.commitment === "8+ HOURS") tier = "LEGACY";
    if (diagnostic.objective === "ATHLETIC PERFORMANCE" || diagnostic.operator === "ATHLETE / COMPETITOR") {
      if (tier === "FOUNDATION") tier = "RECOMP";
      else if (tier === "RECOMP") tier = "LEGACY";
    }
    const rationale = `${diagnostic.objective.toLowerCase()} objective + ${diagnostic.operator.toLowerCase()} schedule + ${diagnostic.commitment}/week = the ${tier === "FOUNDATION" ? "entry-level FOUNDATION" : tier === "RECOMP" ? "flagship RECOMP" : "premium LEGACY"} track.`;
    setRouteResult({ tier, rationale });
    setShowBlueprint(true);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left: inputs */}
      <div className="space-y-8">
        {/* Rapid Diagnostic */}
        <div className="border border-white/10 p-6">
          <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-1">MAO ENGINE // 3-QUESTION DIAGNOSTIC</div>
          <div className="font-['Bebas_Neue'] text-2xl text-white mb-1">3 QUESTIONS. ROUTED IN 90 SECONDS.</div>
          <p className="font-['JetBrains_Mono'] text-xs text-white/50 mb-5">Three rapid-fire questions. The MAO Engine routes your goal, archetype, and time commitment into a recommended track — then unlocks the deep AI Blueprint generator below. No fluff. No 6-page form. Pull the trigger.</p>
          <div className="space-y-4">
            {[
              { key: "objective", q: "WHAT IS YOUR PRIMARY OBJECTIVE?", opts: ["BODY RECOMPOSITION","RAW STRENGTH","LONGEVITY / HEALTH","ATHLETIC PERFORMANCE"] },
              { key: "operator", q: "WHICH OPERATOR ARE YOU?", opts: ["FOUNDER / ENTREPRENEUR","EXECUTIVE / PROFESSIONAL","ATHLETE / COMPETITOR","BUSY PARENT / GRINDER"] },
              { key: "commitment", q: "WEEKLY TIME COMMITMENT?", opts: ["2–4 HOURS","5–7 HOURS","8+ HOURS"] },
            ].map(({ key, q, opts }) => (
              <div key={key}>
                <label className="block font-['JetBrains_Mono'] text-xs tracking-widest text-white/60 mb-2">{q}</label>
                <div className="flex flex-wrap gap-2">
                  {opts.map(opt => (
                    <button key={opt} onClick={() => setDiagnostic(d => ({ ...d, [key]: opt }))}
                      className={`px-3 py-1.5 font-['JetBrains_Mono'] text-[10px] tracking-wider border transition-colors ${diagnostic[key as keyof typeof diagnostic] === opt ? 'bg-red-600 border-red-600 text-white' : 'border-white/20 text-white/60 hover:border-white/40'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={runDiagnostic}
              className="w-full py-2.5 bg-red-600 text-white font-['JetBrains_Mono'] text-xs tracking-widest hover:bg-red-500 transition-colors">
              RUN DIAGNOSTIC →
            </button>
          </div>
          {routeResult && (
            <div className="mt-5 border border-red-600/40 p-4 bg-red-600/5">
              <div className="font-['JetBrains_Mono'] text-xs text-red-500 mb-1">ROUTED // RECOMMENDED TRACK: {routeResult.tier}</div>
              <p className="font-['JetBrains_Mono'] text-xs text-white/70 mb-3">{routeResult.rationale}</p>
              <a href="#apply" className="font-['JetBrains_Mono'] text-xs text-red-400 hover:text-red-300 tracking-widest">
                APPLY FOR {routeResult.tier} →
              </a>
            </div>
          )}
        </div>

        {/* Deep Blueprint form */}
        {showBlueprint && (
          <div className="border border-white/10 p-6 min-w-0">
            <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-1">DEEP BLUEPRINT // AI POWERED ENGINE</div>
            <div className="font-['Bebas_Neue'] text-2xl text-white mb-4">GENERATE YOUR BLUEPRINT</div>
            {!capabilities.isPending && !aiAvailable && (
              <div className="mb-4 border border-amber-400/40 bg-amber-400/5 p-3 font-['JetBrains_Mono'] text-xs text-amber-200">
                LIVE AI BLUEPRINTS ARE TEMPORARILY OFFLINE. The rapid diagnostic remains available.
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block font-['JetBrains_Mono'] text-xs tracking-widest text-white/60 mb-1">NAME (OPTIONAL)</label>
                <input type="text" className="w-full bg-white/5 border border-white/20 text-white font-['JetBrains_Mono'] text-sm px-3 py-2 focus:outline-none focus:border-red-500 transition-colors placeholder:text-white/30"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-xs tracking-widest text-white/60 mb-1">PRIMARY GOALS *</label>
                <textarea className="w-full bg-white/5 border border-white/20 text-white font-['JetBrains_Mono'] text-sm px-3 py-2 focus:outline-none focus:border-red-500 h-20 resize-none placeholder:text-white/30"
                  value={form.goals} onChange={e => setForm({...form, goals: e.target.value})} required />
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-xs tracking-widest text-white/60 mb-1">FITNESS LEVEL *</label>
                <select className="w-full bg-white/5 border border-white/20 text-white font-['JetBrains_Mono'] text-sm px-3 py-2 focus:outline-none focus:border-red-500"
                  value={form.fitnessLevel} onChange={e => setForm({...form, fitnessLevel: e.target.value})}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-xs tracking-widest text-white/60 mb-1">AVAILABILITY *</label>
                <input type="text" className="w-full bg-white/5 border border-white/20 text-white font-['JetBrains_Mono'] text-sm px-3 py-2 focus:outline-none focus:border-red-500 placeholder:text-white/30"
                  placeholder="e.g. 5 days/week, 60 min sessions"
                  value={form.availability} onChange={e => setForm({...form, availability: e.target.value})} required />
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-xs tracking-widest text-white/60 mb-1">FOCUS AREA (OPTIONAL)</label>
                <input type="text" className="w-full bg-white/5 border border-white/20 text-white font-['JetBrains_Mono'] text-sm px-3 py-2 focus:outline-none focus:border-red-500 placeholder:text-white/30"
                  value={form.focusArea} onChange={e => setForm({...form, focusArea: e.target.value})} />
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-xs tracking-widest text-white/60 mb-1">INJURIES / LIMITATIONS (OPTIONAL)</label>
                <input type="text" className="w-full bg-white/5 border border-white/20 text-white font-['JetBrains_Mono'] text-sm px-3 py-2 focus:outline-none focus:border-red-500 placeholder:text-white/30"
                  value={form.limitations} onChange={e => setForm({...form, limitations: e.target.value})} />
              </div>
              <button onClick={() => generateMut.mutate({ ...form, fitnessLevel: form.fitnessLevel as "Beginner"|"Intermediate"|"Advanced", name: form.name || undefined, focusArea: form.focusArea || undefined, limitations: form.limitations || undefined })}
                disabled={generateMut.isPending || !aiAvailable || !form.goals || !form.availability}
                className="w-full py-3 bg-red-600 text-white font-['JetBrains_Mono'] text-xs tracking-widest hover:bg-red-500 transition-colors disabled:opacity-50">
                {generateMut.isPending ? "GENERATING..." : "GENERATE AI PLAN →"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: output */}
      <div className="border border-white/10 p-6 min-h-64">
        <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-3">OUTPUT // AI POWERED ENGINE</div>
        {generateMut.isPending && (
          <div className="font-['JetBrains_Mono'] text-sm text-white/50 animate-pulse">GENERATING OPERATOR BLUEPRINT...</div>
        )}
        {generateMut.error && (
          <div className="font-['JetBrains_Mono'] text-sm text-red-400">ERROR: {generateMut.error.message}</div>
        )}
        {plan ? (
          <div className="prose prose-invert prose-sm max-w-none font-['JetBrains_Mono'] text-sm text-white/80 [&_h1]:font-['Bebas_Neue'] [&_h2]:font-['Bebas_Neue'] [&_h3]:font-['Bebas_Neue'] [&_strong]:text-white">
            <ReactMarkdown>{plan}</ReactMarkdown>
          </div>
        ) : !generateMut.isPending && (
          <div className="font-['JetBrains_Mono'] text-sm text-white/30">
            {'> Awaiting input. Drop your goals on the left and pull the trigger.'}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Home page ───────────────────────────────────────────────────────────
export default function Home() {
  const capabilities = trpc.site.capabilities.useQuery();
  const paymentReportingAvailable = capabilities.data?.paymentReporting === true;
  const [activeSection, setActiveSection] = useState("hero");
  const [qualified, setQualified] = useState(false);
  const [pricing, setPricing] = useState<Record<string, string>>({});
  const [activeDay, setActiveDay] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [payForm, setPayForm] = useState({ name: "", email: "", method: "PayPal", amount: "", orderId: "", transactionId: "", note: "" });
  const [payDone, setPayDone] = useState(false);
  const payMut = trpc.payment.report.useMutation({ onSuccess: () => setPayDone(true) });

  // Scroll spy
  useEffect(() => {
    const sections = ["services","apply","investment","sample-split","ai-engine","coach-jay","proof","gallery","pay-invoice"];
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { rootMargin: "-40% 0px -40% 0px" }
    );
    sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  // Restore qualification from session storage
  useEffect(() => {
    if (sessionStorage.getItem("maoQualified") === "true") {
      setQualified(true);
      try { setPricing(JSON.parse(sessionStorage.getItem("maoPricing") ?? "{}")); } catch {}
    }
  }, []);

  function handleQualified(p: Record<string, string>) {
    setQualified(true);
    setPricing(p);
    sessionStorage.setItem("maoQualified", "true");
    sessionStorage.setItem("maoPricing", JSON.stringify(p));
  }

  const inputCls = "w-full bg-white/5 border border-white/20 text-white font-['JetBrains_Mono'] text-sm px-3 py-2 focus:outline-none focus:border-red-500 transition-colors placeholder:text-white/30";
  const labelCls = "block font-['JetBrains_Mono'] text-xs tracking-widest text-white/60 mb-1";

  return (
    <div className="bg-[#0A0A0B] text-white min-h-screen">
      <Nav activeSection={activeSection} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section id="hero" className="min-h-screen flex flex-col justify-center pt-14 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="font-['JetBrains_Mono'] text-xs text-white/40 tracking-widest mb-6">
            JAYLEE FIT ·· EST. JAYLEE HUSTLE INDUSTRIES LLC
          </div>
          <div className="mb-4">
            <div className="font-['Bebas_Neue'] text-[120px] md:text-[180px] leading-none text-white tracking-tight">MAO</div>
            <div className="font-['Bebas_Neue'] text-3xl md:text-5xl tracking-widest text-white/80">METHODOLOGY</div>
            <div className="font-['JetBrains_Mono'] text-xs text-white/30 tracking-widest mt-1">JAYLEE HUSTLE INDUSTRIES</div>
          </div>
          <div className="w-24 h-px bg-red-600 mb-6" />
          <p className="font-['JetBrains_Mono'] text-sm text-white/70 max-w-2xl leading-relaxed mb-3">
            JayLee Hustle Industries utilizes the proprietary MAO (Massive Action Orientation) Framework—an elite triad of physical conditioning, neural optimization, and strict accountability engineered exclusively for high-output founders and career professionals.
          </p>
          <p className="font-['JetBrains_Mono'] text-sm text-white/70 max-w-2xl leading-relaxed mb-10">
            Adaptation is the game. 12-week specialized programs for your body's purpose: athletic performance, fat loss, functional strength, metabolic efficiency. AI engine. Human coach. By application only.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#apply" className="px-8 py-4 bg-red-600 text-white font-['JetBrains_Mono'] text-xs tracking-widest hover:bg-red-500 transition-colors active:scale-[0.97]">
              APPLY FOR A PACKAGE
            </a>
            <a href="#ai-engine" className="px-8 py-4 border border-white/30 text-white font-['JetBrains_Mono'] text-xs tracking-widest hover:border-white/60 transition-colors active:scale-[0.97]">
              RUN AI POWERED ENGINE
            </a>
          </div>
          <div className="mt-16 font-['JetBrains_Mono'] text-xs text-white/20 tracking-widest animate-bounce">↓ SCROLL</div>
        </div>
      </section>

      {/* ── TERMINOLOGY ──────────────────────────────────────────────────── */}
      <Section id="terminology" index="00 /" title="TERMINOLOGY">
        <p className="font-['JetBrains_Mono'] text-sm text-white/60 mb-8 max-w-2xl">Three terms you must understand before you read another line on this site. Everything else inherits from these.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { code: "G/00", term: "FOUNDER — MEET COACH JAY", def: "Founder of JayLee Hustle Industries. Author of the MAO Framework. Coach to the Operators on this platform — every protocol on this site comes from his system, not a textbook. Coach Jay built the MAO Framework in the field — not in a classroom. Every Operator on the roster is coached against the same standard he holds himself to. Adaptation is the game." },
            { code: "G/01", term: "OPERATOR", def: "A high-output founder, executive, or career professional whose physical conditioning is the lever that compounds every other system in their life. We do not coach hobbyists. We coach Operators." },
            { code: "G/02", term: "MAO (MASSIVE ACTION ORIENTATION)", def: "The proprietary JayLee framework: a triad of physical conditioning, neural optimization, and strict accountability. Every protocol is engineered to compound across all three planes simultaneously — not in isolation." },
            { code: "G/03", term: "SWARM ECOSYSTEM", def: "The MAO operating model that connects programming, check-ins, communication, and evidence review around each Operator. Automation is introduced only where the supporting systems are configured and supervised." },
          ].map(g => (
            <div key={g.code} className="border border-white/10 p-6 hover:border-white/20 transition-colors">
              <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-2">{g.code}</div>
              <div className="font-['Bebas_Neue'] text-xl text-white mb-3">{g.term}</div>
              <p className="font-['JetBrains_Mono'] text-xs text-white/60 leading-relaxed">{g.def}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <Section id="services" index="01 /" title="THE OFFER" className="border-t border-white/5">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { code: "S/01", title: "FITNESS PLANS", desc: "Programmed 12-week body recomposition blocks. Progressive overload, conditioning, mobility, nutrition guardrails — engineered around your life.", features: ["CUSTOM SPLIT + LIFT PROGRESSIONS","WEEKLY CHECK-INS & AUDITS","NUTRITION GUARDRAILS"] },
            { code: "S/02", title: "PERSONAL TRAINING", desc: "1:1 sessions and remote coaching with the JayLee Hustle Industries standard — every rep logged, every session reviewed.", features: ["LIVE OR REMOTE SESSIONS","FORM AUDITS + VIDEO REVIEW","ACCOUNTABILITY LOOP"] },
            { code: "S/03", title: "HUSTLE COACHING", desc: "Mindset, discipline, and operating systems for athletes, founders, and grinders. Train the body, sharpen the operator.", features: ["DAILY OPS + DISCIPLINE FRAMEWORK","QUARTERLY OBJECTIVE SETTING","MENTAL CONDITIONING"] },
          ].map(s => (
            <div key={s.code} className="border border-white/10 p-6 hover:border-red-600/40 transition-colors group">
              <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-2">{s.code}</div>
              <div className="font-['Bebas_Neue'] text-2xl text-white mb-3 group-hover:text-red-400 transition-colors">{s.title}</div>
              <p className="font-['JetBrains_Mono'] text-xs text-white/60 leading-relaxed mb-5">{s.desc}</p>
              <div className="space-y-2">
                {s.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-red-600 flex-shrink-0" />
                    <span className="font-['JetBrains_Mono'] text-[10px] text-white/50 tracking-wider">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── APPLY ────────────────────────────────────────────────────────── */}
      <Section id="apply" index="02B /" title="OPERATOR ADMISSION" className="border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <p className="font-['JetBrains_Mono'] text-sm text-white/60 leading-relaxed mb-8">
              Operator Admission is for committed founders and high-output professionals. The form below is intentionally rigorous — it is the velvet rope between curiosity and the MAO Swarm Ecosystem. Investment details are revealed after qualification.
            </p>
            <div className="border border-red-600/30 p-5 mb-8 bg-red-600/5">
              <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-2">VELVET ROPE // PROTOCOL</div>
              <p className="font-['JetBrains_Mono'] text-xs text-white/60 leading-relaxed">No discount codes. No "buy now" buttons. Pricing is revealed by application only. Coach Jay reviews completed applications and sends next steps to qualified operators.</p>
            </div>
            <div className="font-['JetBrains_Mono'] text-xs text-white/30 space-y-1">
              <div>4-PHASE STRICT QUALIFICATION</div>
              <div>PHASE 1 — IDENTITY</div>
              <div>PHASE 2 — MISSION PROFILE</div>
              <div>PHASE 3 — LOGISTICS & COMMITMENT</div>
              <div>PHASE 4 — READINESS</div>
            </div>
          </div>
          <div>
            <ApplyForm onQualified={handleQualified} />
          </div>
        </div>
      </Section>

      {/* ── INVESTMENT ───────────────────────────────────────────────────── */}
      <Section id="investment" index="02 /" title="INVESTMENT PACKAGES" className="border-t border-white/5">
        <p className="font-['JetBrains_Mono'] text-sm text-white/60 max-w-2xl mb-8">
          You are not buying a product. You are investing in a transformation engineered on the MAO methodology — Hustle First, Recomp over Vanity, Consistency over Intensity, Accountability Loop.
        </p>
        {!qualified && (
          <div className="border border-red-600/40 p-5 bg-red-600/5 mb-8 text-center">
            <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest">PRICING IS REVEALED ONLY TO QUALIFIED OPERATORS. RUN INTAKE FIRST OR APPLY DIRECTLY.</div>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              code: "INV/01", title: "FOUNDATION", badge: null, priceKey: "FOUNDATION_PRICE",
              desc: "Entry tier for committed operators. Weekly programming restructures + monthly Zoom call with Coach Jay. Custom 12-week recomposition block with ongoing adjustments.",
              features: ["Custom 12-week recomposition block","Weekly programming restructures","Monthly Zoom call with Coach Jay","Nutrition guardrails + macro plan","Async messaging Mon–Fri","AI Powered Engine retunes after week 4 + 8"],
              cta: "APPLY FOR FOUNDATION"
            },
            {
              code: "INV/02", title: "RECOMP", badge: "FLAGSHIP", priceKey: "RECOMP_PRICE",
              desc: "The flagship transformation. Weekly programming restructures + weekly Zoom calls with Coach Jay. Full body recomposition, form audits, direct line to Coach Jay. Built for the prospect who is done starting over.",
              features: ["Everything in FOUNDATION","Weekly programming restructures","Weekly Zoom call with Coach Jay","Weekly 1:1 form audit","Custom recovery + sleep protocol","Direct text access (12hr response)","Full body recomposition focus"],
              cta: "APPLY FOR RECOMP"
            },
            {
              code: "INV/03", title: "LEGACY", badge: null, priceKey: "LEGACY_PRICE",
              desc: "Premium tier for high-performing operators. Twice-weekly programming restructures + Zoom calls. Full body recomposition, intensive coaching, direct line to Coach Jay. By application only.",
              features: ["Everything in RECOMP","Twice-weekly programming restructures","Twice-weekly Zoom calls with Coach Jay","Intensive form audits + video review","Priority on every channel (4hr response)","Custom recovery + sleep protocol","Direct text access (24/7)","Quarterly in-person intensive*"],
              cta: "APPLY FOR LEGACY"
            },
          ].map(tier => (
            <div key={tier.code} className={`border p-6 relative ${tier.badge ? 'border-red-600' : 'border-white/10'} hover:border-red-600/60 transition-colors`}>
              {tier.badge && (
                <div className="absolute -top-3 left-6 bg-red-600 px-3 py-0.5 font-['JetBrains_Mono'] text-[10px] tracking-widest text-white">{tier.badge}</div>
              )}
              <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-2">{tier.code}</div>
              <div className="font-['Bebas_Neue'] text-3xl text-white mb-2">{tier.title}</div>
              <div className="font-['JetBrains_Mono'] text-sm text-white/40 mb-4">
                {qualified ? (pricing[tier.priceKey] ?? "Contact for Pricing") : "[PRICING HIDDEN] / REVEALED AFTER QUALIFICATION"}
              </div>
              <p className="font-['JetBrains_Mono'] text-xs text-white/60 leading-relaxed mb-5">{tier.desc}</p>
              <div className="space-y-2 mb-6">
                {tier.features.map(f => (
                  <div key={f} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-red-600 flex-shrink-0 mt-1.5" />
                    <span className="font-['JetBrains_Mono'] text-[10px] text-white/50">{f}</span>
                  </div>
                ))}
              </div>
              <a href="#apply" className="block text-center py-2.5 border border-red-600 text-red-500 font-['JetBrains_Mono'] text-xs tracking-widest hover:bg-red-600 hover:text-white transition-colors">
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
        <p className="font-['JetBrains_Mono'] text-[10px] text-white/30 mt-6">* IN-PERSON INTENSIVES SUBJECT TO COACH AVAILABILITY AND SCHEDULING. ALL PACKAGES BY APPLICATION VIA THE MAO INTAKE.</p>
      </Section>

      {/* ── SAMPLE SPLIT ─────────────────────────────────────────────────── */}
      <Section id="sample-split" index="04 /" title="COACH JAY'S REAL TRAINING WEEK" className="border-t border-white/5">
        <p className="font-['JetBrains_Mono'] text-sm text-white/60 max-w-2xl mb-2">
          This is Jordan's actual weekly split. Your custom MAO program will be built to the same standard — personalized to your goals, schedule, and equipment. Home-based or gym — the system adapts.
        </p>
        <p className="font-['JetBrains_Mono'] text-xs text-white/30 mb-8 tracking-widest">TAP A DAY TO SEE THE PRESCRIPTION. COACH'S NOTES INCLUDED ON EVERY LIFT.</p>
        {/* Day tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TRAINING_SPLIT.map((d, i) => (
            <button key={d.day} onClick={() => setActiveDay(i)}
              className={`px-4 py-2 font-['JetBrains_Mono'] text-xs tracking-widest transition-colors ${activeDay === i ? 'bg-red-600 text-white' : 'border border-white/20 text-white/60 hover:border-white/40'}`}>
              {d.day}
            </button>
          ))}
        </div>
        {/* Day content */}
        <div className="border border-white/10 p-6">
          <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-1">DAY {activeDay + 1} · {TRAINING_SPLIT[activeDay].day}</div>
          <div className="font-['Bebas_Neue'] text-2xl text-white mb-1">{TRAINING_SPLIT[activeDay].label}</div>
          <div className="font-['JetBrains_Mono'] text-xs text-white/40 mb-6">{TRAINING_SPLIT[activeDay].muscles} — {TRAINING_SPLIT[activeDay].count} LIFTS</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10">
                  {["EXERCISE","SETS","REPS","REST","COACH'S NOTE"].map(h => (
                    <th key={h} className="text-left font-['JetBrains_Mono'] text-[10px] text-white/40 tracking-widest pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRAINING_SPLIT[activeDay].lifts.map((lift, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                    <td className="font-['JetBrains_Mono'] text-xs text-white py-3 pr-4">{lift.exercise}</td>
                    <td className="font-['JetBrains_Mono'] text-xs text-white/70 py-3 pr-4">{lift.sets}</td>
                    <td className="font-['JetBrains_Mono'] text-xs text-white/70 py-3 pr-4">{lift.reps}</td>
                    <td className="font-['JetBrains_Mono'] text-xs text-white/70 py-3 pr-4">{lift.rest}</td>
                    <td className="font-['JetBrains_Mono'] text-xs text-white/40 py-3 italic">{lift.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="font-['JetBrains_Mono'] text-[10px] text-white/20 mt-4">* SAMPLE SPLIT — YOUR CUSTOM MAO PROGRAM IS BUILT AFTER QUALIFICATION.</p>
      </Section>

      {/* ── AI ENGINE ────────────────────────────────────────────────────── */}
      <Section id="ai-engine" index="05 /" title="MAO ENGINE" className="border-t border-white/5">
        <AIEngine />
      </Section>

      {/* ── COMMAND CENTER ───────────────────────────────────────────────── */}
      <Section id="command-center" index="06 /" title="MAO COMMAND CENTER" className="border-t border-white/5">
        <p className="font-['JetBrains_Mono'] text-sm text-white/60 max-w-2xl mb-2">
          Every admitted Operator gets a private dashboard for biomarkers, audits, and direct communication. No vague 'wellness' copy. This is the accountability infrastructure behind the MAO coaching process.
        </p>
        <p className="font-['JetBrains_Mono'] text-xs text-white/30 tracking-widest mb-8">BELOW: AN ILLUSTRATIVE COMMAND CENTER PREVIEW. SAMPLE NUMBERS SHOWN FOR DEMONSTRATION.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { code: "D/01", stat: "96%", label: "DAILY COMPLIANCE", sub: "ILLUSTRATIVE WEEK", desc: "A sample view of how training, nutrition, and recovery adherence can be reviewed during coaching." },
            { code: "D/02", stat: "BF 13.4%", label: "BIOMARKER TRACKING", sub: "ILLUSTRATIVE TREND", desc: "A sample view of how body-composition and recovery metrics can be organized over time. Results vary by individual." },
            { code: "D/03", stat: "24/7", label: "COMM CHANNELS", sub: "TELEGRAM • EMAIL • VOICE", desc: "Direct line to Coach Jay — not a VA, not a chatbot. Audio-message form audits within 12 hours, max." },
            { code: "D/04", stat: "WEEKLY", label: "COACHING AUDIT", sub: "PLAN REVIEW + ADJUSTMENT", desc: "The weekly review identifies bottlenecks and informs the next programming adjustment. No copy-paste programs." },
          ].map(d => (
            <div key={d.code} className="border border-white/10 p-5">
              <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-2">{d.code}</div>
              <div className="font-['Bebas_Neue'] text-3xl text-white mb-1">{d.stat}</div>
              <div className="font-['JetBrains_Mono'] text-[10px] text-white/60 tracking-widest mb-1">{d.label}</div>
              <div className="font-['JetBrains_Mono'] text-[10px] text-red-500/70 tracking-widest mb-3">{d.sub}</div>
              <p className="font-['JetBrains_Mono'] text-[10px] text-white/40 leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
        <div className="border border-white/10 p-6">
          <div className="font-['JetBrains_Mono'] text-xs text-white/30 tracking-widest mb-3">ACCOUNTABILITY LOOP ·· MATERIALIZED</div>
          <p className="font-['JetBrains_Mono'] text-sm text-white/60 leading-relaxed">The Command Center supports the Accountability Loop: the Operator logs the work, the coaching system organizes the review, and the next plan is adjusted from the available evidence. The preview above uses illustrative data and does not represent a client result.</p>
        </div>
      </Section>

      {/* ── COACH JAY ────────────────────────────────────────────────────── */}
      <Section id="coach-jay" index="06 /" title="THE OPERATOR" className="border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <img src={ASSETS.coachPortrait} alt="Coach Jay — Jordan Lee" className="w-full max-w-sm object-cover" />
            <div className="font-['JetBrains_Mono'] text-[10px] text-white/30 tracking-widest mt-3">
              CERTIFIED PERSONAL TRAINER · HOT SPRINGS, ARKANSAS · JAYLEE FIT — JLH INDUSTRIES LLC
            </div>
          </div>
          <div>
            <div className="font-['Bebas_Neue'] text-2xl text-white mb-6 border-l-2 border-red-600 pl-4">
              JAYLEE FIT IS NOT A GYM. IT IS AN OPERATING SYSTEM FOR YOUR BODY.
            </div>
            <p className="font-['JetBrains_Mono'] text-sm text-white/70 leading-relaxed mb-4">
              Jordan Lee — "Coach Jay" — is a certified personal trainer and the founder of JayLee Fit (JayLee Hustle Industries LLC), based in Hot Springs, Arkansas. He built his coaching practice on one belief: real results come from realistic systems, not extreme programs that fall apart in week two. MAO — the Master Orchestrator — is his coaching engine for operators who refuse soft programming and softer accountability.
            </p>
            <p className="font-['JetBrains_Mono'] text-sm text-white/70 leading-relaxed mb-8">
              Jordan coaches founders, athletes, and busy dads specifically because he understands the life — the early mornings, the packed schedules, the guilt of putting yourself last. His approach strips away the noise and builds programs that actually fit your week, your equipment, and your energy. Home-based training. No gym required. Real accountability.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { label: "SPECIALIZATIONS", items: ["Athletic performance","Fat loss","Functional strength","Metabolic efficiency","GLP-1 adaptation","Wearable data integration","12-week specialization programs"] },
                { label: "CREDENTIALS", items: ["NASM Certified Personal Trainer","Nutrition Certification","Advanced Programming","AI-Powered Coaching","15+ years coaching experience"] },
                { label: "MISSION", items: ["Build disciplined, capable bodies and operators through programmed recomposition and a relentless accountability loop."] },
                { label: "METHOD", items: ["Hustle First","Recomp over Vanity","Consistency over Intensity","Accountability Loop","Repeat for 12 weeks"] },
              ].map(b => (
                <div key={b.label}>
                  <div className="font-['JetBrains_Mono'] text-[10px] text-red-500 tracking-widest mb-2">{b.label}</div>
                  <ul className="space-y-1">
                    {b.items.map(i => (
                      <li key={i} className="font-['JetBrains_Mono'] text-[10px] text-white/50">{i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { stat: "100%", label: "Home-based programs" },
                { stat: "1:1", label: "Personal coaching" },
                { stat: "CUSTOM", label: "Every plan" },
                { stat: "REAL", label: "Accountability" },
              ].map(s => (
                <div key={s.stat} className="border border-white/10 p-3 text-center">
                  <div className="font-['Bebas_Neue'] text-2xl text-red-500">{s.stat}</div>
                  <div className="font-['JetBrains_Mono'] text-[9px] text-white/40 tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── PROOF ────────────────────────────────────────────────────────── */}
      <Section id="proof" index="07 /" title="THE RECEIPTS" className="border-t border-white/5">
        <div className="border border-white/10 p-8 text-center">
          <div className="font-['JetBrains_Mono'] text-xs text-white/30 tracking-widest mb-4">CLIENT RESULTS</div>
          <div className="font-['Bebas_Neue'] text-3xl text-white mb-4">VERIFIED TESTIMONIALS PUBLISHING SOON.</div>
          <p className="font-['JetBrains_Mono'] text-sm text-white/50">Ask Coach Jay for references during your qualification review.</p>
        </div>
      </Section>

      {/* ── GALLERY ──────────────────────────────────────────────────────── */}
      <Section id="gallery" index="09 /" title="THE STANDARD" className="border-t border-white/5">
        <p className="font-['JetBrains_Mono'] text-sm text-white/60 mb-8">Every Operator holds the same standard. Discipline. Focus. Consistency. Success.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { src: ASSETS.galleryOperatorFocus, caption: "OPERATOR FOCUS" },
            { src: ASSETS.galleryAbsoluteFocus, caption: "ABSOLUTE FOCUS" },
            { src: ASSETS.galleryTheVisionary, caption: "THE VISIONARY" },
          ].map(img => (
            <div key={img.caption} className="relative group cursor-pointer overflow-hidden aspect-[4/5]"
              onClick={() => setLightboxImg(img.src)}>
              <img src={img.src} alt={img.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-4 left-4 font-['JetBrains_Mono'] text-xs text-white tracking-widest">{img.caption}</div>
            </div>
          ))}
        </div>
        {lightboxImg && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
            <img src={lightboxImg} alt="Gallery" className="max-h-[90vh] max-w-full object-contain" />
            <button className="absolute top-4 right-4 text-white font-['JetBrains_Mono'] text-xs tracking-widest hover:text-red-400">CLOSE ✕</button>
          </div>
        )}
      </Section>

      {/* ── PAY INVOICE ──────────────────────────────────────────────────── */}
      <Section id="pay-invoice" index="08 /" title="PAY INVOICE" className="border-t border-white/5">
        <p className="font-['JetBrains_Mono'] text-sm text-white/60 max-w-2xl mb-4">
          For already-onboarded clients only. Once Coach Jay has approved your application and issued an Order ID, settle your invoice via PayPal below.
        </p>
        <div className="border border-red-600/30 p-4 bg-red-600/5 mb-8 inline-block">
          <span className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest">NEW HERE? RUN THE INTAKE ABOVE. MAO DOES NOT SELL OFF THE SHELF.</span>
        </div>
        <div className="grid lg:grid-cols-2 gap-10">
          {/* PayPal panel */}
          <div className="border border-white/10 p-6 min-w-0">
            <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-3">PAYPAL</div>
            <p className="font-['JetBrains_Mono'] text-xs text-white/60 mb-4">Send to the JayLee Hustle Industries PayPal handle:</p>
            <div className="flex items-center gap-3 bg-white/5 border border-white/20 px-4 py-3 mb-4 min-w-0">
              <span className="font-['JetBrains_Mono'] text-sm text-white flex-1 min-w-0 break-all">magicdeals.wholesale@gmail.com</span>
              <button onClick={() => navigator.clipboard.writeText("magicdeals.wholesale@gmail.com")}
                className="font-['JetBrains_Mono'] text-[10px] text-white/40 hover:text-white tracking-widest transition-colors">COPY</button>
            </div>
            <a href="https://www.paypal.com/" target="_blank" rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 border border-white/20 text-white font-['JetBrains_Mono'] text-xs tracking-widest hover:border-white/40 transition-colors">
              OPEN PAYPAL →
            </a>
          </div>
          {/* Self-report form */}
          <div className="border border-white/10 p-6 min-w-0">
            <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-1">PAYMENT // SELF-REPORT</div>
            <div className="font-['Bebas_Neue'] text-2xl text-white mb-2">ALREADY SENT PAYMENT?</div>
            <p className="font-['JetBrains_Mono'] text-xs text-white/50 mb-6">Submit your details and PayPal Transaction ID for manual review. A payment report is not confirmation; access begins only after the transaction is verified.</p>
            {payDone ? (
              <div className="text-center py-8">
                <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-2">// RECEIVED</div>
                <div className="font-['Bebas_Neue'] text-2xl text-white">PAYMENT REPORT RECEIVED</div>
                <p className="font-['JetBrains_Mono'] text-xs text-white/50 mt-2">Awaiting manual review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "NAME *", key: "name", type: "text", placeholder: "Full name" },
                  { label: "EMAIL *", key: "email", type: "email", placeholder: "your@email.com" },
                  { label: "AMOUNT *", key: "amount", type: "text", placeholder: "e.g. 500.00" },
                  { label: "ORDER ID *", key: "orderId", type: "text", placeholder: "Issued by Coach Jay" },
                  { label: "PAYPAL TRANSACTION ID *", key: "transactionId", type: "text", placeholder: "From your PayPal receipt" },
                ].map(f => (
                  <div key={f.key}>
                    <label className={labelCls}>{f.label}</label>
                    <input type={f.type} className={inputCls} placeholder={f.placeholder}
                      value={payForm[f.key as keyof typeof payForm]}
                      onChange={e => setPayForm({...payForm, [f.key]: e.target.value})} required />
                  </div>
                ))}
                <div>
                  <label className={labelCls}>METHOD *</label>
                  <select className={inputCls + " appearance-none"} value={payForm.method}
                    onChange={e => setPayForm({...payForm, method: e.target.value})}>
                    <option value="PayPal">PayPal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>NOTE</label>
                  <textarea className={`${inputCls} h-16 resize-none`} placeholder="Optional note"
                    value={payForm.note} onChange={e => setPayForm({...payForm, note: e.target.value})} />
                </div>
                {!capabilities.isPending && !paymentReportingAvailable && (
                  <p className="font-['JetBrains_Mono'] text-xs text-amber-200">PAYMENT REPORTING IS TEMPORARILY PAUSED. Do not submit transaction details until secure storage is connected.</p>
                )}
                {payMut.error && <p className="font-['JetBrains_Mono'] text-xs text-red-400">{payMut.error.message}</p>}
                <button onClick={() => payMut.mutate(payForm)} disabled={payMut.isPending || !paymentReportingAvailable || !payForm.name || !payForm.email || !payForm.amount || !payForm.orderId || !payForm.transactionId}
                  className="w-full py-3 bg-red-600 text-white font-['JetBrains_Mono'] text-xs tracking-widest hover:bg-red-500 transition-colors disabled:opacity-50">
                  {payMut.isPending ? "PROCESSING..." : "REPORT PAYMENT →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="font-['Bebas_Neue'] text-2xl text-white mb-3">JAYLEE FIT</div>
              <p className="font-['JetBrains_Mono'] text-xs text-white/40 leading-relaxed">High-performance coaching portal. Body recomposition, personal training, and hustle coaching orchestrated by the MAO operating system. Investment tiers — not subscriptions. By application only.</p>
            </div>
            <div>
              <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-3">CONTACT</div>
              <div className="font-['JetBrains_Mono'] text-xs text-white/50 space-y-1">
                <div>Jay.everydayhustleco@gmail.com</div>
                <div>PayPal: magicdeals.wholesale@gmail.com</div>
              </div>
            </div>
            <div>
              <div className="font-['JetBrains_Mono'] text-xs text-red-500 tracking-widest mb-3">SITEMAP</div>
              <div className="grid grid-cols-2 gap-1">
                {["#services","#apply","#investment","#sample-split","#ai-engine","#coach-jay","#proof","#gallery","#pay-invoice"].map(href => (
                  <a key={href} href={href} className="font-['JetBrains_Mono'] text-[10px] text-white/30 hover:text-white/60 tracking-widest transition-colors">
                    {href.slice(1).toUpperCase().replace(/-/g, " ")}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6">
            <p className="font-['JetBrains_Mono'] text-[10px] text-white/20 tracking-widest">
              © 2026 JAYLEE FIT · JAYLEE HUSTLE INDUSTRIES LLC — JAYLEEFIT.COM · MAO METHODOLOGY
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
