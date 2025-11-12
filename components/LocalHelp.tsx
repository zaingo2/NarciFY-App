import React from 'react';
import type { LocalHelpResult } from '../types';
import { Spinner } from './Spinner';

interface LocalHelpProps {
  results: LocalHelpResult[];
  onFindHelp: () => void;
  isLoading: boolean;
}

export const LocalHelp: React.FC<LocalHelpProps> = ({ results, onFindHelp, isLoading }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg h-full">
      <h2 className="text-2xl font-bold mb-4 text-slate-50 flex items-center">
        <i className="fa-solid fa-hand-holding-heart mr-3 text-pink-300"></i>
        Find Local Support
      </h2>
      <p className="text-slate-300 mb-6">Find therapists, legal aid, and support centers near you. Your location is used only for this search and is not stored.</p>
      
      <button onClick={onFindHelp} disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 disabled:bg-teal-500/50 transition-colors flex items-center justify-center">
        {isLoading ? <Spinner /> : <><i className="fa fa-map-marker-alt mr-2"></i> Find Help Near Me</>}
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
                        <span className="text-xs text-slate-300">View on map <i className="fa fa-external-link-alt ml-1"></i></span>
                    </a>
                ))}
            </div>
        ) : (
            !isLoading && <p className="text-center text-slate-300 mt-8">Click the button to search for local support services.</p>
        )}
      </div>
    </div>
  );
};
