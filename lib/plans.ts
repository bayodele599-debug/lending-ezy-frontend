export type BorrowerType = "personal" | "business";

export type PlanInput = {
  type: BorrowerType;
  purpose: string;
  country: string;
  currency: string;
  amount: number;
  months: number;
  annualRate: number;
};

export type SavedPlan = PlanInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export const PLAN_STORAGE_KEY = "lending-ezy-plans-v1";
export const supportedCurrencies = ["USD", "GBP", "EUR", "CAD", "AUD", "SGD", "NGN", "ZAR", "INR", "AED", "KES", "GHS"] as const;
export const shortRepaymentTerms = [6, 12, 18, 24, 36, 48, 60] as const;
export const mortgageRepaymentTerms = [60, 120, 180, 240, 300, 360] as const;
export const repaymentTerms = [...shortRepaymentTerms, 120, 180, 240, 300, 360] as const;
export const termsForPurpose = (purpose: string) => purpose === "Home purchase & mortgage" ? mortgageRepaymentTerms : shortRepaymentTerms;
export const personalPurposes = ["Home & living", "Home purchase & mortgage", "Home improvement", "Education", "Car & transport", "Emergency expenses", "Family & life events", "Debt consolidation", "Other"];
export const businessPurposes = ["Working capital", "Equipment", "Expansion", "Inventory", "Cash flow", "Other"];

export const defaultPlan: PlanInput = {
  type: "personal",
  purpose: "Home & living",
  country: "US",
  currency: "USD",
  amount: 12000,
  months: 24,
  annualRate: 12
};

export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function money(value: number, currency: string): string {
  try { return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(value); }
  catch { return currency + " " + value.toFixed(2); }
}

export function amortization(amount: number, annualRate: number, months: number): PaymentRow[] {
  if (!(amount > 0) || !Number.isFinite(amount) || !Number.isFinite(annualRate) ||
      annualRate < 0 || annualRate > 40 || !Number.isInteger(months) || months < 1 || months > 360) return [];
  const rate = annualRate / 1200;
  const payment = rate ? amount * rate / (1 - Math.pow(1 + rate, -months)) : amount / months;
  let balance = roundMoney(amount);
  const rows: PaymentRow[] = [];
  for (let index = 1; index <= months; index++) {
    const interest = roundMoney(balance * rate);
    const principal = index === months ? balance : Math.min(balance, Math.max(0, roundMoney(payment - interest)));
    const paid = roundMoney(principal + interest);
    balance = roundMoney(Math.max(0, balance - principal));
    rows.push({ month: index, payment: paid, principal, interest, balance });
  }
  return rows;
}

export function summary(input: PlanInput) {
  const schedule = amortization(input.amount, input.annualRate, input.months);
  const total = roundMoney(schedule.reduce((acc, row) => acc + row.payment, 0));
  return {
    monthly: schedule[0]?.payment ?? 0,
    total,
    interest: roundMoney(Math.max(0, total - input.amount)),
    schedule
  };
}

export function validPlan(value: unknown): value is PlanInput {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (p.type === "personal" || p.type === "business") &&
    !(p.type === "business" && p.purpose === "Home purchase & mortgage") &&
    typeof p.purpose === "string" && p.purpose.length > 0 && p.purpose.length <= 80 &&
    typeof p.country === "string" && /^[A-Z]{2}$/.test(p.country) &&
    typeof p.currency === "string" && supportedCurrencies.some(x => x === p.currency) &&
    typeof p.amount === "number" && Number.isFinite(p.amount) && p.amount >= 500 && p.amount <= 10000000 &&
    typeof p.months === "number" && termsForPurpose(p.purpose as string).some(x => x === p.months) &&
    typeof p.annualRate === "number" && Number.isFinite(p.annualRate) && p.annualRate >= 0 && p.annualRate <= 40;
}

// Store financing assumptions only. Never put contact details, credentials or identity data in the browser planner.
export function readPlans(): SavedPlan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return [];
    const items: unknown = JSON.parse(raw);
    if (!Array.isArray(items)) return [];
    return items
      .filter((item): item is SavedPlan => {
        if (!validPlan(item)) return false;
        const saved = item as SavedPlan;
        return typeof saved.id === "string" && saved.id.length <= 100 &&
          typeof saved.createdAt === "string" && typeof saved.updatedAt === "string";
      })
      .slice(0, 25);
  } catch { return []; }
}

export function savePlan(plan: PlanInput, editingId?: string): SavedPlan {
  if (!validPlan(plan)) throw new Error("Please review all required fields before saving.");
  if (typeof window === "undefined") throw new Error("Saving is available in your browser.");
  const items = readPlans();
  const existing = editingId ? items.find(item => item.id === editingId) : undefined;
  if (!existing && items.length >= 25) throw new Error("You have reached the 25-plan limit. Remove a plan before saving another.");
  const now = new Date().toISOString();
  const next: SavedPlan = {
    ...plan,
    id: existing?.id || (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random().toString(36).slice(2)),
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
  const collection = [next, ...items.filter(x => x.id !== next.id)];
  try { window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(collection)); }
  catch { throw new Error("Your browser could not save this plan. Check available storage or private browsing settings."); }
  return next;
}

export function removePlan(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(readPlans().filter(item => item.id !== id)));
}

export function downloadSchedule(plan: PlanInput, filename = "lending-ezy-plan.csv"): void {
  if (typeof document === "undefined") return;
  const rows = summary(plan).schedule;
  const header = [
    "Lending Ezy - Repayment plan",
    "Currency," + plan.currency,
    "Amount," + plan.amount,
    "Term (months)," + plan.months,
    "Assumed nominal annual interest (%)," + plan.annualRate,
    "Estimates only. Excludes fees and other charges.",
    "",
    "Month,Payment,Principal,Interest,Remaining balance"
  ];
  const content = [...header, ...rows.map(x => [x.month, x.payment.toFixed(2), x.principal.toFixed(2), x.interest.toFixed(2), x.balance.toFixed(2)].join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
