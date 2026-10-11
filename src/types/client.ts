export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientInput {
  id?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}