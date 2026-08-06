/** Collects presentation, formatting, and class-name utility functions. */
import { clsx } from 'clsx';
import { twMerge  } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactNumber(n) {
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const v = row[h];
          const s = v == null ? '' : String(v);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function randomId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Converts a simple CSV file into objects and reports malformed rows clearly. */
export function parseCSV(text) {
  const rows = text.trim().split(/\r?\n/).filter(Boolean);
  if (rows.length < 2) throw new Error('The CSV must include a header row and at least one record.');
  const parseRow = (line) => {
    const cells = [];
    let cell = ''; let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"' && line[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = !quoted;
      else if (char === ',' && !quoted) { cells.push(cell.trim()); cell = ''; }
      else cell += char;
    }
    cells.push(cell.trim());
    return cells;
  };
  const headers = parseRow(rows[0]).map((header) => header.trim());
  return rows.slice(1).map((line, index) => {
    const cells = parseRow(line);
    if (cells.length !== headers.length) throw new Error(`Row ${index + 2} has ${cells.length} values; expected ${headers.length}.`);
    return Object.fromEntries(headers.map((header, column) => [header, cells[column]]));
  });
}
