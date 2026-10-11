import type { AppSettings } from '../types/settings';

/**
 * Initial configuration taken from the reference documents (INV0112, INV0113, QUT0031).
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
    'assignment-helpers': {
      id: 'assignment-helpers',
      name: 'Lingo Assignment Helpers',
      brandLine: 'LINGO ASSIGNMENT HELPERS',
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
    'assignment-invoice': {
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
    }
  },
  numbering: {
    'startup-invoice': { prefix: 'INV', separator: '-', yearFormat: 'YYYY', padding: 4, nextNumber: 114 },
    'assignment-invoice': { prefix: 'INV-AH', separator: '-', yearFormat: 'YYYY', padding: 4, nextNumber: 113 },
    'startup-quotation': { prefix: 'QUT', separator: '-', yearFormat: 'YYYY', padding: 4, nextNumber: 32 }
  }
};