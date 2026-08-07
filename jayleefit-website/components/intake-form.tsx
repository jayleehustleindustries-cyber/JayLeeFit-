"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IntakeFormSchema, type IntakeFormData } from "@/lib/form-validation";
import { useState } from "react";

interface IntakeFormProps {
  onSuccess: () => void;
}

const goals = [
  { value: "fat_loss", label: "Fat Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "performance", label: "Performance" },
  { value: "general_health", label: "General Health" },
];

export default function IntakeForm({ onSuccess }: IntakeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IntakeFormData>({
    resolver: zodResolver(IntakeFormSchema),
  });

  const toggleGoal = (goal: string) => {
    const updated = selectedGoals.includes(goal)
      ? selectedGoals.filter((g) => g !== goal)
      : [...selectedGoals, goal];
    setSelectedGoals(updated);
    setValue("goals", updated);
  };

  const onSubmit = async (data: IntakeFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit intake");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name")}
          type="text"
          className="w-full px-4 py-2 bg-dark-secondary border border-accent/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent"
          placeholder="Your name"
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          {...register("email")}
          type="email"
          className="w-full px-4 py-2 bg-dark-secondary border border-accent/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent"
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Phone (optional)
        </label>
        <input
          {...register("phone")}
          type="tel"
          className="w-full px-4 py-2 bg-dark-secondary border border-accent/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent"
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && (
          <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Goals */}
      <div>
        <label className="block text-sm font-semibold mb-3">
          Fitness Goals <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {goals.map((goal) => (
            <label key={goal.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGoals.includes(goal.value)}
                onChange={() => toggleGoal(goal.value)}
                className="w-4 h-4 rounded border border-accent/30 bg-dark-secondary cursor-pointer accent-accent"
              />
              <span>{goal.label}</span>
            </label>
          ))}
        </div>
        {errors.goals && (
          <p className="text-red-400 text-sm mt-1">{errors.goals.message}</p>
        )}
      </div>

      {/* Weight */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Current Weight in kg (optional)
        </label>
        <input
          {...register("weight")}
          type="number"
          step="0.1"
          className="w-full px-4 py-2 bg-dark-secondary border border-accent/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent"
          placeholder="e.g. 75.5"
        />
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Timezone (optional)
        </label>
        <input
          {...register("timezone")}
          type="text"
          className="w-full px-4 py-2 bg-dark-secondary border border-accent/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent"
          placeholder="e.g. EST, PST, UTC"
        />
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Budget Expectation (optional)
        </label>
        <select
          {...register("budget")}
          className="w-full px-4 py-2 bg-dark-secondary border border-accent/30 rounded text-white focus:outline-none focus:border-accent"
        >
          <option value="">Select a range</option>
          <option value="<100">Under $100/month</option>
          <option value="100-200">$100–$200/month</option>
          <option value="200-400">$200–$400/month</option>
          <option value=">400">$400+/month</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Additional Notes (optional)
        </label>
        <textarea
          {...register("notes")}
          className="w-full px-4 py-2 bg-dark-secondary border border-accent/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent"
          placeholder="Tell us about your fitness journey, any injuries, etc."
          rows={4}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit Intake Form"}
      </button>

      <p className="text-gray-400 text-sm text-center">
        We'll review your intake and reach out within 24 hours.
      </p>
    </form>
  );
}
