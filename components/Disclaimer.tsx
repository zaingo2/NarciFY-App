
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface DisclaimerProps {
    onClose: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onClose }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-amber-500/10 border-l-4 border-amber-500 text-amber-200 p-4 rounded-md mb-6" role="alert">
            <div className="flex">
                <div className="py-1">
                    <i className="fa fa-warning fa-lg mr-4 text-amber-400"></i>
                </div>
                <div className="flex-1">
                    <p className="font-bold">{t('disclaimer.title')}</p>
                    <p className="text-sm">
                        {t('disclaimer.text')}
                    </p>
                </div>
                <div className="pl-3">
                    <button onClick={onClose} className="text-amber-300 hover:text-amber-100 transition-colors" aria-label="Dismiss">
                        <i className="fa fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};
