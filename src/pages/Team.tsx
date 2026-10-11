import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCogIcon, UserPlusIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { MemberFormModal } from '../components/team/MemberFormModal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { TonePill } from '../components/ui/TonePill';
import type { MemberStatus } from '../types/team';
import { formatDisplayDate, formatMoney, initials } from '../utils/format';
import { companyIncomeTotal } from '../utils/income';
import { memberStats } from '../utils/team';

type Tab = 'all' | MemberStatus;
const statusLabel: Record<MemberStatus, string> = { active: 'Active', planned: 'Planned hire', former: 'Former' };
const statusTone = { active: 'success', planned: 'info', former: 'neutral' } as const;

export function Team() {
  const { team, assignments, payouts, documents, retainers, settings } = useData();
  const navigate = useNavigate();
  const currency = settings.currencySymbol;
  const [tab, setTab] = useState<Tab>('all');
  const [modal, setModal] = useState(false);

  const companyIncome = useMemo(() => companyIncomeTotal({ documents, retainers }), [documents, retainers]);

  const rows = useMemo(
    () => team.map((m) => ({ member: m, stats: memberStats(m.id, assignments, payouts, documents) })),
    [team, assignments, payouts, documents]
  );
  const visible = rows.filter((r) => tab === 'all' || r.member.status === tab);

  const totals = rows.reduce(
    (t, r) => ({ assigned: t.assigned + r.stats.assigned, paid: t.paid + r.stats.paidOut, balance: t.balance + r.stats.balance, now: t.now + Math.max(0, r.stats.payableNow) }),
    { assigned: 0, paid: 0, balance: 0, now: 0 }
  );
  const count = (s: MemberStatus) => team.filter((m) => m.status === s).length;

  const cards = [
  { label: 'Active members', value: String(count('active')), sub: `${count('planned')} planned hire${count('planned') === 1 ? '' : 's'}` },
  { label: 'Total assigned to team', value: formatMoney(totals.assigned, currency), sub: companyIncome > 0 ? `${(totals.assigned / companyIncome * 100).toFixed(1)}% of company income` : 'No company income yet' },
  { label: 'Paid out so far', value: formatMoney(totals.paid, currency), sub: `${formatMoney(totals.balance, currency)} still owed in total` },
  { label: 'Payable now', value: formatMoney(totals.now, currency), sub: 'Based on client payments received' }];


  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Team"
        description="Track hired and upcoming team members, their portions of each project and what you have paid them."
        actions={<Button icon={UserPlusIcon} onClick={() => setModal(true)}>Add member</Button>} />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) =>
        <div key={c.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-medium text-ink-muted">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{c.value}</p>
            <p className="mt-1 text-xs text-ink-muted">{c.sub}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-4">
          <SegmentedTabs
            label="Member status"
            value={tab}
            onChange={setTab}
            items={[
            { id: 'all', label: 'All', count: team.length },
            { id: 'active', label: 'Active', count: count('active') },
            { id: 'planned', label: 'Planned', count: count('planned') },
            { id: 'former', label: 'Former', count: count('former') }]
            } />
          
        </div>
        {visible.length === 0 ?
        <EmptyState
          icon={UserCogIcon}
          title={team.length === 0 ? 'No team members yet' : 'Nobody in this group'}
          description="Add the people you have hired, or plan to hire, then give them a portion of each project."
          action={team.length === 0 && <Button icon={UserPlusIcon} onClick={() => setModal(true)}>Add member</Button>} /> :


        <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-muted">
                  <th scope="col" className="py-3 pl-5 pr-3 font-medium">Member</th>
                  <th scope="col" className="px-3 py-3 font-medium">Status</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Projects</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Total income</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Share of company</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Paid out</th>
                  <th scope="col" className="py-3 pl-3 pr-5 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map(({ member, stats }) =>
              <tr key={member.id} onClick={() => navigate(`/team/${member.id}`)} className="cursor-pointer transition-colors duration-150 hover:bg-canvas/70">
                    <td className="py-3 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-xs font-semibold text-ink-soft">{initials(member.name)}</span>
                        <div className="min-w-0">
                          <Link to={`/team/${member.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-ink hover:underline">{member.name}</Link>
                          <p className="truncate text-xs text-ink-muted">{member.role || '—'}{member.startDate ? ` · ${member.status === 'planned' ? 'starts' : 'since'} ${formatDisplayDate(member.startDate)}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3"><TonePill tone={statusTone[member.status]}>{statusLabel[member.status]}</TonePill></td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink-soft">{stats.projects}</td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums text-ink">{formatMoney(stats.assigned, currency)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink-soft">{companyIncome > 0 ? `${(stats.assigned / companyIncome * 100).toFixed(1)}%` : '—'}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink-soft">{formatMoney(stats.paidOut, currency)}</td>
                    <td className={`py-3 pl-3 pr-5 text-right tabular-nums ${stats.balance > 0 ? 'font-medium text-ink' : 'text-ink-muted'}`}>{formatMoney(stats.balance, currency)}</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </div>
      <p className="text-xs text-ink-muted">Company income = invoices billed (excluding drafts and cancelled) plus maintenance charges collected.</p>

      <MemberFormModal open={modal} onClose={() => setModal(false)} onSaved={(m) => navigate(`/team/${m.id}`)} />
    </div>);

}
