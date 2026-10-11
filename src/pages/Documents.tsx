import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FilePlus2Icon, FileTextIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { DocumentTable } from '../components/documents/DocumentTable';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { SelectField } from '../components/ui/SelectField';
import { TextField } from '../components/ui/TextField';
import { divisions } from '../data/divisions';
import { documentTabs, statusFilterOptions } from '../data/documentTabs';
import { activeFilterCount, applyFilters, emptyFilters, matchesTab, type DocumentFilters, type DocumentTab } from '../utils/filters';
import { inputBase, inputBorder } from '../components/ui/fieldStyles';
import { getDocumentSummary } from '../utils/status';

export function Documents() {
  const { documents, clients } = useData();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab') as DocumentTab | null;
  const tab: DocumentTab = documentTabs.some((t) => t.id === tabParam) ? tabParam as DocumentTab : 'all';
  const [filters, setFilters] = useState<DocumentFilters>(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);
  const set = <K extends keyof DocumentFilters,>(key: K, value: DocumentFilters[K]) => setFilters((f) => ({ ...f, [key]: value }));

  const summaries = useMemo(() => documents.map(getDocumentSummary), [documents]);
  const tabItems = documentTabs.map((t) => ({ ...t, count: summaries.filter((s) => matchesTab(s, t.id)).length }));
  const visible = useMemo(
    () =>
    applyFilters(summaries.filter((s) => matchesTab(s, tab)), filters).
    sort((a, b) => b.doc.issueDate.localeCompare(a.doc.issueDate) || b.doc.updatedAt.localeCompare(a.doc.updatedAt)).
    map((s) => s.doc),
    [summaries, tab, filters]
  );
  const filterCount = activeFilterCount(filters);
  const anyFilter = filterCount > 0 || filters.query.trim() !== '';

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Documents"
        description="Every invoice and quotation. Issued documents are archived, never deleted."
        actions={<Button icon={FilePlus2Icon} onClick={() => navigate('/documents/new')}>New document</Button>} />
      

      <div className="rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-3 sm:px-4">
          <SegmentedTabs label="Document views" items={tabItems} value={tab} onChange={(id) => setParams(id === 'all' ? {} : { tab: id })} />
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <label htmlFor="doc-search" className="sr-only">Search documents</label>
            <input
              id="doc-search"
              type="search"
              placeholder="Search number, client, project or item description"
              value={filters.query}
              onChange={(e) => set('query', e.target.value)}
              className={`${inputBase} ${inputBorder(false)} h-10 pl-9`} />
            
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={SlidersHorizontalIcon} onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters}>
              Filters{filterCount > 0 && <span className="rounded-full bg-ink px-1.5 text-xs text-white">{filterCount}</span>}
            </Button>
            {anyFilter && <Button variant="ghost" onClick={() => setFilters(emptyFilters)}>Clear</Button>}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {showFilters &&
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden">
            
              <div className="grid grid-cols-2 gap-3 border-t border-line bg-canvas/50 p-4 md:grid-cols-3 xl:grid-cols-6">
                <SelectField label="Division" value={filters.division} onChange={(e) => set('division', e.target.value as DocumentFilters['division'])} options={[{ value: 'all', label: 'All divisions' }, ...divisions.map((d) => ({ value: d.id, label: d.shortName }))]} />
                <SelectField label="Type" value={filters.type} onChange={(e) => set('type', e.target.value as DocumentFilters['type'])} options={[{ value: 'all', label: 'All types' }, { value: 'invoice', label: 'Invoices' }, { value: 'quotation', label: 'Quotations' }]} />
                <SelectField label="Status" value={filters.status} onChange={(e) => set('status', e.target.value as DocumentFilters['status'])} options={statusFilterOptions} />
                <SelectField label="Client" value={filters.clientId} onChange={(e) => set('clientId', e.target.value)} options={[{ value: 'all', label: 'All clients' }, ...clients.map((c) => ({ value: c.id, label: c.name }))]} />
                <TextField label="From" type="date" value={filters.from} onChange={(e) => set('from', e.target.value)} />
                <TextField label="To" type="date" value={filters.to} onChange={(e) => set('to', e.target.value)} />
              </div>
            </motion.div>
          }
        </AnimatePresence>

        <div className="border-t border-line">
          <DocumentTable
            documents={visible}
            emptyState={
            <EmptyState
              icon={FileTextIcon}
              title={anyFilter ? 'No matching documents' : tab === 'archived' ? 'Nothing archived' : 'No documents here yet'}
              description={anyFilter ? 'Try a different search or clear the filters.' : 'Documents appear here once they are saved.'}
              action={anyFilter ? <Button variant="secondary" onClick={() => setFilters(emptyFilters)}>Clear filters</Button> : undefined} />

            } />
          
        </div>
      </div>
    </div>);

}