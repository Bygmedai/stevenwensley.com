// POST /api/receipt/issue   { "session_id": "cs_…", "answers": "0123-…" }
//
// Returns the receipt as a PDF once Stripe confirms the session is paid, for
// the right amount. The first call writes the receipt onto the payment; every
// later call for the same payment returns that same receipt.

import { Failure, issueReceipt, json } from '../../_lib/receipt-service.js';
import { buildReceipt } from '../../_lib/receipt.js';

export async function onRequestPost({ request, env }) {
  let body;
  try {
    const text = await request.text();
    if (text.length > 4096) return json(413, { ok: false, code: 'too_large' });
    body = JSON.parse(text);
  } catch {
    return json(400, { ok: false, code: 'bad_request' });
  }

  let receipt;
  try {
    receipt = await issueReceipt(env, { sessionId: body.session_id, answers: body.answers });
  } catch (e) {
    if (e instanceof Failure) return json(e.status, { ok: false, code: e.code });
    return json(500, { ok: false, code: 'error' });
  }

  const pdf = buildReceipt(receipt);
  return new Response(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${receipt.receiptId}.pdf"`,
      'Cache-Control': 'no-store',
      'X-Receipt-Id': receipt.receiptId,
      'X-Receipt-Issued': receipt.issuedAt,
      'X-Receipt-Reused': receipt.reused ? '1' : '0',
    },
  });
}
