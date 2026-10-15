const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

function waitForImages(root: HTMLElement): Promise<unknown> {
  const images = Array.from(root.querySelectorAll('img'));
  return Promise.all(
    images.map((img) =>
    img.complete ?
    Promise.resolve() :
    new Promise((resolve) => {
      img.onload = () => resolve(undefined);
      img.onerror = () => resolve(undefined);
    })
    )
  );
}

/** Renders a full-size (794px wide) document element to an A4 PDF, splitting onto extra pages if it grows. */
export async function exportElementToPdf(element: HTMLElement, fileName: string): Promise<void> {
  const [html2canvasModule, jspdfModule] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const html2canvas = html2canvasModule.default;
  const { jsPDF } = jspdfModule;

  if (document.fonts?.ready) await document.fonts.ready;
  await waitForImages(element);

  // html2canvas measures font baselines with a hidden 1x1 <img>. Tailwind's preflight makes every <img>
  // `display:block`, which breaks that measurement and pushes ALL text ~0.4em too low in the PDF
  // (logo vs "INVOICE", table headings, "Total Due" box). Keep that probe image inline while capturing.
  const fixStyle = document.createElement('style');
  fixStyle.setAttribute('data-pdf-metrics-fix', '');
  fixStyle.textContent = 'img[width="1"], img[height="1"] { display: inline !important; vertical-align: baseline !important; }';
  document.head.appendChild(fixStyle);

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.offsetWidth || 794,
    height: element.scrollHeight,
    windowWidth: Math.max(element.offsetWidth || 794, 794),
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0
    });
  } finally {
    fixStyle.remove();
  }

  if (!canvas.width || !canvas.height) throw new Error('Document rendered with zero size');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pxPerMm = canvas.width / A4_WIDTH_MM;
  const pageHeightPx = Math.round(A4_HEIGHT_MM * pxPerMm);

  if (canvas.height <= pageHeightPx + 24) {
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, A4_WIDTH_MM, canvas.height / pxPerMm);
  } else {
    let offset = 0;
    let first = true;
    while (offset < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - offset);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const ctx = slice.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, offset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      if (!first) pdf.addPage();
      pdf.addImage(slice.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, A4_WIDTH_MM, sliceHeight / pxPerMm);
      offset += sliceHeight;
      first = false;
    }
  }

  pdf.save(fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}