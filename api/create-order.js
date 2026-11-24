// api/create-order.js - Vercel Serverless Function for Razorpay Order Creation
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_U40IbdT5uMc3ZW';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'ywHZp7c8E9DD5JYkF1tCPsnW';

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const receipt = 'rcpt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 19900, // ₹199 = 19900 paise (Original ₹499, Discounted to ₹199)
        currency: 'INR',
        receipt: receipt,
        notes: {
          app: 'SayByMe',
          service: 'Apology Private Link',
          original_price: '499',
          discount_price: '199'
        }
      })
    });

    const data = await rzpResponse.json();

    if (!rzpResponse.ok) {
      console.error('Razorpay API error:', data);
      return res.status(rzpResponse.status).json({ error: data.error || 'Failed to create order' });
    }

    return res.status(200).json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: keyId
    });
  } catch (err) {
    console.error('Server error creating Razorpay order:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
