/**
 * Centralized formatting utilities
 * Adheres to DRY principle across frontend views and reports.
 */

/**
 * Formats a number to Indonesian Rupiah (e.g. Rp 25.000)
 */
export function formatRupiah(amount: number): string {
  return `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
}

/**
 * Formats date string/object to Indonesian locale standard
 * (e.g. 15 Agustus 2025 or Jumat, 15 Agustus 2025)
 */
export function formatDateIndo(
  dateInput: string | Date | null | undefined,
  withDay = false
): string {
  if (!dateInput) return '-';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(withDay ? { weekday: 'long' } : {}),
    };
    return date.toLocaleDateString('id-ID', options);
  } catch {
    return String(dateInput);
  }
}

/**
 * Calculates percentage safely avoiding NaN / division by zero.
 */
export function formatPercentage(value: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}
