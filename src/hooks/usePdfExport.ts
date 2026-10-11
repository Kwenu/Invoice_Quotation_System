import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { exportElementToPdf } from '../utils/pdf';

export function usePdfExport() {
  const exportRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const download = useCallback(async (fileName: string) => {
    if (!exportRef.current) return;
    setBusy(true);
    try {
      await exportElementToPdf(exportRef.current, fileName);
      toast.success(`${fileName}.pdf downloaded`);
    } catch (error) {
      console.error(error);
      toast.error('PDF generation failed. Your document is unchanged — please try again.');
    } finally {
      setBusy(false);
    }
  }, []);

  const print = useCallback(() => window.print(), []);

  return { exportRef, busy, download, print };
}