import React, { useMemo, useState } from 'react';
import { Link, useBlocker, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircleIcon, ArrowLeftIcon, CheckIcon, HistoryIcon, SaveIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useDocumentEditor } from '../../hooks/useDocumentEditor';
import type { LingoDocument } from '../../types/document';
import { divisionInfo, templateInfo } from '../../utils/documentFactory';
import { formatTimestamp, relativeTime } from '../../utils/format';
import { formatDocumentNumber } from '../../utils/numbering';
import { DocumentPreview } from '../documents/DocumentPreview';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SegmentedTabs } from '../ui/SegmentedTabs';
import { ClientSection } from './ClientSection';
import { DetailsSection } from './DetailsSection';
import { LineItemsEditor } from './LineItemsEditor';
import { NotesSection } from './NotesSection';
import { PaymentDetailsSection } from './PaymentDetailsSection';
import { PaymentsSection } from './PaymentsSection';
import { TotalsSection } from './TotalsSection';

export function EditorWorkspace({ initial }: {initial: LingoDocument;}) {
  const { settings } = useData();
  const navigate = useNavigate();
  const editor = useDocumentEditor(initial);
  const { doc, update, totals, errors, dirty, lastSavedAt, isPersisted, save, recovery, restoreRecovery, discardRecovery, allowNavigation, shouldBlock } = editor;
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

  const blocker = useBlocker(({ currentLocation, nextLocation }) => shouldBlock() && currentLocation.pathname !== nextLocation.pathname);

  const template = templateInfo(doc.templateId);
  const numbering = settings.numbering[doc.templateId];
  const provisional = formatDocumentNumber(numbering, numbering.nextNumber, doc.issueDate);
  const previewDoc = useMemo(() => ({ ...doc, number: doc.number || provisional }), [doc, provisional]);
  const currency = settings.currencySymbol;
  const isDraft = doc.status === 'draft';
  const errorList = Object.values(errors).filter(Boolean) as string[];

  const handleSaveDraft = () => {
    const wasPersisted = isPersisted;
    const saved = save('draft');
    if (!saved) return;
    toast.success(`Draft ${saved.number} saved`);
    if (!wasPersisted) {
      allowNavigation();
      navigate(`/documents/${saved.id}/edit`, { replace: true });
    }
  };

  const handleSaveFinal = () => {
    const saved = save('final');
    if (!saved) return;
    toast.success(`${saved.number} saved`);
    allowNavigation();
    navigate(`/documents/${saved.id}`);
  };

  const saveState = dirty ?
  isPersisted && isDraft ?
  'Saving draft…' :
  'Unsaved changes' :
  lastSavedAt ?
  `Saved ${relativeTime(lastSavedAt)}` :
  isPersisted ?
  'All changes saved' :
  'Not saved yet';

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-14 z-20 border-b border-line bg-white lg:top-0">
        <div className="mx-auto flex max-w-[2000px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to={isPersisted ? `/documents/${doc.id}` : '/documents'}
            aria-label="Back"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
            
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-ink">
              {isPersisted ? 'Edit' : 'New'} {template.label}
            </h1>
            <p className="truncate text-xs text-ink-muted">
              {divisionInfo(doc.division).name} · {doc.number || `${provisional} (reserved on save)`} ·{' '}
              <span className={dirty && !(isPersisted && isDraft) ? 'text-warning' : ''}>{saveState}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isDraft &&
            <Button variant="secondary" icon={SaveIcon} onClick={handleSaveDraft}>
                <span className="hidden sm:inline">Save draft</span>
                <span className="sm:hidden">Draft</span>
              </Button>
            }
            <Button icon={CheckIcon} onClick={handleSaveFinal}>
              {isPersisted && !isDraft ? 'Save changes' : 'Save & preview'}
            </Button>
          </div>
        </div>
        <div className="px-4 pb-3 sm:px-6 xl:hidden">
          <SegmentedTabs
            variant="pill"
            label="Editor view"
            value={mobileView}
            onChange={setMobileView}
            items={[
            { id: 'form', label: 'Edit details' },
            { id: 'preview', label: 'Live preview' }]
            } />
          
        </div>
      </div>

      <div className="mx-auto w-full max-w-[2000px] px-4 pt-5 sm:px-6 lg:px-8">
        {recovery &&
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-info/20 bg-info-soft px-4 py-3 sm:flex-row sm:items-center">
            <HistoryIcon className="h-4 w-4 shrink-0 text-info" aria-hidden />
            <p className="flex-1 text-sm text-ink-soft">
              Unsaved work from {formatTimestamp(recovery.savedAt)} was found for this {doc.type}.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={discardRecovery}>Discard</Button>
              <Button size="sm" onClick={restoreRecovery}>Restore</Button>
            </div>
          </div>
        }
        {errorList.length > 0 &&
        <div role="alert" className="mb-4 flex gap-3 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
            <div className="text-sm text-danger">
              <p className="font-medium">Fix these before saving:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {errorList.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          </div>
        }
      </div>

      <div className="mx-auto grid w-full max-w-[2000px] flex-1 gap-6 px-4 pb-10 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className={`${mobileView === 'form' ? 'block' : 'hidden'} min-w-0 space-y-5 xl:block`}>
          <DetailsSection doc={doc} update={update} errors={errors} provisionalNumber={provisional} />
          <ClientSection doc={doc} update={update} errors={errors} />
          <LineItemsEditor
            groups={doc.groups}
            onChange={(groups) => update({ groups })}
            currency={currency}
            error={errors.items}
            allowSections={doc.division === 'startup'} />
          
          <TotalsSection doc={doc} update={update} totals={totals} currency={currency} error={errors.adjustments} />
          {doc.type === 'invoice' && <PaymentsSection doc={doc} update={update} totals={totals} currency={currency} error={errors.payments} />}
          {doc.type === 'invoice' && <PaymentDetailsSection doc={doc} update={update} />}
          <NotesSection doc={doc} update={update} />
        </div>

        <aside className={`${mobileView === 'preview' ? 'block' : 'hidden'} min-w-0 xl:block`} aria-label="Live preview">
          <div className="xl:sticky xl:top-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Live preview</p>
              <p className="text-xs text-ink-muted">Template based on {template.reference}</p>
            </div>
            <div className="rounded-2xl bg-[#E6E8EC] p-3 sm:p-5 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
              <DocumentPreview doc={previewDoc} settings={settings} />
            </div>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        description="You have unsaved changes. A recovery copy stays in this browser, but it won't appear in your documents until you save."
        confirmLabel="Leave page"
        tone="danger"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()} />
      
    </div>);

}