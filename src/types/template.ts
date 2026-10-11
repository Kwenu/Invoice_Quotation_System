import type { LingoDocument } from './document';
import type { AppSettings } from './settings';

export interface TemplateProps {
  doc: LingoDocument;
  settings: AppSettings;
}