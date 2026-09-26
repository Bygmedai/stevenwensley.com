// GET /api/receipt/verify?id=NIS2-XXXX-XXXX
//
// What a receipt said when it was issued: date, question set, fingerprint,
// overall and domain results. Nothing that identifies the buyer.

import { Failure, json, verifyReceipt } from '../../_lib/receipt-service.js';

export async function onRequestGet({ request, env }) {
  const id = new URL(request.url).searchParams.get('id');
  try {
    return json(200, { ok: true, receipt: await verifyReceipt(env, id) });
  } catch (e) {
    if (e instanceof Failure) return json(e.status, { ok: false, code: e.code });
    return json(500, { ok: false, code: 'error' });
  }
}
