const paymentNameMap: Record<string, string> = {
  dana: "DANA",
  ovo: "OVO",
  blu_dd: "blu by BCA Digital",
};

export function getPaymentDisplayName(payment: string): string {
  const normalized = payment.trim().toLowerCase();
  if (!normalized) return "";

  return paymentNameMap[normalized] ?? payment.charAt(0).toUpperCase() + payment.slice(1);
}

export function withPaymentLabel(label: string, payment: string): string {
  const paymentName = getPaymentDisplayName(payment);
  return paymentName ? `${label} - ${paymentName}` : label;
}
