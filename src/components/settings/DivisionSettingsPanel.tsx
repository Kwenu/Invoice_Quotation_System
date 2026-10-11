import React, { useRef } from 'react';
import { toast } from 'sonner';
import { Trash2Icon, UploadIcon } from 'lucide-react';
import { divisions } from '../../data/divisions';
import type { DivisionId, PaymentDetails } from '../../types/document';
import type { AppSettings, DivisionSettings } from '../../types/settings';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { SettingsGroup } from './SettingsGroup';

interface PanelProps {
  value: AppSettings;
  onChange: (value: AppSettings) => void;
}

const MAX_SIGNATURE_BYTES = 400 * 1024;

export function DivisionSettingsPanel({ value, onChange }: PanelProps) {
  const fileRefs = useRef<Partial<Record<DivisionId, HTMLInputElement | null>>>({});

  const setDivision = (id: DivisionId, patch: Partial<DivisionSettings>) =>
  onChange({ ...value, divisions: { ...value.divisions, [id]: { ...value.divisions[id], ...patch } } });

  const setPayment = (id: DivisionId, key: keyof PaymentDetails, v: string) =>
  setDivision(id, { paymentDetails: { ...value.divisions[id].paymentDetails, [key]: v } });

  const handleSignature = (id: DivisionId, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Upload a PNG or JPG image.');
    if (file.size > MAX_SIGNATURE_BYTES) return toast.error('Signature image must be under 400 KB.');
    const reader = new FileReader();
    reader.onload = () => setDivision(id, { signatureDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <>
      {divisions.map((d) => {
        const s = value.divisions[d.id];
        return (
          <SettingsGroup key={d.id} title={d.name} description="Defaults for new documents in this division. Existing documents keep their own copy.">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Footer brand line" value={s.brandLine} onChange={(e) => setDivision(d.id, { brandLine: e.target.value })} hint="Printed letter-spaced at the page foot." />
                <TextField label="Company line" value={s.companyLine} onChange={(e) => setDivision(d.id, { companyLine: e.target.value })} />
                {d.id === 'startup' &&
                <TextField label="Quotation tagline" containerClassName="sm:col-span-2" value={s.tagline} onChange={(e) => setDivision(d.id, { tagline: e.target.value })} />
                }
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Authorised representative</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Name" value={s.representative.name} onChange={(e) => setDivision(d.id, { representative: { ...s.representative, name: e.target.value } })} />
                  <TextField label="Designation" value={s.representative.designation} onChange={(e) => setDivision(d.id, { representative: { ...s.representative, designation: e.target.value } })} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-line-strong p-4">
                  <div className="flex h-16 w-40 items-center justify-center rounded-lg bg-canvas">
                    {s.signatureDataUrl ?
                    <img src={s.signatureDataUrl} alt={`${s.representative.name} signature`} className="max-h-14 max-w-[150px] object-contain" /> :

                    <span className="text-xs text-ink-faint">No signature</span>
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">Signature image</p>
                    <p className="text-xs text-ink-muted">Transparent PNG works best. Printed above the company line.</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={(el) => fileRefs.current[d.id] = el}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="sr-only"
                      aria-label={`Upload signature for ${d.name}`}
                      onChange={(e) => {
                        handleSignature(d.id, e.target.files?.[0]);
                        e.target.value = '';
                      }} />
                    
                    <Button variant="secondary" size="sm" icon={UploadIcon} onClick={() => fileRefs.current[d.id]?.click()}>
                      {s.signatureDataUrl ? 'Replace' : 'Upload'}
                    </Button>
                    {s.signatureDataUrl &&
                    <Button variant="ghost" size="sm" icon={Trash2Icon} onClick={() => setDivision(d.id, { signatureDataUrl: '' })}>
                        Remove
                      </Button>
                    }
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Payment details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Payment method" placeholder="e.g. Bank transfer" value={s.paymentDetails.method} onChange={(e) => setPayment(d.id, 'method', e.target.value)} />
                  <TextField label="Account holder" value={s.paymentDetails.accountHolder} onChange={(e) => setPayment(d.id, 'accountHolder', e.target.value)} />
                  <TextField label="Bank name" value={s.paymentDetails.bankName} onChange={(e) => setPayment(d.id, 'bankName', e.target.value)} />
                  <TextField label="Account number" value={s.paymentDetails.accountNumber} onChange={(e) => setPayment(d.id, 'accountNumber', e.target.value)} />
                  <TextField label="Branch" value={s.paymentDetails.branch} onChange={(e) => setPayment(d.id, 'branch', e.target.value)} />
                  <TextField label="Default reference" value={s.paymentDetails.reference} onChange={(e) => setPayment(d.id, 'reference', e.target.value)} />
                </div>
              </div>
            </div>
          </SettingsGroup>);

      })}
    </>);

}