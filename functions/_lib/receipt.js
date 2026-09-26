// The paid NIS2 receipt: what goes on it, and where.
//
// Everything printed here is computed on the server from three things the
// customer cannot edit after paying: the answers stored on their Stripe
// payment, the question set in /js/nis2-model.js, and the moment the receipt
// was issued. The browser only asks for the file; it never supplies a line of
// it. That is the difference from PR #72, which built the PDF in the browser
// from the browser's own data — a document anyone could have produced for
// free, and nobody could have checked.

import NIS2 from '../../js/nis2-model.js';
import { A4, PdfDocument, textWidth, wrap, winAnsiByte } from './pdf.js';

const INK = [26, 26, 34];
const MUTED = [105, 105, 118];
const RULE = [218, 218, 226];
const TEAL = [43, 122, 111];
const GOLD = [160, 128, 70];
const BAND = {
  red: { label: 'Red', color: [192, 57, 43] },
  orange: { label: 'Orange', color: [230, 126, 34] },
  gold: { label: 'Amber', color: [201, 169, 110] },
  green: { label: 'Green', color: [39, 174, 96] },
};

const M = 56;                 // page margin
const W = A4.w - 2 * M;       // text width
const TOP = 64;               // first line on a continuation page
const BOTTOM = A4.h - 64;     // last line before the footer

export const SITE = 'stevenwensley.com';

// Names come from Stripe, typed by the customer; they are the only text on
// the receipt the site did not write. Accents are kept where WinAnsi has
// them; a letter it cannot print becomes its base letter, or "?".
const NO_DECOMPOSITION = { 'Ł': 'L', 'ł': 'l', 'Đ': 'D', 'đ': 'd', 'ı': 'i' };

export function printable(str) {
  return [...String(str ?? '')]
    .map((ch) => (winAnsiByte(ch) >= 0 ? ch : NO_DECOMPOSITION[ch] || ch.normalize('NFKD').replace(/[̀-ͯ]/g, '') || '?'))
    .map((ch) => ([...ch].every((c) => winAnsiByte(c) >= 0) ? ch : '?'))
    .join('');
}

export function formatIssued(iso) {
  const d = new Date(iso);
  const cph = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Copenhagen', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  const utc = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
  return `${cph.replace(' at ', ', ')} Copenhagen time (${utc})`;
}

/**
 * @param {{ receiptId: string, issuedAt: string, issuedTo: string, answers: string,
 *           questionSet: string, fingerprint: string }} r
 * @returns {Uint8Array}
 */
export function buildReceipt(r) {
  const answers = NIS2.decodeAnswers(r.answers);
  if (!answers) throw new Error('receipt: answers do not match the question set');
  const { domainScores, overallPct, band, maturity } = NIS2.score(answers);
  const gaps = NIS2.gaps(answers);
  const recos = NIS2.recommendations(domainScores);

  const doc = new PdfDocument({
    title: `NIS2 gap assessment receipt ${r.receiptId}`,
    author: 'Steven Wensley',
    subject: 'NIS2 gap self-assessment: dated record of the answers submitted and the result they produce',
    created: new Date(r.issuedAt),
  });

  let page = doc.addPage();
  let y = 0;
  const ensure = (h) => { if (y + h > BOTTOM) { page = doc.addPage(); y = TOP; } };

  const para = (str, { font = 'regular', size = 10, color = INK, lead = 1.45, indent = 0, after = 0 } = {}) => {
    const lines = wrap(str, font, size, W - indent);
    for (const line of lines) { ensure(size * lead); y += size * lead; doc.text(page, M + indent, y, line, { font, size, color }); }
    y += after;
  };
  // `keep` is the space the first lines under the heading need, so a heading
  // never sits alone at the foot of a page with its text on the next.
  const heading = (str, keep = 48) => {
    ensure(37 + keep);
    y += 26;
    doc.text(page, M, y, str.toUpperCase(), { font: 'bold', size: 9, color: TEAL });
    y += 7;
    doc.line(page, M, y, M + W, y, { color: RULE });
    y += 4;
  };

  // ── Title block ──
  doc.rect(page, 0, 0, A4.w, 6, TEAL);
  y = 58;
  doc.text(page, M, y, 'NIS2 GAP ASSESSMENT', { font: 'bold', size: 9, color: GOLD });
  const brand = `Steven Wensley · ${SITE}`;
  doc.text(page, M + W - textWidth(brand, 'regular', 9), y, brand, { size: 9, color: MUTED });
  y += 30;
  doc.text(page, M, y, 'Board receipt', { font: 'bold', size: 26, color: INK });
  y += 10;

  const meta = [
    ['Receipt no.', r.receiptId],
    ['Issued', formatIssued(r.issuedAt)],
    ['Issued to', printable(r.issuedTo) || 'Not given at checkout'],
    ['Question set', `${r.questionSet} · ${NIS2.questionCount} questions in ${NIS2.domains.length} domains`],
    ['Answers fingerprint', r.fingerprint],
  ];
  for (const [k, v] of meta) {
    const lines = wrap(v, k === 'Receipt no.' ? 'bold' : 'regular', 10, W - 120);
    y += 16;
    doc.text(page, M, y, k, { size: 9, color: MUTED });
    lines.forEach((line, i) => doc.text(page, M + 120, y + i * 14, line, { font: k === 'Receipt no.' ? 'bold' : 'regular', size: 10 }));
    y += (lines.length - 1) * 14;
  }

  heading('What this receipt is');
  para('A dated record of the answers submitted to the NIS2 gap self-assessment at ' + SITE + ', and of the result those answers produce. It records what was declared, not what was verified: it is not an audit, a certification or legal advice.', { after: 6 });
  para('NIS2 Article 20 makes the management body responsible for approving and overseeing cybersecurity risk-management measures. This receipt can be filed with the board papers as evidence that the assessment was carried out, when, and with what result.', { after: 2 });

  // ── Result ──
  heading('Result');
  ensure(40);
  y += 30;
  const pctText = `${overallPct}%`;
  doc.text(page, M, y, pctText, { font: 'bold', size: 30, color: BAND[band].color });
  doc.text(page, M + textWidth(pctText, 'bold', 30) + 12, y - 4, maturity, { size: 10.5, color: INK });
  y += 10;

  const barX = M + 250, barW = W - 250 - 70;
  for (const d of domainScores) {
    ensure(20);
    y += 19;
    const b = BAND[NIS2.band(d.pct)];
    doc.text(page, M, y, d.name, { size: 9.5 });
    doc.text(page, M + 160, y, d.ref, { size: 8.5, color: MUTED });
    doc.rect(page, barX, y - 7, barW, 7, [238, 238, 242]);
    if (d.pct > 0) doc.rect(page, barX, y - 7, (barW * d.pct) / 100, 7, b.color);
    const label = `${d.pct}% ${b.label}`;
    doc.text(page, M + W - textWidth(label, 'regular', 9), y, label, { size: 9, color: INK });
  }

  // ── Gaps ──
  heading(`Critical gaps (${gaps.length})`);
  if (!gaps.length) para('None. No question was answered at the two lowest levels.', { color: MUTED });
  for (const g of gaps) {
    ensure(46);
    y += 6;
    const mark = g.score === 0 ? BAND.red : BAND.orange;
    doc.rect(page, M, y + 3, 6, 6, mark.color);
    para(`${g.domain} (${g.ref})`, { font: 'bold', size: 9, color: MUTED, indent: 14, lead: 1.3 });
    para(g.question, { size: 10, indent: 14, lead: 1.35 });
    para(`Current: ${g.option}`, { size: 9.5, color: MUTED, indent: 14, lead: 1.35 });
  }

  // ── Decisions ──
  heading('For the management body to decide');
  recos.forEach((rec, i) => {
    ensure(40);
    y += 6;
    doc.text(page, M, y + 13.5, `${i + 1}.`, { font: 'bold', size: 10, color: TEAL });
    para(rec.text, { font: 'bold', size: 10, indent: 18, lead: 1.35 });
    para(rec.desc, { size: 9.5, color: INK, indent: 18, lead: 1.4 });
  });

  // ── Every answer ──
  heading('Every answer, as submitted');
  NIS2.domains.forEach((d, di) => {
    ensure(40);
    y += 8;
    para(`${d.name} · ${d.ref}`, { font: 'bold', size: 10, color: TEAL, lead: 1.4 });
    d.questions.forEach((q, qi) => {
      const val = answers[`${di}-${qi}`];
      ensure(34);
      y += 3;
      para(q.text, { size: 9.5, lead: 1.35 });
      para(val === undefined ? 'Not answered (scored 0)' : `${q.options[val]}  (${val} of 3)`, { size: 9, color: MUTED, indent: 12, lead: 1.35 });
    });
  });

  // ── Verification ──
  heading('Checking this receipt', 80);
  para(`Anyone holding this document can check it at ${SITE}/verify-receipt by entering the receipt number ${r.receiptId}. That page shows when the receipt was issued, the overall and domain results, and the answers fingerprint. If they match this document, it is the one that was issued. The page shows nothing that identifies who bought it.`);

  // Running footer, written last so it can count the pages.
  const total = doc.pages.length;
  doc.pages.forEach((p, i) => {
    const y0 = A4.h - 34;
    doc.line(p, M, y0 - 12, M + W, y0 - 12, { color: RULE });
    doc.text(p, M, y0, `Receipt ${r.receiptId}`, { size: 8, color: MUTED });
    const right = `Page ${i + 1} of ${total}`;
    doc.text(p, M + W - textWidth(right, 'regular', 8), y0, right, { size: 8, color: MUTED });
    if (i > 0) doc.rect(p, 0, 0, A4.w, 3, TEAL);
  });

  return doc.toBytes();
}
