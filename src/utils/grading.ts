import { GradingSystemType } from "../types";

export interface GradeResult {
  grade: string;
  remark: string;
  isPassing: boolean;
}

export function calculateGrade(score: number, system: GradingSystemType = "GES_9_STANINE"): GradeResult {
  const rounded = Math.round(score);

  if (system === "GES_9_STANINE") {
    if (rounded >= 80) return { grade: "1", remark: "Highest Distinction (Excellent)", isPassing: true };
    if (rounded >= 70) return { grade: "2", remark: "Higher Distinction (Very Good)", isPassing: true };
    if (rounded >= 65) return { grade: "3", remark: "High Credit (Good)", isPassing: true };
    if (rounded >= 60) return { grade: "4", remark: "Credit (Satisfactory)", isPassing: true };
    if (rounded >= 55) return { grade: "5", remark: "Lower Credit (Fair)", isPassing: true };
    if (rounded >= 50) return { grade: "6", remark: "Pass (Satisfactory)", isPassing: true };
    if (rounded >= 45) return { grade: "7", remark: "Lower Pass", isPassing: true };
    if (rounded >= 40) return { grade: "8", remark: "Weak Pass", isPassing: true };
    return { grade: "9", remark: "Fail", isPassing: false };
  } else {
    // WAEC WASSCE
    if (rounded >= 80) return { grade: "A1", remark: "Excellent", isPassing: true };
    if (rounded >= 70) return { grade: "B2", remark: "Very Good", isPassing: true };
    if (rounded >= 65) return { grade: "B3", remark: "Good", isPassing: true };
    if (rounded >= 60) return { grade: "C4", remark: "Credit", isPassing: true };
    if (rounded >= 55) return { grade: "C5", remark: "Credit", isPassing: true };
    if (rounded >= 50) return { grade: "C6", remark: "Credit", isPassing: true };
    if (rounded >= 45) return { grade: "D7", remark: "Pass", isPassing: true };
    if (rounded >= 40) return { grade: "E8", remark: "Pass", isPassing: true };
    return { grade: "F9", remark: "Fail", isPassing: false };
  }
}

export function formatOrdinal(n: number): string {
  const pr = new Intl.PluralRules("en-US", { type: "ordinal" });
  const suffixes: Record<string, string> = {
    one: "st",
    two: "nd",
    few: "rd",
    other: "th",
  };
  return `${n}${suffixes[pr.select(n)] || "th"}`;
}

export function formatGHS(amount: number): string {
  return `GH₵ ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculateTotalScore(
  classExercises: number, // out of 15
  homework: number, // out of 10
  projectMidTerm: number, // out of 15
  examScore: number, // raw exam mark (out of 100 or 60/70)
  caPercentage = 40,
  examPercentage = 60
): { totalCA: number; examWeighted: number; finalScore: number } {
  // Raw CA is out of 40 (15 + 10 + 15)
  const rawCA = Math.min(40, Math.max(0, classExercises + homework + projectMidTerm));
  
  let totalCA = rawCA;
  if (caPercentage === 30) {
    totalCA = Number(((rawCA / 40) * 30).toFixed(1));
  }

  // Exam Score calculation
  let examWeighted = examScore;
  if (examPercentage === 60 && examScore > 60) {
    // If exam was entered out of 100, scale to 60
    examWeighted = Number(((examScore / 100) * 60).toFixed(1));
  } else if (examPercentage === 70 && examScore > 70) {
    examWeighted = Number(((examScore / 100) * 70).toFixed(1));
  }

  const finalScore = Math.min(100, Math.round(totalCA + examWeighted));

  return {
    totalCA,
    examWeighted,
    finalScore,
  };
}
