import type { DivisionInfo, TemplateAssignment } from '../types/document';

export const divisions: DivisionInfo[] = [
{
  id: 'startup',
  name: 'Lingo Startup Company',
  shortName: 'Startup',
  summary: 'Software projects, web & mobile apps, hosting, domains, maintenance and UI/UX design.'
},
{
  id: 'assignment-helpers',
  name: 'Lingo Assignment Helpers',
  shortName: 'Assignment Helpers',
  summary: 'Assignment-based billing with multiple items, quantities and custom charges.'
}];


export const templateAssignments: TemplateAssignment[] = [
{ division: 'startup', type: 'invoice', templateId: 'startup-invoice', label: 'Startup Invoice'},
{ division: 'assignment-helpers', type: 'invoice', templateId: 'assignment-invoice', label: 'Assignment Helpers Invoice'},
{ division: 'startup', type: 'quotation', templateId: 'startup-quotation', label: 'Startup Quotation'}];