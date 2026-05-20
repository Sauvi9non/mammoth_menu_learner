import type { StepItem } from "./types";

export function tempLabel(temp: string) {
  if (temp === "핫") return "핫";
  if (temp === "아이스") return "아이스";
  if (temp === "HOT ONLY") return "핫 전용";
  if (temp === "ICE ONLY") return "아이스 전용";
  return temp;
}

export function tempStyleClasses(temp: string) {
  if (temp === "핫" || temp === "HOT ONLY") {
    return ["text-mammoth-hot", "bg-mammoth-hotBg"];
  }

  if (temp === "아이스" || temp === "ICE ONLY") {
    return ["text-mammoth-ice", "bg-mammoth-iceBg"];
  }

  return ["text-mammoth-sub", "bg-[#EEE8DD]"];
}

export function isUncertainStep(step: StepItem) {
  const label = typeof step === "string" ? step : step.item;
  return /[?뭔|무슨|무언가|어떤]/.test(label);
}

export function renderStepLabel(step: StepItem) {
  return typeof step === "string" ? step : step.item;
}
