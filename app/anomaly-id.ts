export const anomalyLabels: Record<string, string> = {
  C: "代答（ID识别异常）",
  R: "结果异常（NPS/NSS异常）",
  T: "时间异常（时长判断过慢）",
  H: "人工审核结果异常",
  Y: "未检出异常",
};

export const anomalyFilterOptions = ["C", "R", "T", "H", "Y"] as const;

export function maskVin(value: string) {
  const vin = value.trim();
  if (!vin || vin === "—") return vin;
  if (vin.length <= 8) return `${vin.slice(0, 2)}${"•".repeat(Math.max(vin.length - 4, 1))}${vin.slice(-2)}`;
  return `${vin.slice(0, 4)}${"•".repeat(vin.length - 8)}${vin.slice(-4)}`;
}

export type AuditSignals = {
  deviceRisk: "正常" | "异常";
  npsQualified: "是" | "否";
  npsScore: number;
  salesNssScore: number;
  serviceNssScore: number;
  productNssScore: number;
  durationJudgement: "正常" | "过快" | "过慢";
  reviewStatus: "有效" | "无效";
};

export function resolveAnomalyId(signals: AuditSignals) {
  if (signals.deviceRisk === "异常") return "C";

  const npsIsHigh = signals.npsScore === 9 || signals.npsScore === 10;
  const npsIsLow = signals.npsScore >= 1 && signals.npsScore <= 6;
  const productNssIsLow = signals.productNssScore >= 1 && signals.productNssScore <= 6;
  const allNssAreHigh = [signals.salesNssScore, signals.serviceNssScore, signals.productNssScore].every((score) => score === 9 || score === 10);
  const resultIsAbnormal = (signals.npsQualified === "是" && npsIsHigh && productNssIsLow)
    || (signals.npsQualified === "否" && npsIsLow && allNssAreHigh);
  if (resultIsAbnormal) return "R";

  if (signals.durationJudgement === "过慢") return "T";
  if (signals.reviewStatus === "无效") return "H";
  return "Y";
}
