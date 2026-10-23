export default function currency(n: number): string {
  // round to paise; "|| 0" turns -0 and NaN into 0
  const rounded = Math.round(n * 100) / 100 || 0;

  // whole rupees show as ₹240, amounts with paise show as ₹10.50
  const digits = Number.isInteger(rounded) ? 0 : 2;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(rounded);
}