/* Agentkvittering — paid NIS2 receipt (browser).
 *
 * On-screen traffic-light stays free. This module persists the scan, sends
 * the buyer to a Stripe Payment Link, and after /api/agentkvittering confirms
 * payment_status=paid it builds a paper-style PDF for the folder.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.Agentkvittering = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERSION = 'AK-NIS2-1.0';
  const TOOL_ID = 'nis2-gap-assessment';
  const PRICE_ORE = 149700;
  const PRICE_LABEL = '1.497 kr';
  const STORAGE_KEY = 'ssw.agentkvittering.nis2';
  const PAID_KEY = 'ssw.agentkvittering.paid';

  // Replace after Steven creates the Payment Link (see docs/agentkvittering-stripe.md).
  // After-completion URL must be:
  //   https://stevenwensley.com/nis2-gap-assessment?session_id={CHECKOUT_SESSION_ID}
  const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_REPLACE_AGENTKVITTERING';

  const VERIFY_PATH = '/api/agentkvittering';

  function trafficLight(pct) {
    if (pct < 30) return { key: 'rod', label: 'RØD', color: [192, 57, 43] };
    if (pct < 55) return { key: 'gul', label: 'GUL', color: [230, 126, 34] };
    if (pct < 75) return { key: 'amber', label: 'AMBER', color: [201, 169, 110] };
    return { key: 'gron', label: 'GRØN', color: [39, 174, 96] };
  }

  function maturityCopy(pct) {
    if (pct < 30) return 'Initial — væsentlige huller, kræver øjeblikkelig opmærksomhed';
    if (pct < 55) return 'Under opbygning — fundament findes, kritiske huller står tilbage';
    if (pct < 75) return 'Defineret — god fremdrift, målrettede forbedringer mangler';
    return 'Styret — stærk posture, løbende forbedring anbefales';
  }

  function shortHash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  function documentId(answers, createdAt) {
    const day = (createdAt || new Date().toISOString()).slice(0, 10).replace(/-/g, '');
    return `AK-NIS2-${day}-${shortHash(JSON.stringify(answers || {}))}`;
  }

  function saveSnapshot(snapshot) {
    const payload = Object.assign({ tool: TOOL_ID, version: VERSION, savedAt: new Date().toISOString() }, snapshot);
    try {
      root.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) { /* private mode / quota — payment return then asks them to scan again */ }
    return payload;
  }

  function loadSnapshot() {
    try {
      const raw = root.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.answers) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function savePaidSession(payment) {
    try {
      root.sessionStorage.setItem(PAID_KEY, JSON.stringify(payment));
    } catch (_) { /* ignore */ }
  }

  function loadPaidSession() {
    try {
      const raw = root.sessionStorage.getItem(PAID_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function buildModel(domains, answers, payment) {
    const domainScores = (domains || []).map((d, di) => {
      let total = 0;
      let max = 0;
      const reviewed = (d.questions || []).map((q, qi) => {
        const val = answers[`${di}-${qi}`];
        max += 3;
        total += val !== undefined ? val : 0;
        return {
          question: q.text,
          score: val,
          option: val !== undefined ? q.options[val] : 'Ikke besvaret',
        };
      });
      const pct = max ? Math.round((total / max) * 100) : 0;
      return {
        id: d.id,
        name: d.name,
        ref: d.ref,
        subtitle: d.subtitle,
        score: total,
        max,
        pct,
        light: trafficLight(pct),
        reviewed,
      };
    });

    const overallScore = domainScores.reduce((s, d) => s + d.score, 0);
    const overallMax = domainScores.reduce((s, d) => s + d.max, 0);
    const overallPct = overallMax ? Math.round((overallScore / overallMax) * 100) : 0;

    const findings = [];
    domainScores.forEach((d) => {
      d.reviewed.forEach((q) => {
        if (q.score !== undefined && q.score <= 1) {
          findings.push({
            domain: d.name,
            ref: d.ref,
            question: q.question,
            score: q.score,
            option: q.option,
            light: q.score === 0 ? 'RØD' : 'GUL',
          });
        }
      });
    });

    const needsHuman = findings.map((f) => ({
      domain: f.domain,
      ref: f.ref,
      question: f.question,
      why: f.score === 0
        ? 'Intet dokumenteret — kræver menneske der kan påvise kontrol eller acceptere risikoen.'
        : 'Delvist / uformelt — kræver menneske der kan skelne evidens fra intention.',
    }));

    if (!needsHuman.length) {
      needsHuman.push({
        domain: 'Helhed',
        ref: '—',
        question: 'Ingen røde eller gule svar i denne kørsel.',
        why: 'En grøn scoring er stadig en selvvurdering. Et menneske skal stikprøve evidens, før den kan lægges i mappen som compliance.',
      });
    }

    const createdAt = new Date().toISOString();
    return {
      title: 'Agentkvittering',
      subtitle: 'Kvittering / evidens — ikke et dashboard',
      tool: 'NIS2 Gap Assessment',
      toolPath: '/nis2-gap-assessment',
      version: VERSION,
      priceLabel: PRICE_LABEL,
      createdAt,
      documentId: documentId(answers, createdAt),
      overallPct,
      overallLight: trafficLight(overallPct),
      maturity: maturityCopy(overallPct),
      questionCount: domainScores.reduce((s, d) => s + d.reviewed.length, 0),
      domainCount: domainScores.length,
      domains: domainScores,
      findings,
      needsHuman,
      payment: payment || null,
      disclaimer:
        'Dette er en kvittering for én gennemført scanning, ikke en erklæring om NIS2-overensstemmelse. ' +
        'På skærmen vises et kort trafiklys uden beregning. Denne fil beskriver hvad der blev gennemgået, ' +
        'hvad scanneren fandt, og hvad der kræver et menneske. Den erstatter ikke en juridisk eller teknisk vurdering.',
    };
  }

  function addWrapped(doc, text, x, y, maxWidth, lineHeight) {
    const lines = doc.splitTextToSize(text || '', maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  }

  function ensureSpace(doc, y, need, margin) {
    const pageH = doc.internal.pageSize.getHeight();
    if (y + need < pageH - margin) return y;
    doc.addPage();
    return 18;
  }

  function rule(doc, y) {
    doc.setDrawColor(40, 40, 48);
    doc.setLineWidth(0.2);
    doc.line(16, y, 194, y);
    return y + 6;
  }

  function generatePdf(model) {
    const jspdfNs = (typeof window !== 'undefined' && window.jspdf) || (typeof root !== 'undefined' && root.jspdf);
    if (!jspdfNs || !jspdfNs.jsPDF) {
      throw new Error('jsPDF er ikke indlæst');
    }
    const doc = new jspdfNs.jsPDF({ unit: 'mm', format: 'a4' });
    const ink = [22, 22, 28];
    const muted = [90, 90, 98];
    const margin = 16;
    let y = 18;

    doc.setTextColor(...ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('STEVEN SEIDENFADEN WENSLEY  ·  stevenwensley.com', margin, y);
    y += 7;

    doc.setFontSize(18);
    doc.text(model.title.toUpperCase(), margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    doc.text(model.subtitle, margin, y);
    y = rule(doc, y + 4);

    doc.setTextColor(...ink);
    doc.setFontSize(9);
    const createdDa = new Date(model.createdAt).toLocaleString('da-DK', {
      timeZone: 'Europe/Copenhagen',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const meta = [
      ['Dokument-id', model.documentId],
      ['Værktøj', `${model.tool}  (${model.domainCount} domæner, ${model.questionCount} spørgsmål)`],
      ['Tidspunkt', `${createdDa} (Europe/Copenhagen)`],
      ['Versionsstempel', model.version],
      ['Beløb', model.priceLabel + '  ·  pr. kørsel'],
    ];
    if (model.payment && model.payment.session_id) {
      meta.push(['Stripe-session', model.payment.session_id]);
    }
    meta.forEach((row) => {
      doc.setFont('helvetica', 'bold');
      doc.text(row[0], margin, y);
      doc.setFont('helvetica', 'normal');
      y = addWrapped(doc, String(row[1]), 58, y, 136, 4.4);
      y += 1.6;
    });

    y = rule(doc, y + 2);
    y = ensureSpace(doc, y, 20, margin);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Samlet trafiklys', margin, y);
    y += 7;
    const light = model.overallLight;
    doc.setFillColor(...light.color);
    doc.roundedRect(margin, y - 4.5, 18, 7, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(light.label, margin + 9, y, { align: 'center' });
    doc.setTextColor(...ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${model.overallPct}%`, margin + 22, y + 0.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    y = addWrapped(doc, model.maturity, margin + 42, y, 136, 4.4);
    y += 4;

    y = ensureSpace(doc, y, 16, margin);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...ink);
    doc.text('Hvad blev gennemgået', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    y = addWrapped(
      doc,
      'Selvvurdering på ti NIS2-domæner (Art. 20–24 og Art. 21-foranstaltninger), tilpasset fødevareproduktion og kritisk infrastruktur. Hvert spørgsmål har fire trin (0–3). Scanneren gemmer intet på serveren — denne fil er evidensen for kørslen.',
      margin,
      y,
      178,
      4.4
    );
    y += 4;

    model.domains.forEach((d) => {
      y = ensureSpace(doc, y, 10, margin);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`${d.light.label}  ${d.pct}%   ${d.name}  (${d.ref})`, margin, y);
      y += 4.2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      y = addWrapped(doc, d.subtitle, margin, y, 178, 3.8);
      doc.setTextColor(...ink);
      y += 3;
    });

    y = ensureSpace(doc, y, 16, margin);
    y = rule(doc, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Fund (${model.findings.length} under tærskel)`, margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (!model.findings.length) {
      y = addWrapped(doc, 'Ingen svar på 0 eller 1 i denne kørsel. Se alligevel afsnittet om menneskelig vurdering.', margin, y, 178, 4.4);
      y += 3;
    } else {
      model.findings.forEach((f, i) => {
        y = ensureSpace(doc, y, 16, margin);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        y = addWrapped(doc, `${i + 1}. [${f.light}] ${f.domain} (${f.ref})`, margin, y, 178, 4.2);
        doc.setFont('helvetica', 'normal');
        y = addWrapped(doc, f.question, margin, y, 178, 4.2);
        doc.setTextColor(...muted);
        y = addWrapped(doc, `Nuværende: ${f.option}`, margin, y, 178, 4.2);
        doc.setTextColor(...ink);
        y += 2.5;
      });
    }

    y = ensureSpace(doc, y, 16, margin);
    y = rule(doc, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Hvad kræver et menneske', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    model.needsHuman.forEach((h, i) => {
      y = ensureSpace(doc, y, 16, margin);
      doc.setFont('helvetica', 'bold');
      y = addWrapped(doc, `${i + 1}. ${h.domain} (${h.ref})`, margin, y, 178, 4.2);
      doc.setFont('helvetica', 'normal');
      y = addWrapped(doc, h.question, margin, y, 178, 4.2);
      doc.setTextColor(...muted);
      y = addWrapped(doc, h.why, margin, y, 178, 4.2);
      doc.setTextColor(...ink);
      y += 2.5;
    });

    y = ensureSpace(doc, y, 28, margin);
    y = rule(doc, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Forbehold', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    y = addWrapped(doc, model.disclaimer, margin, y, 178, 4);
    y += 6;
    doc.setTextColor(...muted);
    doc.setFontSize(8);
    doc.text('Ikke et produkt-dashboard. En fil til mappen.', margin, y);
    y += 4;
    doc.text(`Versionsstempel ${model.version}  ·  ${model.documentId}`, margin, y);

    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text(`Agentkvittering  ·  side ${i} af ${pages}  ·  ${model.documentId}`, margin, 287);
    }

    const stamp = model.createdAt.slice(0, 10);
    doc.save(`Agentkvittering-NIS2-${stamp}.pdf`);
    return doc;
  }

  async function verifySession(sessionId) {
    const url = `${VERIFY_PATH}?session_id=${encodeURIComponent(sessionId)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    let body = {};
    try {
      body = await res.json();
    } catch (_) {
      body = {};
    }
    if (!res.ok || !body.paid) {
      const err = new Error(body.error || 'ikke_betalt');
      err.status = res.status;
      err.body = body;
      throw err;
    }
    savePaidSession(body);
    return body;
  }

  function checkoutUrl() {
    return STRIPE_PAYMENT_LINK;
  }

  function isPlaceholderLink() {
    return /REPLACE|test_000000000000/i.test(STRIPE_PAYMENT_LINK);
  }

  return {
    VERSION,
    TOOL_ID,
    PRICE_ORE,
    PRICE_LABEL,
    STORAGE_KEY,
    PAID_KEY,
    STRIPE_PAYMENT_LINK,
    VERIFY_PATH,
    trafficLight,
    maturityCopy,
    documentId,
    saveSnapshot,
    loadSnapshot,
    savePaidSession,
    loadPaidSession,
    buildModel,
    generatePdf,
    verifySession,
    checkoutUrl,
    isPlaceholderLink,
  };
});
