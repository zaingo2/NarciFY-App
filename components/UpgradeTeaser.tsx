import React from 'react';

interface UpgradeTeaserProps {
  title: string;
  description: string;
  icon: string;
  onUpgrade: () => void;
}

export const UpgradeTeaser: React.FC<UpgradeTeaserProps> = ({ title, description, icon, onUpgrade }) => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="text-center py-12 px-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-teal-400 to-violet-500 mb-6">
            <i className={`fa-solid ${icon} text-3xl text-white`}></i>
        </div>
        <h1 className="text-3xl font-bold text-slate-50">{title}</h1>
        <p className="text-slate-300 mt-4 max-w-2xl mx-auto">
          {description}
        </p>
        <button
          onClick={onUpgrade}
          className="mt-8 bg-teal-500 text-white font-bold py-3 px-8 rounded-full hover:bg-teal-600 transition-transform hover:scale-105"
        >
          <i className="fa-solid fa-rocket mr-2"></i>
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
};
