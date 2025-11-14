
import React, { useState, useRef, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { textToSpeech } from '../services/geminiService';
import { bufferToWav } from '../utils/audio';
import { Spinner } from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

interface AnalysisResultDisplayProps {
  result: AnalysisResult;
}

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    icon: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, icon }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border-b border-slate-700">
            <h2>
                <button type="button" className="flex items-center justify-between w-full py-5 font-medium text-left text-slate-300" onClick={() => setIsOpen(!isOpen)}>
                    <span className="flex items-center text-lg">
                        <i className={`${icon} mr-3 text-pink-300 w-5 text-center`}></i>
                        {title}
                    </span>
                    <i className={`fa fa-chevron-down transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
                </button>
            </h2>
            <div className={`${isOpen ? 'block' : 'hidden'} py-5 border-t border-slate-700`}>
                <div className="prose prose-invert max-w-none text-slate-300">
                    {children}
                </div>
            </div>
        </div>
    );
};


export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ result }) => {
    type PlaybackState = 'idle' | 'generating' | 'playing' | 'paused' | 'ready' | 'error';
    const { t } = useTranslation();

    const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [audioError, setAudioError] = useState<string|null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const audioElRef = useRef<HTMLAudioElement>(null);
    
    // Cleanup object URL on unmount or when a new one is created
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    // Ensure the audio element preserves pitch
    useEffect(() => {
        if (audioElRef.current) {
            audioElRef.current.preservesPitch = true;
        }
    }, []);

    const handleGenerateAndPlay = async () => {
        if (audioElRef.current && audioUrl) {
            audioElRef.current.play();
            return;
        }

        setPlaybackState('generating');
        setAudioError(null);
        try {
            const fullText = `
                Analysis: ${result.isManipulationAnalysis}.
                Suggested Responses: ${result.suggestedResponses.join('. ')}.
                Helpful Tactics: ${result.neutralizingTactics.join('. ')}.
                Mini Lesson on ${result.miniLesson.title}: ${result.miniLesson.content}.
            `;
            const buffer = await textToSpeech(fullText);
            audioBufferRef.current = buffer; // Keep for download
            
            const wavBlob = bufferToWav(buffer);
            const newUrl = URL.createObjectURL(wavBlob);
            setAudioUrl(newUrl);
            // Autoplay is handled by the useEffect below
        } catch (error) {
            console.error('TTS Error:', error);
            setAudioError(t('analysisResultDisplay.errors.ttsFailed'));
            setPlaybackState('error');
        }
    };
    
    // Autoplay effect when audio URL is ready
    useEffect(() => {
        if (audioUrl && audioElRef.current) {
            audioElRef.current.playbackRate = playbackRate;
            audioElRef.current.play().catch(e => {
                console.error("Autoplay failed:", e);
                // If autoplay is blocked, set state to 'ready' for manual play
                setPlaybackState('ready');
            });
        }
    }, [audioUrl]);

    const handlePlay = () => {
        if (audioElRef.current) {
            audioElRef.current.play();
        }
    };

    const handlePause = () => {
        if (audioElRef.current) {
            audioElRef.current.pause();
        }
    };

    const handleStop = () => {
        if (audioElRef.current) {
            audioElRef.current.pause();
            audioElRef.current.currentTime = 0;
            setPlaybackState('ready');
        }
    };

    const handleToggleSpeed = () => {
        setPlaybackRate(prevRate => {
            const newRate = prevRate === 1 ? 1.5 : prevRate === 1.5 ? 2 : 1;
            if (audioElRef.current) {
                audioElRef.current.playbackRate = newRate;
            }
            return newRate;
        });
    };

    const handleDownload = () => {
        if (!audioBufferRef.current) {
            setAudioError(t('analysisResultDisplay.errors.downloadGenerateFirst'));
            return;
        }
        try {
            const wavBlob = bufferToWav(audioBufferRef.current);
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'NarciFY_Analysis.wav';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
        } catch (e) {
            console.error("Failed to create download link", e);
            setAudioError(t('analysisResultDisplay.errors.downloadFailed'));
        }
    };

  return (
    <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-50">{t('analysisResultDisplay.title')}</h3>
        
        {result.professionalHelpNeeded && (
            <div className="bg-rose-400/20 border-l-4 border-rose-400 text-rose-200 p-4 rounded-md" role="alert">
                <p className="font-bold">{t('analysisResultDisplay.seekHelpTitle')}</p>
                <p>{t('analysisResultDisplay.seekHelpText')}</p>
            </div>
        )}

        <audio
            ref={audioElRef}
            src={audioUrl ?? undefined}
            onPlay={() => setPlaybackState('playing')}
            onPause={() => {
                // onPause fires when audio ends or is paused.
                // onEnded handles the ended case, so we only set to paused if not ended.
                if (audioElRef.current && !audioElRef.current.ended) {
                    setPlaybackState('paused');
                }
            }}
            onEnded={() => setPlaybackState('ready')}
        />

        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
             <div className="flex flex-wrap items-center gap-3">
                {['idle', 'error'].includes(playbackState) && (
                    <button onClick={handleGenerateAndPlay} className="flex items-center justify-center gap-2 text-sm bg-violet-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-violet-600 transition-colors">
                        <i className="fa fa-volume-up"></i> {playbackState === 'idle' ? t('analysisResultDisplay.readAloudButton') : t('analysisResultDisplay.tryAgainButton')}
                    </button>
                )}

                {playbackState === 'generating' && (
                     <button disabled className="flex items-center justify-center gap-2 text-sm bg-violet-500/50 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed">
                        <Spinner/> {t('analysisResultDisplay.generatingButton')}
                    </button>
                )}

                {['playing', 'paused', 'ready'].includes(playbackState) && (
                    <>
                        <button onClick={playbackState === 'playing' ? handlePause : handlePlay} className="flex items-center justify-center gap-2 text-sm bg-violet-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-violet-600 transition-colors w-28">
                            <i className={`fa ${playbackState === 'playing' ? 'fa-pause' : 'fa-play'}`}></i>
                            {playbackState === 'playing' ? t('analysisResultDisplay.pauseButton') : (playbackState === 'paused' ? t('analysisResultDisplay.resumeButton') : t('analysisResultDisplay.playButton'))}
                        </button>
                        <button onClick={handleStop} disabled={!['playing', 'paused'].includes(playbackState)} className="flex items-center justify-center gap-2 text-sm bg-rose-400 text-white font-semibold py-2 px-4 rounded-lg hover:bg-rose-500 disabled:bg-rose-400/50 transition-colors">
                            <i className="fa fa-stop"></i> {t('analysisResultDisplay.stopButton')}
                        </button>
                        <button onClick={handleToggleSpeed} className="flex items-center justify-center text-sm bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors w-20">
                            {playbackRate}x
                        </button>
                        <button onClick={handleDownload} className="flex items-center justify-center gap-2 text-sm bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors">
                            <i className="fa fa-download"></i> {t('analysisResultDisplay.downloadButton')}
                        </button>
                    </>
                )}
            </div>
            {playbackState === 'generating' && (
                <p className="text-sm text-slate-300 mt-2">
                    {t('analysisResultDisplay.generatingMessage')}
                </p>
            )}
            {audioError && <p className="text-sm text-rose-400 mt-2">{audioError}</p>}
        </div>
      
        <div className="mt-4">
            <AccordionItem title={t('analysisResultDisplay.accordion.isManipulation')} icon="fa-solid fa-lightbulb">
                <p>{result.isManipulationAnalysis}</p>
            </AccordionItem>
            <AccordionItem title={t('analysisResultDisplay.accordion.suggestedResponses')} icon="fa-solid fa-comments">
                <ul className="list-disc pl-5 space-y-2">
                    {result.suggestedResponses.map((res, i) => <li key={i}>{res}</li>)}
                </ul>
            </AccordionItem>
            <AccordionItem title={t('analysisResultDisplay.accordion.neutralizingTactics')} icon="fa-solid fa-shield-halved">
                <ul className="list-disc pl-5 space-y-2">
                    {result.neutralizingTactics.map((tactic, i) => <li key={i}>{tactic}</li>)}
                </ul>
            </AccordionItem>
            <AccordionItem title={t('analysisResultDisplay.accordion.miniLesson', { title: result.miniLesson.title })} icon="fa-solid fa-book-open-reader">
                <p>{result.miniLesson.content}</p>
            </AccordionItem>
        </div>
    </div>
  );
};
