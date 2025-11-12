// This file should be placed in the `api` directory of your project.
// Platforms like Vercel will automatically turn this into a serverless function.
import Stripe from 'stripe';

// This should be set as an Environment Variable in your hosting platform (e.g., Vercel).
// DO NOT hardcode this in your code.
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
// The production URL of your deployed application. Vercel sets this automatically.
// If it's not set, we'll build a fallback for local development.
const YOUR_DOMAIN = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:5173'; // Fallback for local dev

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10', // Use a specific API version
}) : null;

// This is the main function executed when a request hits `/api/create-checkout-session`
export default async function handler(req, res) {
  if (!stripe) {
    console.error("Stripe secret key is not configured.");
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { priceId } = req.body;
    
    if (!priceId) {
        return res.status(400).json({ error: 'Price ID is required in the request body.' });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId, // The Price ID is now dynamically passed from the frontend
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}?payment_success=true`,
      cancel_url: `${YOUR_DOMAIN}?payment_canceled=true`,
    });

    res.status(200).json({ id: session.id });

  } catch (error) {
    console.error("Error creating Stripe checkout session:", error.message);
    res.status(500).json({ error: 'Could not create payment session.' });
  }
}
