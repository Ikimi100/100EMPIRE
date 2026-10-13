// GET /api/verify?transaction_id=..&tx_ref=..&item=..&qty=..  (or &amount=.. for a quote)
// Confirms a payment with Flutterwave using the secret key, which stays on the server.
// Set FLW_SECRET_KEY in Vercel: Project > Settings > Environment Variables.
const catalog = require("./_catalog.json");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const secret = process.env.FLW_SECRET_KEY;
  if (!secret) return res.status(503).json({ ok: false, reason: "not_configured" });

  const q = req.query || {};
  const id = String(q.transaction_id || "");
  const ref = String(q.tx_ref || "");
  if (!/^\d{1,20}$/.test(id) || !/^100E-[A-Z0-9-]{4,40}$/.test(ref)) return res.status(400).json({ ok: false, reason: "bad_request" });

  // What the payment should be: the catalogue price for a package or frame, or the quoted amount
  let expected, label;
  if (q.item) {
    const item = catalog.items.find((i) => i.id === q.item);
    if (!item) return res.status(400).json({ ok: false, reason: "unknown_item" });
    const qty = item.qty ? Math.min(500, Math.max(1, parseInt(q.qty, 10) || 1)) : 1;
    expected = item.amount * qty;
    label = (qty > 1 ? qty + " x " : "") + item.group + ": " + item.name;
  } else {
    expected = parseInt(String(q.amount || "").replace(/\D/g, ""), 10);
    if (!(expected >= 1000)) return res.status(400).json({ ok: false, reason: "bad_amount" });
    label = "Quote or deposit";
  }

  let body, httpStatus;
  try {
    const r = await fetch(`https://api.flutterwave.com/v3/transactions/${id}/verify`, {
      headers: { Authorization: `Bearer ${secret}`, Accept: "application/json" },
    });
    httpStatus = r.status;
    body = await r.json();
  } catch (e) {
    return res.status(502).json({ ok: false, reason: "lookup_failed" });
  }
  // Flutterwave refused the key (wrong, test-mode or revoked): a set-up problem on our side,
  // so the pay page tells the customer the payment was sent and will be confirmed by hand.
  if (httpStatus === 401 || httpStatus === 403) return res.status(503).json({ ok: false, reason: "key_rejected" });
  if (!body || body.status !== "success" || !body.data) {
    const notFound = /no transaction/i.test(String((body && body.message) || ""));
    return res.status(502).json({ ok: false, reason: notFound ? "not_found" : "lookup_failed" });
  }

  const t = body.data;
  const checks = {
    successful: t.status === "successful",
    reference: t.tx_ref === ref,
    currency: t.currency === "NGN",
    amount: Number(t.amount) >= expected,
  };
  const ok = Object.values(checks).every(Boolean);
  return res.status(200).json({ ok, checks, label, expected, amount: Number(t.amount), currency: t.currency, tx_ref: t.tx_ref, flw_ref: t.flw_ref, paid_at: t.created_at });
};
