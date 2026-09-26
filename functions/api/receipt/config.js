// GET /api/receipt/config
//
// Whether the paid receipt can be bought right now, and where. The NIS2 page
// asks before it shows the button: until Stripe is set up in Cloudflare, the
// answer is "not available" and the page looks exactly as it did before —
// no button that leads to a payment that cannot happen.

import { json, offer } from '../../_lib/receipt-service.js';

export function onRequestGet({ env }) {
  const { available, paymentLink, amount, currency } = offer(env);
  return json(200, available ? { available, paymentLink, amount, currency } : { available: false });
}
