export type RetainerFrequency = 'monthly' | 'quarterly' | 'yearly';
export type RetainerStatus = 'active' | 'paused' | 'ended';

export interface RetainerCollection {
  id: string;
  /** The due date this collection settled. */
  dueDate: string;
  amount: number;
  receivedDate: string;
  method: string;
  note: string;
  recordedAt: string;
}

export interface Retainer {
  id: string;
  clientId: string | null;
  clientName: string;
  title: string;
  category: string;
  amount: number;
  frequency: RetainerFrequency;
  startDate: string;
  nextDueDate: string;
  remindDaysBefore: number;
  status: RetainerStatus;
  notes: string;
  collections: RetainerCollection[];
  createdAt: string;
  updatedAt: string;
}

export type RetainerInput = Omit<Retainer, 'id' | 'collections' | 'createdAt' | 'updatedAt'> & {id?: string;};
