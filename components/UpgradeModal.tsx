import React from 'react';

// Define a type for the Stripe object loaded from the script.
interface Stripe {
  redirectToCheckout: (options: { sessionId: string; }) => Promise<{ error?: { message: string; }; }>;
}

declare global {
  interface Window {
    Stripe?: (publicKey: string) => Stripe;
  }
}

// Replace with your own Stripe PUBLISHABLE key.
// It's safe to have this key in the frontend code.
const STRIPE_PUBLIC_KEY = 'pk_test_51PbyJCRpG3A9whd1sWvWnFzYy0Z3s4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2'; // Example

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const premiumFeatures = [
    { icon: 'fa-magnifying-glass-chart', title: 'Pattern Detector', description: 'Analyze your entire history to reveal recurring manipulation tactics and long-term trends.' },
    { icon: 'fa-heart', title: 'Personalized 8D Audios', description: 'Generate custom 8D audio meditations for your specific needs, from calming anxiety to building confidence.' },
    { icon: 'fa-wand-magic-sparkles', title: 'Automatic Recommendations', description: 'Receive a personalized roadmap for healing with AI-powered advice and skill-building exercises.' },
    { icon: 'fa-microphone', title: 'Unlimited Audio Analysis', description: 'Analyze situations by simply recording your voice, without limits.' }
];

// Function to load the Stripe.js script dynamically.
const loadStripe = async (): Promise<Stripe | null> => {
    if (window.Stripe) return window.Stripe(STRIPE_PUBLIC_KEY);
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    return new Promise((resolve, reject) => {
        script.onload = () => {
            if (window.Stripe) {
                resolve(window.Stripe(STRIPE_PUBLIC_KEY));
            } else {
                reject(new Error('Stripe.js failed to load.'));
            }
        };
        script.onerror = () => reject(new Error('Stripe.js failed to load.'));
        document.head.appendChild(script);
    });
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleStripeCheckout = async () => {
    try {
      // 1. Call your new serverless function living at `/api/create-checkout-session`.
      // It's simple, clean, and secure.
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session.');
      }
      
      const session = await response.json();
      const { id: sessionId } = session;
        
      // 2. Load Stripe.js and redirect to the checkout page.
      const stripe = await loadStripe();
      if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) {
              console.warn("Error redirecting to Stripe:", error);
              alert(`Error: ${error.message}`);
          }
      } else {
          throw new Error("Stripe.js is not available.");
      }
    } catch (error) {
        console.error("Payment process error:", error);
        alert("There was a problem initiating the payment. Please try again later.");
    }
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" 
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-slate-800 rounded-2xl shadow-2xl w-11/12 max-w-lg m-4 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-teal-400 to-violet-500 mb-4 -mt-12 border-4 border-slate-800">
                <i className="fa-solid fa-rocket text-3xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-50 mb-2">Upgrade to NarciFY Premium</h2>
            <p className="text-slate-300">Unlock the full toolkit for clarity, healing, and empowerment.</p>
        </div>
        
        <div className="px-6 pb-6 space-y-4">
            {premiumFeatures.map(feature => (
                <div key={feature.title} className="flex items-start gap-4 p-3 bg-slate-900/50 rounded-lg">
                    <i className={`fa-solid ${feature.icon} text-xl text-teal-300 mt-1 w-6 text-center`}></i>
                    <div>
                        <h4 className="font-semibold text-slate-100">{feature.title}</h4>
                        <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="p-6 bg-slate-900/50 rounded-b-2xl">
            <p className="text-center text-slate-400 text-sm mb-4">
               Secure payment powered by Stripe.
            </p>
            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleStripeCheckout}
                    className="w-full bg-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-700 transition-colors"
                >
                    <i className="fa-brands fa-stripe-s mr-2"></i> Pay with Card (Stripe)
                </button>
            </div>
            <button onClick={onClose} className="w-full text-center text-slate-400 mt-4 text-sm hover:text-white">
                Maybe later
            </button>
        </div>

      </div>
    </div>
  );
};
