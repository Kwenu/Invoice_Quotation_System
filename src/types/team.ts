export type MemberStatus = 'active' | 'planned' | 'former';
export type ShareMode = 'percent' | 'fixed';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: MemberStatus;
  /** Join date for active/former members, expected start date for planned hires. */
  startDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberInput {
  id?: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: MemberStatus;
  startDate: string;
  notes: string;
}

/** The portion a member earns from one project (an invoice) or from a manually entered project. */
export interface TeamAssignment {
  id: string;
  memberId: string;
  /** Linked invoice, or null for a manual / upcoming project. */
  documentId: string | null;
  label: string;
  /** Project value used for percentage shares on manual projects. */
  baseAmount: number;
  mode: ShareMode;
  value: number;
  note: string;
  createdAt: string;
}

export type AssignmentInput = Omit<TeamAssignment, 'id' | 'createdAt'> & {id?: string;};

export interface TeamPayout {
  id: string;
  memberId: string;
  date: string;
  amount: number;
  method: string;
  note: string;
  recordedAt: string;
}
