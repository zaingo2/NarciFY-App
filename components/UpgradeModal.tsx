import React, { useState } from 'react';

// Define a type for the Stripe object loaded from the script.
interface Stripe {
  redirectToCheckout: (options: { sessionId: string; }) => Promise<{ error?: { message:string; }; }>;
}

declare global {
  interface Window {
    Stripe?: (publicKey: string) => Stripe;
  }
}

// =================================================================================
// TODO: ACTION REQUIRED
// 1. Create two prices in your Stripe Dashboard for your product.
// 2. One should be a recurring monthly price (e.g., $4.99/month).
// 3. The other should be a recurring yearly price (e.g., $49.99/year).
// 4. Paste the Price IDs below to replace the placeholders.
// =================================================================================
const STRIPE_MONTHLY_PRICE_ID = 'price_...'; // <--- REPLACE WITH YOUR MONTHLY PRICE ID
const STRIPE_ANNUAL_PRICE_ID = 'price_...';  // <--- REPLACE WITH YOUR ANNUAL PRICE ID

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
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    const priceId = selectedPlan === 'annual' ? STRIPE_ANNUAL_PRICE_ID : STRIPE_MONTHLY_PRICE_ID;
    
    // Check if the user has replaced the placeholder IDs
    if (priceId.startsWith('price_...')) {
        alert("Configuration needed: Stripe Price IDs are not set up yet in the code.");
        setIsProcessing(false);
        return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: priceId }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to create payment session.');
      }
      
      const session = await response.json();
      const { id: sessionId } = session;
        
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
    } catch (error: any) {
        console.error("Payment process error:", error);
        alert(`There was a problem initiating the payment: ${error.message}`);
    } finally {
        setIsProcessing(false);
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
        
        <div className="px-6 pb-6 space-y-4 max-h-[40vh] overflow-y-auto">
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
        
        {/* Pricing Toggle */}
        <div className="px-6 pb-4">
            <div className="bg-slate-900 p-1.5 rounded-xl flex items-center relative">
                 <button onClick={() => setSelectedPlan('monthly')} className={`w-1/2 p-2 rounded-lg text-sm font-bold z-10 transition-colors ${selectedPlan === 'monthly' ? 'text-white' : 'text-slate-300'}`}>
                    Monthly
                </button>
                <button onClick={() => setSelectedPlan('annual')} className={`w-1/2 p-2 rounded-lg text-sm font-bold z-10 transition-colors ${selectedPlan === 'annual' ? 'text-white' : 'text-slate-300'}`}>
                    Annual
                </button>
                <div className={`absolute top-1.5 h-[calc(100%-12px)] w-1/2 bg-teal-500 rounded-lg transition-transform duration-300 ease-in-out ${selectedPlan === 'annual' ? 'translate-x-full' : 'translate-x-0'}`}></div>
            </div>
            <div className="text-center mt-3 h-10 flex items-center justify-center">
                {selectedPlan === 'monthly' ? (
                    <p className="text-slate-50 text-xl"><span className="font-bold text-2xl">$4.99</span> / month</p>
                ) : (
                    <p className="text-slate-50 text-xl"><span className="font-bold text-2xl">$49.99</span> / year <span className="ml-2 bg-yellow-400/20 text-yellow-300 text-xs font-bold px-2 py-1 rounded-full">Save 16%</span></p>
                )}
            </div>
        </div>


        <div className="p-6 bg-slate-900/50 rounded-b-2xl">
            <p className="text-center text-slate-400 text-sm mb-4">
               Secure payment powered by Stripe. Cancel anytime.
            </p>
            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleStripeCheckout}
                    disabled={isProcessing}
                    className="w-full bg-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-700 transition-colors disabled:bg-violet-600/50 flex items-center justify-center"
                >
                    {isProcessing ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <><i className="fa-brands fa-stripe-s mr-2"></i> Pay with Card</>
                    )}
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
