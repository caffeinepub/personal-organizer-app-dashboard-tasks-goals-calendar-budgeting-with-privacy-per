/**
 * Shared money utilities for parsing dollars to cents and formatting cents as USD currency.
 */

/**
 * Parse a dollar string/number to integer cents for backend storage.
 * @param dollars - Dollar amount as string or number (e.g., "12.34" or 12.34)
 * @returns Integer cents (e.g., 1234)
 */
export function dollarsToCents(dollars: string | number): number {
  const amount = typeof dollars === 'string' ? parseFloat(dollars) : dollars;
  if (isNaN(amount)) {
    throw new Error('Invalid dollar amount');
  }
  return Math.round(amount * 100);
}

/**
 * Format integer cents as USD currency string.
 * @param cents - Integer cents from backend (e.g., 1234)
 * @returns Formatted currency string (e.g., "$12.34")
 */
export function formatCentsAsCurrency(cents: number | bigint): string {
  const amount = typeof cents === 'bigint' ? Number(cents) : cents;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

/**
 * Convert integer cents to dollar decimal for form input display.
 * @param cents - Integer cents from backend (e.g., 1234)
 * @returns Dollar decimal string (e.g., "12.34")
 */
export function centsToDollars(cents: number | bigint): string {
  const amount = typeof cents === 'bigint' ? Number(cents) : cents;
  return (amount / 100).toFixed(2);
}
