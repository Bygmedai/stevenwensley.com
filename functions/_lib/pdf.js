// A PDF writer that does only what the receipt needs: text in Helvetica and
// Helvetica-Bold, filled rectangles and lines, on A4 pages.
//
// Why not a library: the receipt is generated inside a Cloudflare Pages
// Function, on every paid download. A library would be a dependency to pin,
// audit and ship to the edge for a document that is text and a few coloured
// boxes. The PDF format for that is small enough to write directly, and the
// tests read every file this produces back with an independent parser.
//
// Text is encoded as WinAnsi, the encoding every reader supports for the
// standard fonts. It covers æ ø å é ü and the typographic dashes and quotes;
// anything outside it is refused rather than printed as a wrong character —
// PR #72 shipped a receipt that turned "RØD" into "R�D", and a document sold
// as evidence cannot carry a single glyph nobody wrote.

import { HELVETICA, HELVETICA_BOLD, WIN_ANSI_EXTRA } from './helvetica-metrics.js';

export const A4 = { w: 595.28, h: 841.89 };

const FONTS = {
  regular: { id: 'F1', base: 'Helvetica', widths: HELVETICA },
  bold: { id: 'F2', base: 'Helvetica-Bold', widths: HELVETICA_BOLD },
};

export function winAnsiByte(ch) {
  const cp = ch.codePointAt(0);
  if (WIN_ANSI_EXTRA.has(cp)) return WIN_ANSI_EXTRA.get(cp);
  if ((cp >= 0x20 && cp <= 0x7e) || (cp >= 0xa0 && cp <= 0xff)) return cp;
  return -1;
}

// Every character of `str` the writer could not print. Callers check this
// before generating; the writer itself throws, so nothing slips through.
export function unprintable(str) {
  return [...new Set([...String(str)].filter((ch) => winAnsiByte(ch) < 0))];
}

export function textWidth(str, font, size) {
  const widths = FONTS[font].widths;
  let w = 0;
  for (const ch of String(str)) {
    const b = winAnsiByte(ch);
    w += b >= 32 ? widths[b - 32] : 0;
  }
  return (w * size) / 1000;
}

// Greedy word wrap. A single word wider than the line is broken by character
// — rare in prose, but an e-mail address in a narrow column would otherwise
// run off the page.
export function wrap(str, font, size, maxWidth) {
  const lines = [];
  for (const para of String(str).split('\n')) {
    let line = '';
    for (const word of para.split(/ +/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (textWidth(candidate, font, size) <= maxWidth) { line = candidate; continue; }
      if (line) lines.push(line);
      line = word;
      while (textWidth(line, font, size) > maxWidth && line.length > 1) {
        let cut = line.length - 1;
        while (cut > 1 && textWidth(line.slice(0, cut), font, size) > maxWidth) cut--;
        lines.push(line.slice(0, cut));
        line = line.slice(cut);
      }
    }
    lines.push(line);
  }
  return lines;
}

// A PDF literal string: ASCII only, with every non-ASCII byte as an octal
// escape, so the file itself never depends on how anything decodes it.
function pdfString(str) {
  let out = '(';
  for (const ch of String(str)) {
    const b = winAnsiByte(ch);
    if (b < 0) throw new Error(`pdf: character U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')} cannot be printed in WinAnsi`);
    if (b === 0x28 || b === 0x29 || b === 0x5c) out += '\\' + ch;
    else if (b < 0x80) out += ch;
    else out += '\\' + b.toString(8).padStart(3, '0');
  }
  return out + ')';
}

const num = (n) => (Math.round(n * 100) / 100).toString();
const rgb = ([r, g, b]) => `${num(r / 255)} ${num(g / 255)} ${num(b / 255)}`;

export class PdfDocument {
  constructor({ title = '', author = '', subject = '', created = new Date() } = {}) {
    this.info = { title, author, subject, created };
    this.pages = [];
  }

  addPage() {
    const page = { ops: [] };
    this.pages.push(page);
    return page;
  }

  // y is measured from the TOP of the page, as a layout reads; PDF measures
  // from the bottom, so every call converts.
  text(page, x, y, str, { font = 'regular', size = 10, color = [0, 0, 0] } = {}) {
    page.ops.push(`BT /${FONTS[font].id} ${num(size)} Tf ${rgb(color)} rg ${num(x)} ${num(A4.h - y)} Td ${pdfString(str)} Tj ET`);
  }

  rect(page, x, y, w, h, color) {
    page.ops.push(`${rgb(color)} rg ${num(x)} ${num(A4.h - y - h)} ${num(w)} ${num(h)} re f`);
  }

  line(page, x1, y1, x2, y2, { color = [0, 0, 0], width = 0.5 } = {}) {
    page.ops.push(`${rgb(color)} RG ${num(width)} w ${num(x1)} ${num(A4.h - y1)} m ${num(x2)} ${num(A4.h - y2)} l S`);
  }

  toBytes() {
    const objects = [];
    const add = (body) => { objects.push(body); return objects.length; };

    const catalog = add(null);
    const pagesId = add(null);
    const f1 = add(`<< /Type /Font /Subtype /Type1 /BaseFont /${FONTS.regular.base} /Encoding /WinAnsiEncoding >>`);
    const f2 = add(`<< /Type /Font /Subtype /Type1 /BaseFont /${FONTS.bold.base} /Encoding /WinAnsiEncoding >>`);

    const kids = [];
    for (const page of this.pages) {
      const stream = page.ops.join('\n');
      const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
      kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${content} 0 R >>`));
    }
    objects[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;

    const d = this.info.created;
    const p2 = (n) => String(n).padStart(2, '0');
    const pdfDate = `D:${d.getUTCFullYear()}${p2(d.getUTCMonth() + 1)}${p2(d.getUTCDate())}${p2(d.getUTCHours())}${p2(d.getUTCMinutes())}${p2(d.getUTCSeconds())}Z`;
    const info = add(`<< /Title ${pdfString(this.info.title)} /Author ${pdfString(this.info.author)} /Subject ${pdfString(this.info.subject)} /Producer (stevenwensley.com) /CreationDate (${pdfDate}) >>`);

    // Every byte written is ASCII, so string length is byte length and the
    // cross-reference offsets can be counted in characters.
    let out = '%PDF-1.4\n';
    const offsets = [];
    objects.forEach((body, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${body}\nendobj\n`; });
    const xref = out.length;
    out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const o of offsets) out += `${String(o).padStart(10, '0')} 00000 n \n`;
    out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return new TextEncoder().encode(out);
  }
}
