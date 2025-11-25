
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface VisualizationCardProps {
    onClick: () => void;
}

export const VisualizationCard: React.FC<VisualizationCardProps> = ({ onClick }) => {
    const { t } = useTranslation();

    return (
        <div 
            onClick={onClick}
            className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 group mb-6 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
            
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        <i className="fa-solid fa-mountain-sun mr-2"></i>
                        {t('visualization.cardTitle')}
                    </h3>
                    <p className="text-violet-100 text-sm leading-relaxed">
                        {t('visualization.cardDescription')}
                    </p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                    <i className="fa-solid fa-eye text-2xl text-white"></i>
                </div>
            </div>
            
            <div className="mt-4 flex items-center text-xs font-bold text-white uppercase tracking-wider">
                <span>{t('visualization.tryItNow')}</span>
                <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
            </div>
        </div>
    );
};
