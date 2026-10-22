import type { DivisionId } from '../types/document';

/** Lingo Startup Company artwork (cropped in LingoLogo.tsx). */
export const LOGO_URL = "/Logo_3.png";

export interface LogoAsset {
  src: string;
  /** Natural pixel size of the file — used to keep the aspect ratio. */
  w: number;
  h: number;
}

/**
 * Head company logo (Lingo Groups). Shown in the app itself: sidebar, login page, settings.
 * `full` = logo with the company name; `mark` = just the LG monogram (used where space is tight).
 */
export const GROUP_LOGO: {full: LogoAsset;mark: LogoAsset;} = {
  full: { src: '/logos/lingo-groups.png', w: 375, h: 350 },
  mark: { src: '/logos/lingo-groups-mark.png', w: 299, h: 262 }
};

/**
 * Logos printed at the top of invoices and quotations.
 * - `startup` keeps its original artwork (see LingoLogo.tsx).
 * - To change a company logo later, replace the file in /public/logos and update w/h here.
 * - `mark` is the optional icon shown at the top-right of a quotation (above the tagline).
 * - `invoiceWidth` / `quotationWidth` are the printed widths in px on the A4 page.
 */
export const DIVISION_LOGOS: Record<Exclude<DivisionId, 'startup'>, {
  full: LogoAsset;
  mark?: LogoAsset;
  invoiceWidth: number;
  quotationWidth: number;
}> = {
  academy: {
    full: { src: '/logos/lingo-tech-academy.png', w: 350, h: 144 },
    invoiceWidth: 214,
    quotationWidth: 200
  },
  auron: {
    full: { src: '/logos/auron-wear.png', w: 411, h: 89 },
    mark: { src: '/logos/auron-wear-mark.png', w: 127, h: 89 },
    invoiceWidth: 250,
    quotationWidth: 236
  }
};
