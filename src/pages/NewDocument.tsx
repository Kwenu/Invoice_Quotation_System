import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, FileSignatureIcon, FileTextIcon } from 'lucide-react';
import { divisions, templateAssignments } from '../data/divisions';
import { Button } from '../components/ui/Button';
import type { DivisionId, DocumentType } from '../types/document';
import { isDocumentType, resolveTemplate } from '../utils/documentFactory';

export function NewDocument() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const presetType = params.get('type') ?? undefined;
  const clientId = params.get('clientId');
  const [division, setDivision] = useState<DivisionId | null>(null);
  const [type, setType] = useState<DocumentType>(isDocumentType(presetType) ? presetType : 'invoice');

  const types: {id: DocumentType;label: string;description: string;icon: typeof FileTextIcon;}[] = [
  { id: 'invoice', label: 'Invoice', description: 'Bill a client, track advances and payments.', icon: FileTextIcon },
  { id: 'quotation', label: 'Quotation', description: 'Propose pricing; convert to an invoice once accepted.', icon: FileSignatureIcon }];


  const canContinue = division !== null && resolveTemplate(division, type) !== null;
  const go = () => {
    if (!division || !canContinue) return;
    navigate(`/documents/new/${division}/${type}${clientId ? `?clientId=${clientId}` : ''}`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
      <Link to="/documents" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden /> Documents
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Create a document</h1>
      <p className="mt-1 text-sm text-ink-muted">Each division has its own template and numbering sequence.</p>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold text-ink">Business division</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup">
          {divisions.map((d) => {
            const selected = division === d.id;
            return (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setDivision(d.id);
                  if (!resolveTemplate(d.id, type)) setType('invoice');
                }}
                className={`relative flex flex-col rounded-2xl border bg-white p-5 text-left transition-[border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${
                selected ? 'border-ink shadow-[0_0_0_1px_#0E1016]' : 'border-line hover:border-line-strong'}`
                }>
                
                <span className="flex items-center justify-between">
                  <span className="text-base font-semibold text-ink">{d.name}</span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-ink bg-ink text-white' : 'border-line-strong'}`}>
                    {selected && <CheckIcon className="h-3 w-3" aria-hidden />}
                  </span>
                </span>
                <span className="mt-2 text-sm text-ink-muted">{d.summary}</span>
                <span className="mt-4 text-xs text-ink-faint">
                  Templates: {templateAssignments.filter((t) => t.division === d.id).map((t) => t.reference).join(', ')}
                </span>
              </button>);

          })}
        </div>
      </fieldset>

      <fieldset className="mt-8" disabled={!division}>
        <legend className={`text-sm font-semibold ${division ? 'text-ink' : 'text-ink-faint'}`}>Document type</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup">
          {types.map((t) => {
            const available = division ? resolveTemplate(division, t.id) !== null : true;
            const selected = type === t.id && available;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!division || !available}
                onClick={() => setType(t.id)}
                className={`flex items-start gap-3 rounded-2xl border bg-white p-4 text-left transition-[border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:cursor-not-allowed disabled:opacity-50 ${
                selected && division ? 'border-ink shadow-[0_0_0_1px_#0E1016]' : 'border-line hover:border-line-strong'}`
                }>
                
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink-soft">
                  <t.icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">{t.label}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {available ? t.description : 'No quotation template is configured for this division yet.'}
                  </span>
                </span>
              </button>);

          })}
        </div>
      </fieldset>

      <div className="mt-8 flex justify-end">
        <Button onClick={go} disabled={!canContinue}>
          Continue <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>);

}