import type { Institution, Report } from "./reportData";

export type Message = { id: number; role: "assistant" | "user"; text: string };

export function greeting(institution: Institution, report: Report, signedIn: boolean): Message {
  return {
    id: 0,
    role: "assistant",
    text: `Ask me anything about ${institution.name}'s ${report.fy} report — revenue, expenses, the endowment, or a specific fund. ${
      signedIn ? "You're signed in, so this conversation is saved to your portal." : "This is a guest session, so nothing here is saved."
    }`,
  };
}

export function chatStorageKey(email: string, institutionSlug: string, year: number) {
  return `pass-impact:chat:${email}:${institutionSlug}:${year}`;
}

function findLineItem(items: { label: string; value: number }[], keyword: string) {
  return items.find((i) => i.label.toLowerCase().includes(keyword));
}

export function answerFor(question: string, institution: Institution, report: Report, previousReport?: Report): string {
  const q = question.toLowerCase();
  const { lockbox, revenueBySource, expenseByFunction, auditOpinion } = report;
  const { namedFundsAvailable } = institution;

  if (/(hi|hello|hey)\b/.test(q)) {
    return `Hi — ask me about revenue, expenses, the endowment, or a named fund in ${institution.name}'s ${report.fy} report.`;
  }
  if (q.includes("endowment") || q.includes("lockbox") || q.includes("payout") || q.includes("spending rate")) {
    const share = ((lockbox.annualPayout / report.totalRevenue) * 100).toFixed(1);
    return `The endowment is $${lockbox.endowmentTotal.toFixed(1)}B. About ${(lockbox.permanentlyRestricted * 100).toFixed(0)}% is permanently restricted, and at a ${(lockbox.spendingRate * 100).toFixed(1)}% spending rate the annual payout is roughly $${lockbox.annualPayout.toFixed(2)}B — about ${share}% of this year's operating budget. Source: Endowment Note, ${report.fy} audited statement.`;
  }
  if (q.includes("gift") || q.includes("donat") || q.includes("private")) {
    if (!previousReport) {
      return `Private gifts (operating) were $${report.privateGiftsOperating.toFixed(2)}B in ${report.fy}. Source: Statement of Activities, ${report.fy}.`;
    }
    const growth = (((report.privateGiftsOperating - previousReport.privateGiftsOperating) / previousReport.privateGiftsOperating) * 100).toFixed(0);
    return `Private gifts (operating) were $${report.privateGiftsOperating.toFixed(2)}B in ${report.fy}, up ${growth}% from $${previousReport.privateGiftsOperating.toFixed(2)}B in ${previousReport.fy}. Source: Statement of Activities, ${report.fy}.`;
  }
  if (q.includes("tuition")) {
    const item = findLineItem(revenueBySource, "tuition");
    if (!item) return "Not disclosed in this report — I don't want to guess.";
    return `Tuition & fees came to $${item.value.toFixed(2)}B in ${report.fy}, about ${((item.value / report.totalRevenue) * 100).toFixed(1)}% of total revenue. Source: Statement of Activities, ${report.fy}.`;
  }
  if (q.includes("patient") || q.includes("health")) {
    const item = findLineItem(revenueBySource, "patient");
    if (!item) return `Not disclosed in this report — ${institution.name} doesn't appear to run a health system with its own revenue line in this filing.`;
    return `Patient care & health system revenue was $${item.value.toFixed(2)}B in ${report.fy} — about ${((item.value / report.totalRevenue) * 100).toFixed(0)}% of total revenue. Source: Statement of Activities, ${report.fy}.`;
  }
  if (q.includes("research")) {
    const item = findLineItem(expenseByFunction, "research");
    if (!item) return "Not disclosed in this report.";
    return `Research expenses were $${item.value.toFixed(2)}B in ${report.fy}. Source: Statement of Activities, ${report.fy}.`;
  }
  if (q.includes("audit") || q.includes("opinion")) {
    return `The auditors issued an ${auditOpinion.toLowerCase()} (clean) opinion for ${report.fy} — no qualifications noted. Source: Auditor's Opinion letter.`;
  }
  if (q.includes("revenue") || q.includes("income")) {
    const top = [...revenueBySource].sort((a, b) => b.value - a.value)[0];
    return `Total revenue was $${report.totalRevenue.toFixed(2)}B in ${report.fy}. ${top.label} is the largest source. Source: Statement of Activities, ${report.fy}.`;
  }
  if (q.includes("expense") || q.includes("spend") || q.includes("cost")) {
    return `Total expenses were $${report.totalExpenses.toFixed(2)}B in ${report.fy}, leaving a net position change of ${report.netPosition >= 0 ? "+" : ""}$${report.netPosition.toFixed(2)}B. Source: Statement of Activities, ${report.fy}.`;
  }
  if (q.includes("year") && (q.includes("other") || q.includes("previous") || q.includes("available") || q.includes("history"))) {
    return `This report is for ${report.fy}. Use the university's report list to see other years on file, or the Year Lens below to compare across years.`;
  }
  const namedFund = namedFundsAvailable.find((f) => q.includes(f.toLowerCase().split(" ")[0]));
  if (namedFund) {
    return `${namedFund} is listed among ${institution.name}'s named funds, but this sample report doesn't include payout or beneficiary detail for it. Not disclosed in this report.`;
  }
  return "Not disclosed in this report — I don't want to guess. Try asking about total revenue, expenses, the endowment, tuition, or patient care instead.";
}
