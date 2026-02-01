/**
 * Format a number as Tunisian Dinar currency
 * @param amount Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
