
import React, { useState, useEffect, useCallback } from 'react';
import type { AnalysisResult, Recommendation } from '../types';
import { generateRecommendations } from '../services/geminiService';
import { Spinner } from './Spinner';
import { useAuth } from '../contexts/AuthContext';
import { UpgradeTeaser } from './UpgradeTeaser';
import { useTranslation } from '../hooks/useTranslation';

interface AutomaticRecommendationsProps {
  analysisHistory: AnalysisResult[];
  onUpgrade: () => void;
}

const RecommendationCard: React.FC<{ recommendation: Recommendation }> = ({ recommendation }) => {
    const TYPE_STYLES: { [key: string]: string } = {
        'Deep Dive': 'border-blue-400 text-blue-300',
        'Skill Builder': 'border-teal-400 text-teal-300',
        'Healing Path': 'border-violet-400 text-violet-300',
        'Red Flag Spotlight': 'border-rose-400 text-rose-300',
    };

    return (
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 flex flex-col h-full">
            <div className="flex items-center mb-3">
                <i className={`fa-solid ${recommendation.icon} text-xl ${TYPE_STYLES[recommendation.type]}`}></i>
                <h3 className={`ml-3 text-sm font-bold tracking-wider uppercase ${TYPE_STYLES[recommendation.type]}`}>{recommendation.type}</h3>
            </div>
            <h2 className="text-xl font-bold text-slate-50 mb-2">{recommendation.title}</h2>
            <p className="text-slate-300 whitespace-pre-wrap flex-1">{recommendation.content}</p>
        </div>
    );
};

export const AutomaticRecommendations: React.FC<AutomaticRecommendationsProps> = ({ analysisHistory, onUpgrade }) => {
    const { status } = useAuth();
    const { t } = useTranslation();
    const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isHistoryEmpty = analysisHistory.length === 0 || (analysisHistory.length > 0 && analysisHistory[0].id.startsWith('placeholder-'));

    const fetchRecommendations = useCallback(async () => {
        if (isHistoryEmpty) {
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        try {
            const results = await generateRecommendations(analysisHistory);
            setRecommendations(results);
        } catch (err: any) {
            console.error("Failed to generate recommendations:", err);
            setError(t('recommendations.error'));
        } finally {
            setIsLoading(false);
        }
    }, [analysisHistory, isHistoryEmpty, t]);
    
    useEffect(() => {
        if(status !== 'free') {
            fetchRecommendations();
        } else {
            setIsLoading(false);
        }
    }, [fetchRecommendations, status]);
    
    if (status === 'free') {
        return (
             <UpgradeTeaser 
                title={t('upgrade.teaserRecommendationsTitle')}
                description={t('upgrade.teaserRecommendationsDesc')}
                onUpgrade={onUpgrade}
                icon="fa-wand-magic-sparkles"
            />
        );
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center py-20 bg-slate-800 rounded-xl">
                    <Spinner />
                    <p className="mt-4 text-slate-300">{t('recommendations.loading')}</p>
                </div>
            );
        }

        if (error) {
            return <div className="text-center py-20 bg-rose-500/10 text-rose-300 rounded-xl">{error}</div>;
        }

        if (isHistoryEmpty) {
            return (
                 <div className="text-center py-16 bg-slate-800 rounded-xl">
                    <i className="fa-solid fa-wand-magic-sparkles text-4xl text-slate-500 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-300">{t('recommendations.emptyTitle')}</h3>
                    <p className="text-slate-400 mt-2 max-w-md mx-auto">{t('recommendations.emptyText')}</p>
                </div>
            );
        }
        
        if (recommendations && recommendations.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-6">
                    {recommendations.map((rec, index) => (
                        <RecommendationCard key={index} recommendation={rec} />
                    ))}
                </div>
            );
        }

        return (
            <div className="text-center py-20 bg-slate-800 rounded-xl">
                <p className="text-slate-300">{t('recommendations.genericError')}</p>
            </div>
        );
    };

    return (
         <div className="p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-50">{t('recommendations.title')}</h1>
                    <p className="text-slate-300 mt-1">{t('recommendations.description')}</p>
                </div>
                 <button 
                    onClick={fetchRecommendations} 
                    disabled={isLoading || isHistoryEmpty}
                    className="flex-shrink-0 bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2 text-sm disabled:bg-teal-500/50 disabled:cursor-not-allowed"
                >
                    <i className={`fa-solid fa-sync ${isLoading ? 'animate-spin' : ''}`}></i>
                    {t('recommendations.refreshButton')}
                </button>
            </div>
             {renderContent()}
        </div>
    );
};