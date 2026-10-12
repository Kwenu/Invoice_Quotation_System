import type { NumberingConfig } from '../types/settings';

export function formatDocumentNumber(config: NumberingConfig, sequence: number, issueDate?: string): string {
  const year = issueDate ? issueDate.slice(0, 4) : String(new Date().getFullYear());
  const parts: string[] = [];
  if (config.prefix.trim()) parts.push(config.prefix.trim());
  if (config.yearFormat === 'YYYY') parts.push(year);
  if (config.yearFormat === 'YY') parts.push(year.slice(-2));
  parts.push(String(Math.max(1, Math.floor(sequence))).padStart(Math.max(1, config.padding), '0'));
  return parts.join(config.separator);
}

/** Allocates the next free number, skipping any that already exist. */
export function allocateNumber(
config: NumberingConfig,
taken: Set<string>,
issueDate?: string)
: {number: string;nextNumber: number;} {
  let sequence = Math.max(1, Math.floor(config.nextNumber));
  let candidate = formatDocumentNumber(config, sequence, issueDate);
  while (taken.has(candidate)) {
    sequence += 1;
    candidate = formatDocumentNumber(config, sequence, issueDate);
  }
  return { number: candidate, nextNumber: sequence + 1 };
}

/** True when `number` is the most recently allocated number of its series — safe to hand out again after deleting that document. */
export function isLatestNumber(config: NumberingConfig | undefined, number: string, issueDate?: string): boolean {
  if (!config || config.nextNumber <= 1) return false;
  return number === formatDocumentNumber(config, config.nextNumber - 1, issueDate);
}
