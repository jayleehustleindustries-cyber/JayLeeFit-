"use client";

import { useState } from "react";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
  "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

type Status = "idle" | "submitting" | "success" | "error";

export default function ProgramPackForm({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/program-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, state, source }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong. Try again.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-8 border border-line p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-gold">Sent</p>
        <p className="mt-2 font-sans text-sm text-chalk/90">
          Check your inbox — the program-builder pack is on its way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-ash">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border border-line bg-panel px-4 py-3 font-sans text-sm text-chalk placeholder:text-ash focus:border-gold focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="state" className="font-mono text-xs uppercase tracking-widest text-ash">
          State (optional)
        </label>
        <select
          id="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="border border-line bg-panel px-4 py-3 font-sans text-sm text-chalk focus:border-gold focus:outline-none"
        >
          <option value="">Prefer not to say</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="font-sans text-sm text-ember">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 bg-gold px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-void hover:opacity-90 disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send Me The Pack"}
      </button>
    </form>
  );
}
