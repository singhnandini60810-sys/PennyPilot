export function formatCurrency(
  amount: number | string,
  currency: string = "INR",
): string {
  const value =
    typeof amount === "number"
      ? amount
      : Number(amount);

  if (Number.isNaN(value)) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(0);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}