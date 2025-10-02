export function formatCurrency(amount: number): string {
  // Format in Nepali Rupee (NPR) format with commas
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace('NPR', 'NPR');
}

export function parseCurrency(value: string): number {
  // Remove currency symbols and parse
  return parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
}

export function calculateVAT(amount: number, vatRate: number = 13): number {
  return (amount * vatRate) / 100;
}

export function addVAT(amount: number, vatRate: number = 13): number {
  return amount + calculateVAT(amount, vatRate);
}
