import React, { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

export const UpdateNotification: React.FC = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register the service worker (idempotent) to get the registration object
      // Use ./ to ensure it registers against the current origin, avoiding mismatches in preview environments
      navigator.serviceWorker.register('./service-worker.js').then(reg => {
        
        // Check if there is already a waiting worker (updated in background)
        if (reg.waiting) {
          setRegistration(reg);
          setShow(true);
        }

        // Listen for new updates found
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // A new version is installed and waiting
                setRegistration(reg);
                setShow(true);
              }
            });
          }
        });
      }).catch(err => {
          console.error("Service Worker registration failed in component:", err);
      });

      // Reload the page when the new service worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell the waiting worker to activate immediately
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] animate-slide-up">
      <div className="bg-slate-800/95 backdrop-blur-md border border-teal-500/50 shadow-2xl rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 max-w-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center shrink-0">
            <i className="fa-solid fa-cloud-arrow-down text-teal-400 text-lg"></i>
          </div>
          <div>
            <p className="text-slate-50 font-bold text-sm">{t('update.newVersionTitle')}</p>
          </div>
        </div>
        <button 
          onClick={handleUpdate}
          className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
        >
          {t('update.action')}
        </button>
      </div>
    </div>
  );
};