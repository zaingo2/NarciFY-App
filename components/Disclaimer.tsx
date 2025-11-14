
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export const Disclaimer: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="bg-amber-500/10 border-l-4 border-amber-500 text-amber-200 p-4 rounded-md mb-6" role="alert">
            <div className="flex">
                <div className="py-1">
                    <i className="fa fa-warning fa-lg mr-4 text-amber-400"></i>
                </div>
                <div>
                    <p className="font-bold">{t('disclaimer.title')}</p>
                    <p className="text-sm">
                        {t('disclaimer.text')}
                    </p>
                </div>
            </div>
        </div>
    );
};
