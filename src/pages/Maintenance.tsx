import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BanknoteIcon, HistoryIcon, PauseIcon, PencilIcon, PlayIcon, PlusIcon, RepeatIcon, Trash2Icon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { CollectModal } from '../components/maintenance/CollectModal';
import { HistoryModal } from '../components/maintenance/HistoryModal';
import { RetainerFormModal } from '../components/maintenance/RetainerFormModal';
import { ActionMenu } from '../components/ui/ActionMenu';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { TonePill } from '../components/ui/TonePill';
import type { Retainer } from '../types/retainer';
import { formatDisplayDate, formatMoney } from '../utils/format';
import { monthRange } from '../utils/income';
import { dueLabel, dueState, frequencyLabel, monthlyValue, occurrencesInRange, type DueState } from '../utils/retainers';

type Tab = 'active' | 'paused' | 'ended';
const stateTone: Record<DueState, 'danger' | 'warning' | 'neutral' | 'success'> = { overdue: 'danger', 'due-soon': 'warning', upcoming: 'success', paused: 'neutral', ended: 'neutral' };

export function Maintenance() {
  const { retainers, settings, setRetainerStatus, deleteRetainer } = useData();
  const currency = settings.currencySymbol;
  const [tab, setTab] = useState<Tab>('active');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Retainer | null>(null);
  const [collecting, setCollecting] = useState<Retainer | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Retainer | null>(null);

  const stats = useMemo(() => {
    const active = retainers.filter((r) => r.status === 'active');
    const now = new Date();
    const month = monthRange(now.getFullYear(), now.getMonth());
    const collectedThisMonth = retainers.reduce(
      (s, r) => s + r.collections.filter((c) => c.receivedDate >= month.from! && c.receivedDate <= month.to!).reduce((x, c) => x + c.amount, 0),
      0
    );
    return {
      mrr: active.reduce((s, r) => s + monthlyValue(r), 0),
      overdue: active.filter((r) => dueState(r) === 'overdue').reduce((s, r) => s + r.amount, 0),
      dueThisMonth: active.reduce((s, r) => s + occurrencesInRange(r, month.from, month.to).length * r.amount, 0),
      collectedThisMonth,
      activeCount: active.length
    };
  }, [retainers]);

  const visible = retainers.
  filter((r) => r.status === tab).
  sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));
  const count = (s: Tab) => retainers.filter((r) => r.status === s).length;

  const cards = [
  { label: 'Monthly recurring revenue', value: formatMoney(stats.mrr, currency), sub: `${stats.activeCount} active plan${stats.activeCount === 1 ? '' : 's'}` },
  { label: 'Due this month', value: formatMoney(stats.dueThisMonth, currency), sub: 'Still to be collected' },
  { label: 'Overdue', value: formatMoney(stats.overdue, currency), sub: stats.overdue > 0 ? 'Needs follow-up' : 'Nothing overdue', danger: stats.overdue > 0 },
  { label: 'Collected this month', value: formatMoney(stats.collectedThisMonth, currency), sub: 'Maintenance income' }];


  const openNew = () => {setEditing(null);setFormOpen(true);};

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Maintenance"
        description="Recurring charges for long-term clients — websites, POS and CRM systems. Next due dates drive your reminders."
        actions={<Button icon={PlusIcon} onClick={openNew}>New plan</Button>} />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) =>
        <div key={c.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-medium text-ink-muted">{c.label}</p>
            <p className={`mt-2 text-2xl font-semibold tabular-nums ${c.danger ? 'text-danger' : 'text-ink'}`}>{c.value}</p>
            <p className="mt-1 text-xs text-ink-muted">{c.sub}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-4">
          <SegmentedTabs
            label="Plan status"
            value={tab}
            onChange={setTab}
            items={[
            { id: 'active', label: 'Active', count: count('active') },
            { id: 'paused', label: 'Paused', count: count('paused') },
            { id: 'ended', label: 'Ended', count: count('ended') }]
            } />
          
        </div>
        {visible.length === 0 ?
        <EmptyState
          icon={RepeatIcon}
          title={retainers.length === 0 ? 'No maintenance plans yet' : `No ${tab} plans`}
          description="Add a plan for each client you charge monthly, and you will see when the next payment is due."
          action={retainers.length === 0 && <Button icon={PlusIcon} onClick={openNew}>New plan</Button>} /> :


        <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-muted">
                  <th scope="col" className="py-3 pl-5 pr-3 font-medium">Client &amp; plan</th>
                  <th scope="col" className="px-3 py-3 font-medium">Cycle</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Charge</th>
                  <th scope="col" className="px-3 py-3 font-medium">Next due</th>
                  <th scope="col" className="px-3 py-3 font-medium">Status</th>
                  <th scope="col" className="py-3 pl-3 pr-5 text-right font-medium"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((r) => {
                const state = dueState(r);
                return (
                  <tr key={r.id}>
                      <td className="py-3 pl-5 pr-3">
                        <p className="font-medium text-ink">{r.clientName}</p>
                        <p className="text-xs text-ink-muted">{r.title} · {r.category}</p>
                      </td>
                      <td className="px-3 py-3 text-ink-soft">{frequencyLabel[r.frequency]}</td>
                      <td className="px-3 py-3 text-right font-medium tabular-nums text-ink">{formatMoney(r.amount, currency)}</td>
                      <td className="px-3 py-3 text-ink-soft">{formatDisplayDate(r.nextDueDate)}</td>
                      <td className="px-3 py-3">
                        {r.status === 'active' ?
                      <TonePill tone={stateTone[state]}>{dueLabel(r)}</TonePill> :
                      <TonePill tone="neutral">{r.status === 'paused' ? 'Paused' : 'Ended'}</TonePill>}
                      </td>
                      <td className="py-3 pl-3 pr-5">
                        <div className="flex items-center justify-end gap-1">
                          {r.status === 'active' &&
                        <Button size="sm" variant={state === 'overdue' || state === 'due-soon' ? 'primary' : 'secondary'} icon={BanknoteIcon} onClick={() => setCollecting(r)}>Collect</Button>
                        }
                          <ActionMenu
                          label={`Actions for ${r.clientName}`}
                          items={[
                          { label: 'Collection history', icon: HistoryIcon, onSelect: () => setHistoryId(r.id) },
                          { label: 'Edit plan', icon: PencilIcon, onSelect: () => {setEditing(r);setFormOpen(true);} },
                          r.status === 'active' ?
                          { label: 'Pause plan', icon: PauseIcon, onSelect: () => setRetainerStatus(r.id, 'paused') } :
                          { label: 'Resume plan', icon: PlayIcon, onSelect: () => setRetainerStatus(r.id, 'active') },
                          { label: 'Delete plan', icon: Trash2Icon, tone: 'danger', onSelect: () => setDeleting(r) }]
                          } />
                        
                        </div>
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </div>

      <RetainerFormModal open={formOpen} retainer={editing} onClose={() => setFormOpen(false)} />
      <CollectModal retainer={collecting} onClose={() => setCollecting(null)} />
      <HistoryModal retainerId={historyId} onClose={() => setHistoryId(null)} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this maintenance plan?"
        description="Its collection history is deleted with it, and past income will no longer appear on the dashboard. To stop billing but keep the history, pause or end the plan instead."
        confirmLabel="Delete plan"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={() => {if (deleting) {deleteRetainer(deleting.id);toast.success('Plan deleted');}setDeleting(null);}}
        onCancel={() => setDeleting(null)} />
      
    </div>);

}
