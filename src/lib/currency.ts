/**
 * Currency formatting utilities for Rwanda Francs (RWF)
 */

/**
 * Format amount in RWF currency
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: false, as RWF doesn't use decimals)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | null | undefined, showDecimals: boolean = false): string {
  if (amount === null || amount === undefined) {
    return 'RWF 0';
  }

  const formatted = showDecimals 
    ? amount.toLocaleString('en-RW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(amount).toLocaleString('en-RW');

  return `RWF ${formatted}`;
}

/**
 * Format amount in RWF currency (short version without "RWF" prefix)
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places
 * @returns Formatted amount string
 */
export function formatAmount(amount: number | null | undefined, showDecimals: boolean = false): string {
  if (amount === null || amount === undefined) {
    return '0';
  }

  return showDecimals 
    ? amount.toLocaleString('en-RW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(amount).toLocaleString('en-RW');
}

/**
 * Get currency symbol for Rwanda Francs
 */
export const CURRENCY_SYMBOL = 'RWF';

/**
 * Get currency code
 */
export const CURRENCY_CODE = 'RWF';
