
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { generateHealingImage } from '../services/geminiService';
import { Spinner } from './Spinner';

interface VisualizationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const VisualizationModal: React.FC<VisualizationModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState("9:16");

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const resultUrl = await generateHealingImage(prompt, aspectRatio);
            setImageUrl(resultUrl);
        } catch (err) {
            console.error(err);
            setError(t('visualization.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (imageUrl) {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'NarciFY-Power-Vision.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[95vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <i className="fa-solid fa-mountain-sun mr-3 text-fuchsia-400"></i>
                        {t('visualization.modalTitle')}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {!imageUrl ? (
                        <>
                            <p className="text-slate-300 mb-4 text-center">
                                {t('visualization.modalDescription')}
                            </p>
                            <div className="bg-slate-900 rounded-xl p-2 border border-slate-700 focus-within:ring-2 focus-within:ring-fuchsia-500 transition-all">
                                <textarea 
                                    className="w-full bg-transparent text-white p-3 outline-none resize-none h-32"
                                    placeholder={t('visualization.placeholder')}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            
                            {/* Aspect Ratio Selection */}
                            <div className="mt-6">
                                <p className="text-slate-400 text-sm mb-3 font-semibold uppercase tracking-wide">{t('visualization.selectAspectRatio')}</p>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    <button
                                        onClick={() => setAspectRatio("9:16")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${aspectRatio === "9:16" ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        <i className="fa-solid fa-mobile-screen"></i>
                                        {t('visualization.ratioPortrait')}
                                    </button>
                                    <button
                                        onClick={() => setAspectRatio("1:1")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${aspectRatio === "1:1" ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        <i className="fa-regular fa-square"></i>
                                        {t('visualization.ratioSquare')}
                                    </button>
                                    <button
                                        onClick={() => setAspectRatio("16:9")}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${aspectRatio === "16:9" ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        <i className="fa-solid fa-desktop"></i>
                                        {t('visualization.ratioLandscape')}
                                    </button>
                                </div>
                            </div>
                            
                            {error && <p className="text-rose-400 mt-3 text-sm text-center">{error}</p>}

                            <div className="mt-8 flex justify-center">
                                <button 
                                    onClick={handleGenerate}
                                    disabled={isLoading || !prompt.trim()}
                                    className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 disabled:opacity-50 transition-all transform hover:scale-105 flex items-center shadow-lg shadow-fuchsia-900/20"
                                >
                                    {isLoading ? <><Spinner /> <span className="ml-2">{t('visualization.generating')}</span></> : <><i className="fa-solid fa-wand-magic-sparkles mr-2"></i> {t('visualization.generateButton')}</>}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            {/* Image Container - adapt width based on aspect ratio */}
                            <div className={`relative rounded-xl overflow-hidden shadow-2xl border border-slate-700 mb-6 ${aspectRatio === '16:9' ? 'w-full' : aspectRatio === '1:1' ? 'w-full max-w-md' : 'w-full max-w-sm'}`}>
                                <img src={imageUrl} alt="Generated Art" className="w-full h-auto object-contain" />
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button 
                                    onClick={handleDownload}
                                    className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 transition-colors flex items-center shadow-lg"
                                >
                                    <i className="fa-solid fa-download mr-2"></i> {t('analysisResultDisplay.downloadButton')}
                                </button>
                                <button 
                                    onClick={() => setImageUrl(null)}
                                    className="bg-slate-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    {t('visualization.createNew')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
