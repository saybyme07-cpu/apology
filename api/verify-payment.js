// api/verify-payment.js - Vercel Serverless Function to verify Razorpay signature
const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'ywHZp7c8E9DD5JYkF1tCPsnW';

    if (!razorpay_payment_id) {
      return res.status(400).json({ valid: false, error: 'Missing payment ID' });
    }

    if (razorpay_order_id && razorpay_signature) {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      const isValid = expectedSignature === razorpay_signature;
      return res.status(200).json({ valid: isValid });
    }

    // Direct payment without order ID
    return res.status(200).json({ valid: true });
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
