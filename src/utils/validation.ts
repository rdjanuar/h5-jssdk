export function isValidTransactionId(value: string): boolean {
  if (typeof value !== "string") {
    return false;
  }
  return /^[A-Za-z0-9_-]{1,100}$/.test(value);
}

export function isValidRefreshBalance(value: string): boolean {
  return value === "true" || value === "false";
}
