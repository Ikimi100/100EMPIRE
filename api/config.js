// GET /api/config — the Flutterwave public key for the Pay page (safe to share).
// Set FLW_PUBLIC_KEY in Vercel: Project > Settings > Environment Variables.
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ publicKey: process.env.FLW_PUBLIC_KEY || null });
};
