export type ProgramGoal = "recomposition" | "fat-loss" | "hypertrophy" | "strength";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type EquipmentAccess = "full-gym" | "home" | "bodyweight";

export type ProgramArchitectInput = {
  weightLb: number;
  goal: ProgramGoal;
  experience: ExperienceLevel;
  daysPerWeek: 3 | 4 | 5 | 6;
  equipment: EquipmentAccess;
  focus: string;
};

export type ProgramArchitectOutput = {
  calories: number | null;
  protein: number;
  carbs: number | null;
  fats: number | null;
  split: string;
  schedule: string[];
  directive: string;
  nutritionNote: string;
};

const schedules: Record<ProgramArchitectInput["daysPerWeek"], { split: string; days: string[] }> = {
  3: { split: "FULL BODY A / B / C", days: ["DAY 1 · FULL BODY A", "DAY 2 · FULL BODY B", "DAY 3 · FULL BODY C"] },
  4: { split: "UPPER / LOWER", days: ["DAY 1 · UPPER A", "DAY 2 · LOWER A", "DAY 3 · UPPER B", "DAY 4 · LOWER B"] },
  5: { split: "PUSH / PULL / LEGS / UPPER / LOWER", days: ["DAY 1 · PUSH", "DAY 2 · PULL", "DAY 3 · LEGS", "DAY 4 · UPPER", "DAY 5 · LOWER"] },
  6: { split: "PUSH / PULL / LEGS × 2", days: ["DAY 1 · PUSH", "DAY 2 · PULL", "DAY 3 · LEGS", "DAY 4 · PUSH", "DAY 5 · PULL", "DAY 6 · LEGS"] },
};

const goalTargets: Record<Exclude<ProgramGoal, "strength">, { calorieFactor: number; proteinFactor: number; carbFactor: number; fatFactor: number }> = {
  recomposition: { calorieFactor: 14, proteinFactor: 1, carbFactor: 1.2, fatFactor: 0.35 },
  "fat-loss": { calorieFactor: 11.5, proteinFactor: 1.1, carbFactor: 0.8, fatFactor: 0.3 },
  hypertrophy: { calorieFactor: 16.5, proteinFactor: 1, carbFactor: 1.8, fatFactor: 0.35 },
};

export function buildProgram(input: ProgramArchitectInput): ProgramArchitectOutput {
  if (!Number.isFinite(input.weightLb) || input.weightLb < 80 || input.weightLb > 500) {
    throw new Error("Enter a body weight between 80 and 500 lb.");
  }

  const schedule = schedules[input.daysPerWeek];
  const focus = input.focus.trim() || "balanced development";
  const equipment = input.equipment === "full-gym" ? "full-gym" : input.equipment === "home" ? "home-equipment" : "bodyweight";
  const effort = input.experience === "beginner" ? "Keep 3 reps in reserve" : input.experience === "intermediate" ? "Keep 2 reps in reserve" : "Keep 1–2 reps in reserve";
  const directive = `${effort}; use controlled 3-second lowering phases where technique stays solid. Prioritize ${focus} within a ${equipment} setup, add load or reps only after every prescribed rep is clean, and stop any movement that causes sharp pain.`;

  if (input.goal === "strength") {
    return {
      calories: null,
      protein: Math.round(input.weightLb),
      carbs: null,
      fats: null,
      split: schedule.split,
      schedule: schedule.days,
      directive,
      nutritionNote: "The source blueprint does not define a strength-specific calorie or carb formula. Protein is shown as a general starting estimate; calories and full macros require an individual review.",
    };
  }

  const target = goalTargets[input.goal];
  return {
    calories: Math.round((input.weightLb * target.calorieFactor) / 10) * 10,
    protein: Math.round(input.weightLb * target.proteinFactor),
    carbs: Math.round(input.weightLb * target.carbFactor),
    fats: Math.round(input.weightLb * target.fatFactor),
    split: schedule.split,
    schedule: schedule.days,
    directive,
    nutritionNote: "Educational starting estimate only—not medical or dietary advice. Adjust from real progress, recovery, preferences, and guidance from a qualified professional.",
  };
}
