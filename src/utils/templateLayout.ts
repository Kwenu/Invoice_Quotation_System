/** Column grids measured from the reference PDFs (content width 618px on a 794px A4 page). */
export const TEMPLATE_GRID = {
  qty: '1fr 60px 130px 105px',
  price: '1fr 128px',
  priceBundled: '1fr 44px 128px'
} as const;

export const DOC_COLORS = {
  ink: '#1F2020',
  navy: '#23284A',
  grey: '#5A5352',
  muted: '#6E6E6E'
} as const;
/** Lingo Startup keeps the brand gradient; Lingo Tech Academy and Auron Wear print in black. */
export const docBarBackground = (division?: string): string =>
division === 'academy' || division === 'auron' ? '#111111' : 'linear-gradient(90deg, #0546A9 0%, #5B5BCB 52%, #C76BE6 100%)';

/** Accent text colour (client name, totals) — navy for Startup, black for the others. */
export const docAccent = (division?: string): string =>
division === 'academy' || division === 'auron' ? '#111111' : DOC_COLORS.navy;
