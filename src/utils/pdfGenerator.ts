/**
 * Client-side genuine PDF generator
 * Generates a valid PDF 1.4 binary Blob without external heavy dependencies.
 */

export function generateLessonPdfBlob(
  lessonTitle: string,
  subjectName: string,
  creatorName: string,
  content: string,
  slides?: Array<{ title: string; bullets: string[]; notes?: string }>
): Blob {
  // Sanitize text for standard ASCII PDF stream
  const clean = (str: string) => str.replace(/[()\\]/g, '\\$&').replace(/[\r\n]+/g, ' ');

  const title = clean(lessonTitle || 'IT Learning Lesson');
  const subject = clean(subjectName || 'IT Subject');
  const instructor = clean(creatorName || 'Instructor');

  // Split content into readable lines
  const rawLines = (content || 'Comprehensive course materials, exercises, and technical reference.')
    .replace(/[#*`_]/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const lines: string[] = [];
  rawLines.forEach(l => {
    // Break long lines into 70 char chunks
    for (let i = 0; i < l.length; i += 70) {
      lines.push(clean(l.slice(i, i + 70)));
    }
  });

  // Collect slide points
  const slidePoints: string[] = [];
  if (slides && slides.length > 0) {
    slides.forEach((s, idx) => {
      slidePoints.push(`Slide ${idx + 1}: ${clean(s.title)}`);
      s.bullets.forEach(b => slidePoints.push(`  - ${clean(b)}`));
    });
  }

  // Construct standard PDF 1.4 objects
  const pages: string[] = [];

  // Page 1: Overview & Content
  let stream1 = `BT
/F1 20 Tf
50 750 Td
(${title}) Tj
/F1 12 Tf
0 -24 Td
(${subject} - Instructor: ${instructor}) Tj
/F2 10 Tf
0 -18 Td
(DevLearn IT Learning Platform - Official Course Material) Tj
0 -15 Td
(--------------------------------------------------------------------------------) Tj
/F2 10 Tf
`;

  let currentY = -20;
  lines.slice(0, 24).forEach(line => {
    stream1 += `0 ${currentY} Td\n(${line}) Tj\n`;
    currentY = -14;
  });

  stream1 += `ET`;

  pages.push(stream1);

  // Page 2: Slides & Key Takeaways (if any)
  if (slidePoints.length > 0) {
    let stream2 = `BT
/F1 16 Tf
50 750 Td
(Presentation Deck & Key Objectives) Tj
/F2 10 Tf
0 -20 Td
(--------------------------------------------------------------------------------) Tj
`;
    currentY = -18;
    slidePoints.slice(0, 28).forEach(pt => {
      stream2 += `0 ${currentY} Td\n(${pt}) Tj\n`;
      currentY = -14;
    });
    stream2 += `ET`;
    pages.push(stream2);
  }

  // Build PDF structure
  let pdf = `%PDF-1.4\n`;
  const offsets: number[] = [];

  const addObj = (data: string) => {
    offsets.push(pdf.length);
    pdf += data + '\n';
  };

  // Obj 1: Catalog
  addObj(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`);

  // Obj 2: Pages
  const pageKids = pages.map((_, i) => `${4 + i * 2} 0 R`).join(' ');
  addObj(`2 0 obj\n<< /Type /Pages /Kids [${pageKids}] /Count ${pages.length} >>\nendobj`);

  // Obj 3: Font
  addObj(`3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);

  // Build each page & content stream
  pages.forEach((stream, i) => {
    const pageObjNum = 4 + i * 2;
    const contentObjNum = 5 + i * 2;

    // Page Object
    addObj(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentObjNum} 0 R /Resources << /Font << /F1 3 0 R /F2 3 0 R >> >> >>\nendobj`
    );

    // Content Stream Object
    const streamLen = stream.length;
    addObj(
      `${contentObjNum} 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj`
    );
  });

  // Cross Reference Table
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(offset => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });

  // Trailer
  pdf += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function downloadBlobAsFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
