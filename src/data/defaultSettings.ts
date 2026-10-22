import type { AppSettings } from '../types/settings';

/**
 * Initial configuration taken from the reference documents (INV0113, QUT0031) for Lingo Startup Company,
 * extended with Lingo Tech Academy and Auron Wear (same layout, own logo and numbering).
 * This is the ONLY place business & payment details live — everything else reads from settings.
 */
export const defaultSettings: AppSettings = {
  companyName: 'Lingo Groups (Pvt) Ltd',
  currencySymbol: 'Rs.',
  currencyCode: 'LKR',
  divisions: {
    startup: {
      id: 'startup',
      name: 'Lingo Startup Company',
      brandLine: 'LINGO-STARTUP COMPANY',
      tagline: 'You Dream it, We build it',
      companyLine: '- Lingo Groups (Pvt) Ltd -',
      paymentDetails: {
        method: '',
        accountHolder: 'G.H.G.K. Wenuraka',
        bankName: 'BOC',
        accountNumber: '88884803',
        branch: 'Galle Bazaar Branch',
        reference: ''
      },
      representative: { name: 'Kisara Wenuraka', designation: 'Founder/ CEO' },
      signatureDataUrl: ''
    },
    academy: {
      id: 'academy',
      name: 'Lingo Tech Academy',
      brandLine: 'LINGO TECH ACADEMY',
      tagline: '',
      companyLine: '- Lingo Groups (Pvt) Ltd -',
      paymentDetails: {
        method: '',
        accountHolder: 'G.H.G.K. Wenuraka',
        bankName: 'BOC',
        accountNumber: '88884803',
        branch: 'Galle Bazaar Branch',
        reference: ''
      },
      representative: { name: 'Kisara Wenuraka', designation: 'Founder/ CEO' },
      signatureDataUrl: ''
    },
    auron: {
      id: 'auron',
      name: 'Auron Wear',
      brandLine: 'AURON WEAR',
      tagline: '',
      companyLine: '- Lingo Groups (Pvt) Ltd -',
      paymentDetails: {
        method: '',
        accountHolder: 'G.H.G.K. Wenuraka',
        bankName: 'BOC',
        accountNumber: '88884803',
        branch: 'Galle Bazaar Branch',
        reference: ''
      },
      representative: { name: 'Kisara Wenuraka', designation: 'Founder/ CEO' },
      signatureDataUrl: ''
    }
  },
  templates: {
    'startup-invoice': {
      notes: 'All the Modifications will undertaken by our company',
      terms:
      'Please send payment within 30 days of receiving this invoice. There will be 10% interest charge per month on late invoice.',
      paymentInstructions: '',
      dueDays: 30,
      validDays: 0
    },
    'startup-quotation': {
      notes: 'All the Modifications will undertaken by our company for a reasonable cost.',
      terms: 'The Prices will Change respecting to the Current USD Rate.',
      paymentInstructions: '',
      dueDays: 0,
      validDays: 30
    },
    'academy-invoice': {
      notes: 'Thank you for choosing Lingo Tech Academy.',
      terms: 'Please send payment within 14 days of receiving this invoice.',
      paymentInstructions: '',
      dueDays: 14,
      validDays: 0
    },
    'academy-quotation': {
      notes: 'Prices are quoted for the courses listed above.',
      terms: 'This quotation is valid for 30 days from the date of issue.',
      paymentInstructions: '',
      dueDays: 0,
      validDays: 30
    },
    'auron-invoice': {
      notes: 'Thank you for choosing Auron Wear.',
      terms: 'Please send payment within 7 days of receiving this invoice.',
      paymentInstructions: '',
      dueDays: 7,
      validDays: 0
    },
    'auron-quotation': {
      notes: 'Prices are quoted for the printed items listed above.',
      terms: 'This quotation is valid for 30 days from the date of issue.',
      paymentInstructions: '',
      dueDays: 0,
      validDays: 30
    }
  },
  numbering: {
    'startup-invoice': { prefix: 'INV', separator: '-', yearFormat: 'YYYY', padding: 4, nextNumber: 114 },
    'startup-quotation': { prefix: 'QUT', separator: '-', yearFormat: 'YYYY', padding: 4, nextNumber: 32 },
    'academy-invoice': { prefix: 'INV-LTA', separator: '-', yearFormat: 'YYYY', padding: 4, nextNumber: 1 },
    'academy-quotation': { prefix: 'QUT-LTA', separator: '-', yearFormat: 'YYYY', padding: 4, nextNumber: 1 },
    'auron-invoice': { prefix: 'INV-AW', separator: '-', yearFormat: 'YYYY', padding: 4, nextNumber: 1 },
    'auron-quotation': { prefix: 'QUT-AW', separator: '-', yearFormat: 'YYYY', padding: 4, nextNumber: 1 }
  }
};
