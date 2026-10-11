import React, { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeftIcon, BanknoteIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { AssignmentModal } from '../components/team/AssignmentModal';
import { MemberFormModal } from '../components/team/MemberFormModal';
import { PayoutModal } from '../components/team/PayoutModal';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { TonePill } from '../components/ui/TonePill';
import type { TeamAssignment } from '../types/team';
import { formatDisplayDate, formatMoney, initials } from '../utils/format';
import { companyIncomeTotal } from '../utils/income';
import { assignmentAmount, assignmentReleasable, memberStats } from '../utils/team';

const statusLabel = { active: 'Active', planned: 'Planned hire', former: 'Former' } as const;
const statusTone = { active: 'success', planned: 'info', former: 'neutral' } as const;

export function TeamMemberDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { team, assignments, payouts, documents, retainers, settings, removeAssignment, removePayout, deleteMember } = useData();
  const currency = settings.currencySymbol;
  const member = team.find((m) => m.id === id);

  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editing, setEditing] = useState<TeamAssignment | null>(null);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const mine = useMemo(() => assignments.filter((a) => a.memberId === id), [assignments, id]);
  const myPayouts = useMemo(() => payouts.filter((p) => p.memberId === id).sort((a, b) => b.date.localeCompare(a.date)), [payouts, id]);
  const stats = useMemo(() => memberStats(id, assignments, payouts, documents), [id, assignments, payouts, documents]);
  const companyIncome = useMemo(() => companyIncomeTotal({ documents, retainers }), [documents, retainers]);

  if (!member) return <Navigate to="/team" replace />;

  const cards = [
  { label: 'Total income from company', value: formatMoney(stats.assigned, currency), sub: companyIncome > 0 ? `${(stats.assigned / companyIncome * 100).toFixed(1)}% of company income` : 'No company income yet' },
  { label: 'Paid out', value: formatMoney(stats.paidOut, currency), sub: `${myPayouts.length} payout${myPayouts.length === 1 ? '' : 's'}` },
  { label: 'Balance owed', value: formatMoney(stats.balance, currency), sub: 'Agreed amount minus payouts' },
  { label: 'Payable now', value: formatMoney(Math.max(0, stats.payableNow), currency), sub: 'Based on client payments received' }];


  const openAdd = () => {setEditing(null);setAssignOpen(true);};
  const openEdit = (a: TeamAssignment) => {setEditing(a);setAssignOpen(true);};

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link to="/team" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden /> Team
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-tint text-lg font-semibold text-brand-violet">{initials(member.name)}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">{member.name}</h1>
              <TonePill tone={statusTone[member.status]}>{statusLabel[member.status]}</TonePill>
            </div>
            <p className="mt-0.5 text-sm text-ink-muted">
              {[member.role, member.email, member.phone].filter(Boolean).join(' · ') || 'No contact details yet'}
              {member.startDate ? ` · ${member.status === 'planned' ? 'Starts' : 'Joined'} ${formatDisplayDate(member.startDate)}` : ''}
            </p>
            {member.notes && <p className="mt-1 max-w-xl text-sm text-ink-soft">{member.notes}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={PencilIcon} onClick={() => setEditOpen(true)}>Edit</Button>
          <Button variant="danger" icon={Trash2Icon} onClick={() => setConfirmDelete(true)}>Remove</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) =>
        <div key={c.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-medium text-ink-muted">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{c.value}</p>
            <p className="mt-1 text-xs text-ink-muted">{c.sub}</p>
          </div>
        )}
      </div>

      <section className="rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Project portions</h2>
            <p className="text-xs text-ink-muted">What {member.name.split(' ')[0]} earns from each project.</p>
          </div>
          <Button size="sm" icon={PlusIcon} onClick={openAdd}>Add portion</Button>
        </div>
        {mine.length === 0 ?
        <div className="border-t border-line"><EmptyState icon={BanknoteIcon} title="No portions yet" description="Link an invoice or add an upcoming project and set a percentage or a fixed amount." /></div> :
        <div className="overflow-x-auto border-t border-line">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-muted">
                  <th scope="col" className="py-3 pl-5 pr-3 font-medium">Project</th>
                  <th scope="col" className="px-3 py-3 font-medium">Portion</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Earns</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Releasable now</th>
                  <th scope="col" className="py-3 pl-3 pr-5 text-right font-medium"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {mine.map((a) => {
                const doc = a.documentId ? documents.find((d) => d.id === a.documentId) : undefined;
                return (
                  <tr key={a.id}>
                      <td className="py-3 pl-5 pr-3">
                        <p className="font-medium text-ink">{a.label}</p>
                        <p className="text-xs text-ink-muted">
                          {doc ? <Link to={`/documents/${doc.id}`} className="hover:underline">{doc.number}</Link> : a.documentId ? 'Invoice no longer exists' : 'Manual project'}
                          {a.note ? ` · ${a.note}` : ''}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-ink-soft">{a.mode === 'percent' ? `${a.value}%` : 'Fixed'}</td>
                      <td className="px-3 py-3 text-right font-medium tabular-nums text-ink">{formatMoney(assignmentAmount(a, documents), currency)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink-soft">{formatMoney(assignmentReleasable(a, documents), currency)}</td>
                      <td className="py-3 pl-3 pr-5">
                        <div className="flex justify-end gap-0.5">
                          <IconButton icon={PencilIcon} label="Edit portion" onClick={() => openEdit(a)} />
                          <IconButton icon={Trash2Icon} label="Remove portion" tone="danger" onClick={() => {removeAssignment(a.id);toast.success('Portion removed');}} />
                        </div>
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </section>

      <section className="rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Payouts</h2>
            <p className="text-xs text-ink-muted">Money paid to {member.name.split(' ')[0]}.</p>
          </div>
          <Button size="sm" icon={BanknoteIcon} onClick={() => setPayoutOpen(true)}>Record payout</Button>
        </div>
        {myPayouts.length === 0 ?
        <div className="border-t border-line"><EmptyState icon={BanknoteIcon} title="No payouts yet" description="Record each payment you make so the balance stays accurate." /></div> :
        <ul className="divide-y divide-line border-t border-line">
            {myPayouts.map((p) =>
          <li key={p.id} className="flex items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium tabular-nums text-ink">{formatMoney(p.amount, currency)}</p>
                  <p className="truncate text-xs text-ink-muted">{formatDisplayDate(p.date)}{p.method ? ` · ${p.method}` : ''}{p.note ? ` · ${p.note}` : ''}</p>
                </div>
                <IconButton icon={Trash2Icon} label="Remove payout" tone="danger" onClick={() => {removePayout(p.id);toast.success('Payout removed');}} />
              </li>
          )}
          </ul>
        }
      </section>

      <MemberFormModal open={editOpen} member={member} onClose={() => setEditOpen(false)} />
      <AssignmentModal open={assignOpen} memberId={member.id} assignment={editing} onClose={() => setAssignOpen(false)} />
      <PayoutModal open={payoutOpen} memberId={member.id} suggested={stats.payableNow} onClose={() => setPayoutOpen(false)} />
      <ConfirmDialog
        open={confirmDelete}
        title={`Remove ${member.name}?`}
        description="Their project portions and payout history will be deleted too. If they simply left, mark them as a former member instead."
        confirmLabel="Remove member"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={() => {deleteMember(member.id);toast.success('Team member removed');navigate('/team');}}
        onCancel={() => setConfirmDelete(false)} />
      
    </div>);

}
