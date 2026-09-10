/**
 * Utility untuk mengekspor data array ke file CSV (Excel-compatible).
 * Menyertakan UTF-8 Byte Order Mark (BOM) agar teks, angka, dan karakter khusus
 * langsung terbaca rapi dan terpisah kolom di Microsoft Excel Windows.
 */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const sanitizeCell = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
  const dataRows = rows.map((row) => row.map(sanitizeCell).join(','));
  const csvContent = [headerRow, ...dataRows].join('\r\n');

  // Prefix with UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
