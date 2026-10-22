import type { DivisionId, LingoDocument, TemplateId } from '../types/document';
import type { AppSettings } from '../types/settings';

/**
 * "Lingo Assignment Helpers" is no longer a separate company — its work is billed under Lingo Startup Company.
 * Records saved before that change (browser storage, backups or the Supabase database) are upgraded on load
 * so nothing disappears or breaks. Documents keep their original number (e.g. INV-AH-2026-0112).
 */
const LEGACY_DIVISION = 'assignment-helpers';
const LEGACY_TEMPLATE = 'assignment-invoice';

export function migrateLegacyDocument(doc: LingoDocument): LingoDocument {
  const division = doc.division as string;
  const templateId = doc.templateId as string;
  if (division !== LEGACY_DIVISION && templateId !== LEGACY_TEMPLATE) return doc;
  const nextDivision: DivisionId = division === LEGACY_DIVISION ? 'startup' : doc.division;
  const nextTemplate: TemplateId = templateId === LEGACY_TEMPLATE ? 'startup-invoice' : doc.templateId;
  return { ...doc, division: nextDivision, templateId: nextTemplate };
}

/** Removes settings that belonged to the retired division / templates so they don't linger in storage. */
export function stripLegacySettings(settings: AppSettings): AppSettings {
  const clean = <T extends object>(record: T, keys: string[]): T => {
    const copy = { ...record } as Record<string, unknown>;
    keys.forEach((k) => delete copy[k]);
    return copy as T;
  };
  return {
    ...settings,
    divisions: clean(settings.divisions, [LEGACY_DIVISION]),
    templates: clean(settings.templates, [LEGACY_TEMPLATE]),
    numbering: clean(settings.numbering, [LEGACY_TEMPLATE])
  };
}
