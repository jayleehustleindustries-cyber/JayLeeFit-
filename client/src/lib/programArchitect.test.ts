import { describe, expect, it } from "vitest";
import { buildProgram } from "./programArchitect";

describe("buildProgram", () => {
  it("builds the Drive-defined four-day recomp starting targets", () => {
    const result = buildProgram({ weightLb: 200, goal: "recomposition", experience: "intermediate", daysPerWeek: 4, equipment: "home", focus: "shoulders" });
    expect(result.calories).toBe(2800);
    expect(result.protein).toBe(200);
    expect(result.carbs).toBe(240);
    expect(result.fats).toBe(70);
    expect(result.split).toBe("UPPER / LOWER");
    expect(result.schedule).toHaveLength(4);
  });

  it("does not invent missing strength nutrition targets", () => {
    const result = buildProgram({ weightLb: 180, goal: "strength", experience: "advanced", daysPerWeek: 3, equipment: "full-gym", focus: "" });
    expect(result.calories).toBeNull();
    expect(result.carbs).toBeNull();
    expect(result.fats).toBeNull();
    expect(result.protein).toBe(180);
  });

  it("rejects implausible weights", () => {
    expect(() => buildProgram({ weightLb: 20, goal: "fat-loss", experience: "beginner", daysPerWeek: 3, equipment: "bodyweight", focus: "" })).toThrow(/between 80 and 500/);
  });
});
