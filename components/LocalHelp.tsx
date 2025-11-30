import React from 'react';
import type { LocalHelpResult } from '../types';
import { Spinner } from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

interface LocalHelpProps {
  results: LocalHelpResult[];
  onFindHelp: () => void;
  isLoading: boolean;
}

export const LocalHelp: React.FC<LocalHelpProps> = ({ results, onFindHelp, isLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg h-full">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-slate-50 flex items-center">
          <i className="fa-solid fa-hand-holding-heart mr-3 text-pink-300"></i>
          {t('localHelp.title')}
        </h2>
        <h2 className="text-xl font-bold text-slate-50">
          Narci<span className="text-teal-400">FY</span>
        </h2>
      </div>
      <p className="text-slate-300 mb-6">{t('localHelp.description')}</p>
      
      <button onClick={onFindHelp} disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 disabled:bg-teal-500/50 transition-colors flex items-center justify-center">
        {isLoading ? <Spinner /> : <><i className="fa-map-marker-alt mr-2"></i> {t('localHelp.findHelpButton')}</>}
      </button>

      <div className="mt-6">
        {results.length > 0 ? (
            <div className="space-y-3">
                {results.map((result, index) => (
                    <a 
                        key={index} 
                        href={result.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        <p className="font-semibold text-teal-400">{result.title}</p>
                        <span className="text-xs text-slate-300">{t('localHelp.viewOnMap')} <i className="fa fa-external-link-alt ml-1"></i></span>
                    </a>
                ))}
            </div>
        ) : (
            !isLoading && <p className="text-center text-slate-300 mt-8">{t('localHelp.initialMessage')}</p>
        )}
      </div>
    </div>
  );
};