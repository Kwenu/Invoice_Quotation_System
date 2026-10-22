import type { DivisionInfo, TemplateAssignment } from '../types/document';

/** The three trading companies under Lingo Groups. Every one of them issues invoices AND quotations. */
export const divisions: DivisionInfo[] = [
{
  id: 'startup',
  name: 'Lingo Startup Company',
  shortName: 'Startup',
  summary: 'Software projects, web & mobile apps, hosting, domains, maintenance, UI/UX design and assignment support.'
},
{
  id: 'academy',
  name: 'Lingo Tech Academy',
  shortName: 'Tech Academy',
  summary: 'Online tech courses — machine learning, mobile development, Java, Python and more.'
},
{
  id: 'auron',
  name: 'Auron Wear',
  shortName: 'Auron Wear',
  summary: 'Online store for printed t-shirts.'
}];


export const templateAssignments: TemplateAssignment[] = [
{ division: 'startup', type: 'invoice', templateId: 'startup-invoice', label: 'Startup Invoice'},
{ division: 'startup', type: 'quotation', templateId: 'startup-quotation', label: 'Startup Quotation'},
{ division: 'academy', type: 'invoice', templateId: 'academy-invoice', label: 'Tech Academy Invoice'},
{ division: 'academy', type: 'quotation', templateId: 'academy-quotation', label: 'Tech Academy Quotation'},
{ division: 'auron', type: 'invoice', templateId: 'auron-invoice', label: 'Auron Wear Invoice'},
{ division: 'auron', type: 'quotation', templateId: 'auron-quotation', label: 'Auron Wear Quotation'}];
