import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { UpgradeTeaser } from './UpgradeTeaser';
import { useTranslation } from '../hooks/useTranslation';

interface PatternDetectorProps {
    analysisHistory: AnalysisResult[];
    onDeleteAnalysis: (id: string) => void;
    onDeleteAll: () => void;
    onUpgrade: () => void;
}

const TACTIC_COLORS: { [key: string]: string } = {
    "Gaslighting": "bg-red-500",
    "Blame-Shifting": "bg-orange-500",
    "Silent Treatment": "bg-blue-500",
    "Stonalling": "bg-indigo-500",
    "Guilt-Tripping": "bg-yellow-500",
    "Isolation Tactic": "bg-purple-500",
    "Default": "bg-gray-500"
};

const getTacticColor = (tactic: string) => TACTIC_COLORS[tactic] || TACTIC_COLORS.Default;

// --- Download Logic ---

/**
 * Formats an array of analyses into a single human-readable string.
 */
const formatAnalysesAsText = (analyses: AnalysisResult[]): string => {
  return analyses.map(analysis => {
    const professionalHelpText = analysis.professionalHelpNeeded ? 'Yes' : 'No';
    return `
NarciFY Analysis Report
=========================

Date: ${new Date(analysis.date).toLocaleString()}
Summary: ${analysis.summary}

-------------------------
ANALYSIS: IS THIS MANIPULATION?
-------------------------
${analysis.isManipulationAnalysis}

-------------------------
IDENTIFIED TACTICS
-------------------------
${analysis.identifiedTactics.map(tactic => `- ${tactic}`).join('\n')}

-------------------------
SUGGESTED RESPONSES
-------------------------
${analysis.suggestedResponses.map(res => `- ${res}`).join('\n')}

-------------------------
NEUTRALIZING TACTICS
-------------------------
${analysis.neutralizingTactics.map(tactic => `- ${tactic}`).join('\n')}

-------------------------
MINI-LESSON: ${analysis.miniLesson.title}
-------------------------
${analysis.miniLesson.content}

-------------------------
PROFESSIONAL HELP RECOMMENDED?
-------------------------
${professionalHelpText}
`;
  }).join('\n\n\n#########################\n END OF ANALYSIS \n#########################\n\n\n');
};

/**
 * Triggers a browser download for a given text content.
 */
const triggerTextFileDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};


const AnalysisHistoryItem: React.FC<{ analysis: AnalysisResult, onDelete: (id: string) => void }> = ({ analysis, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t, language } = useTranslation();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language, {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };
    
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the accordion from opening/closing
        const textContent = formatAnalysesAsText([analysis]);
        triggerTextFileDownload(textContent, `NarciFY_Analysis_${analysis.date.split('T')[0]}.txt`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(analysis.id);
    };


    return (
        <div className="bg-slate-900 rounded-lg transition-all duration-300">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full text-left p-4 hover:bg-slate-700/50 rounded-lg"
                aria-expanded={isOpen}
            >
                <div className="flex justify-between items-center gap-4">
                    <p className="font-semibold text-teal-300 flex-1">{analysis.summary}</p>
                    <div className="flex items-center flex-shrink-0 gap-2 sm:gap-4">
                        <p className="text-sm text-slate-400 whitespace-nowrap hidden sm:block">{formatDate(analysis.date)}</p>
                        <button
                           onClick={handleDownload}
                           className="text-slate-400 hover:text-teal-300 p-2 -m-2 rounded-full"
                           aria-label={t('patternDetector.downloadOneTooltip')}
                           title={t('patternDetector.downloadOneTooltip')}
                        >
                           <i className="fa-solid fa-download"></i>
                        </button>
                        <button
                           onClick={handleDelete}
                           className="text-slate-400 hover:text-rose-400 p-2 -m-2 rounded-full"
                           aria-label={t('patternDetector.deleteOneTooltip')}
                           title={t('patternDetector.deleteOneTooltip')}
                        >
                           <i className="fa-solid fa-trash-can"></i>
                        </button>
                        <i className={`fa fa-chevron-down text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
                    </div>
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-700 prose prose-invert max-w-none text-slate-300">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {analysis.identifiedTactics.map(tactic => (
                            <span key={tactic} className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${getTacticColor(tactic)}`}>
                                {tactic}
                            </span>
                        ))}
                    </div>
                     <p className="text-sm text-slate-400 sm:hidden mb-4">{formatDate(analysis.date)}</p>
                    <h4 className="text-pink-300 font-bold">{t('analysisResultDisplay.accordion.isManipulation')}:</h4>
                    <p>{analysis.isManipulationAnalysis}</p>
                    <h4 className="text-pink-300 font-bold">{t('analysisResultDisplay.accordion.suggestedResponses')}:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        {analysis.suggestedResponses.map((res, i) => <li key={i}>{res}</li>)}
                    </ul>
                     <h4 className="text-pink-300 font-bold">{t('analysisResultDisplay.accordion.neutralizingTactics')}:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        {analysis.neutralizingTactics.map((tactic, i) => <li key={i}>{tactic}</li>)}
                    </ul>
                    <h4 className="text-pink-300 font-bold">{t('analysisResultDisplay.accordion.miniLesson', {title: analysis.miniLesson.title})}</h4>
                    <p>{analysis.miniLesson.content}</p>
                </div>
            )}
        </div>
    );
};


export const PatternDetector: React.FC<PatternDetectorProps> = ({ analysisHistory, onDeleteAnalysis, onDeleteAll, onUpgrade }) => {
    const { status } = useAuth();
    const { t } = useTranslation();

    const tacticCounts = React.useMemo(() => {
        const counts: { [key: string]: number } = {};
        const validHistory = analysisHistory.filter(a => !a.id.startsWith('placeholder-'));
        validHistory.forEach(analysis => {
            analysis.identifiedTactics.forEach(tactic => {
                counts[tactic] = (counts[tactic] || 0) + 1;
            });
        });
        return counts;
    }, [analysisHistory]);
    
    const sortedTactics = (Object.entries(tacticCounts) as [string, number][]).sort((a, b) => b[1] - a[1]);
    const maxCount = Math.max(...sortedTactics.map(([, count]) => count), 1);
    
    const isHistoryEmpty = analysisHistory.length === 0 || (analysisHistory.length > 0 && analysisHistory[0].id.startsWith('placeholder-'));

    const handleDownloadAll = () => {
        if (isHistoryEmpty) return;
        const textContent = formatAnalysesAsText(analysisHistory);
        triggerTextFileDownload(textContent, 'NarciFY_All_Analyses.txt');
    };
    
    if (status === 'free') {
        return (
            <UpgradeTeaser 
                title={t('upgrade.teaserPatternDetectorTitle')}
                description={t('upgrade.teaserPatternDetectorDesc')}
                onUpgrade={onUpgrade}
                icon="fa-magnifying-glass-chart"
            />
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-slate-50">{t('patternDetector.title')}</h1>
                <h2 className="text-xl font-bold text-slate-50">
                  Narci<span className="text-teal-400">FY</span>
                </h2>
            </div>
            <p className="text-slate-300 mb-8">{t('patternDetector.description')}</p>

            {isHistoryEmpty ? (
                <div className="text-center py-16 bg-slate-800 rounded-xl">
                    <i className="fa-solid fa-magnifying-glass-chart text-4xl text-slate-500 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-300">{t('patternDetector.noAnalysesTitle')}</h3>
                    <p className="text-slate-400">{t('patternDetector.noAnalysesText')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left side: History */}
                    <div className="xl:col-span-2 bg-slate-800 p-6 rounded-xl shadow-lg">
                        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{t('patternDetector.historyTitle')}</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownloadAll}
                                    className="bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2 text-sm"
                                    aria-label={t('patternDetector.downloadAllButton')}
                                    title={t('patternDetector.downloadAllButton')}
                                >
                                    <i className="fa-solid fa-cloud-arrow-down"></i>
                                    {t('patternDetector.downloadAllButton')}
                                </button>
                                <button
                                    onClick={onDeleteAll}
                                    className="bg-rose-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm"
                                    aria-label={t('patternDetector.deleteAllButton')}
                                    title={t('patternDetector.deleteAllButton')}
                                >
                                    <i className="fa-solid fa-trash-can"></i>
                                    {t('patternDetector.deleteAllButton')}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
                           {analysisHistory.map(analysis => (
                                <AnalysisHistoryItem key={analysis.id} analysis={analysis} onDelete={onDeleteAnalysis} />
                            ))}
                        </div>
                    </div>

                    {/* Right side: Summary */}
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg self-start">
                        <h2 className="text-xl font-bold mb-4">{t('patternDetector.patternsTitle')}</h2>
                        {sortedTactics.length > 0 ? (
                            <>
                                <div className="space-y-3 mb-6">
                                    {sortedTactics.map(([tactic, count]) => (
                                        <div key={tactic}>
                                            <div className="flex justify-between text-sm font-medium text-slate-300 mb-1">
                                                <span>{tactic}</span>
                                                <span>{t('patternDetector.patternsCount', { count })}</span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                                <div 
                                                    className={`${getTacticColor(tactic)} h-2.5 rounded-full`} 
                                                    style={{ width: `${(count / maxCount) * 100}%` }}>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 bg-violet-500/10 border border-violet-400 text-violet-200 p-4 rounded-lg">
                                    <p className="text-sm">
                                        <i className="fa-solid fa-lightbulb mr-2"></i>
                                        {t('patternDetector.patternsInsight')}
                                    </p>
                                </div>
                            </>
                        ) : (
                             <p className="text-slate-400 text-center py-8">{t('patternDetector.patternsEmpty')}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};