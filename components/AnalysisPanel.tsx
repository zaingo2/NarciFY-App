import React, { useState, useRef } from 'react';
import type { AnalysisResult } from '../types';
import { analyzeSituation, transcribeAudio } from '../services/geminiService';
import { AnalysisResultDisplay } from './AnalysisResultDisplay';
import { Spinner } from './Spinner';
import { AnalysisBanner } from './AnalysisBanner';
import { AudioBanner } from './AudioBanner';
import { TrialBanner } from './TrialBanner';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useUsage } from '../contexts/UsageContext';

interface AnalysisPanelProps {
  latestAnalysis: AnalysisResult | null;
  onNewAnalysis: (result: AnalysisResult) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onStartTrial: () => void;
  language: string;
}

type InputMode = 'text' | 'audio';

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ latestAnalysis, onNewAnalysis, isLoading, setIsLoading, onStartTrial, language }) => {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { status } = useAuth();
  const { consumeCredit } = useUsage();
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      setError(t('analysisPanel.errors.emptySituation'));
      return;
    }
    
    // Check Usage Limit
    if (!consumeCredit()) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeSituation(textInput, language);
      onNewAnalysis(result);
    } catch (err: any) {
      setError(err.message || t('analysisPanel.errors.unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    setAudioBlob(null);
    setAudioFileName(null);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };
        
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
            setAudioBlob(blob);
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setError(null);
    } catch (err) {
        setError(t('analysisPanel.errors.micDenied'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };
  
  const handleAudioSubmit = async () => {
      if (!audioBlob) {
          setError(t('analysisPanel.errors.noAudio'));
          return;
      }

      // Check Usage Limit
      if (!consumeCredit()) return;

      setIsLoading(true);
      setError(null);
      try {
          const transcription = await transcribeAudio(audioBlob);
          if(!transcription.trim()) {
            throw new Error(t('analysisPanel.errors.transcriptionFailed'));
          }
          setTextInput(transcription); 
          const result = await analyzeSituation(`A user recorded or uploaded the following: "${transcription}"`, language);
          onNewAnalysis(result);
      } catch (err: any) {
          setError(err.message || t('analysisPanel.errors.unknown'));
      } finally {
          setIsLoading(false);
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > 20 * 1024 * 1024) { // 20MB limit
            setError(t('analysisPanel.errors.fileTooLarge'));
            return;
        }
        if (!file.type.startsWith('audio/')) {
            setError(t('analysisPanel.errors.invalidFileType'));
            return;
        }
        
        setAudioBlob(file);
        setAudioFileName(file.name);
        setError(null);
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioFileName(null);
    setError(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }


  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-slate-50 flex items-center">
          <i className="fa-solid fa-house mr-3 text-pink-300"></i>
          {t('analysisPanel.title')}
        </h2>
        <h2 className="text-xl font-bold text-slate-50">
          Narci<span className="text-teal-400">FY</span>
        </h2>
      </div>
      <p className="text-slate-300 mb-6">{t('analysisPanel.description')}</p>
      
      {inputMode === 'text' ? <AnalysisBanner /> : <AudioBanner />}

      <div className="mb-4 border-b border-slate-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button onClick={() => setInputMode('text')} className={`${inputMode === 'text' ? 'border-pink-300 text-pink-300' : 'border-transparent text-slate-300 hover:text-slate-50 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
            <i className="fa-solid fa-keyboard mr-2"></i> {t('analysisPanel.textInputTab')}
          </button>
          <button onClick={() => setInputMode('audio')} className={`${inputMode === 'audio' ? 'border-pink-300 text-pink-300' : 'border-transparent text-slate-300 hover:text-slate-50 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
            <i className="fa-solid fa-microphone mr-2"></i> {t('analysisPanel.audioInputTab')}
          </button>
        </nav>
      </div>
      
      {error && <div className="bg-rose-400/20 text-rose-300 p-3 rounded-md mb-4">{error}</div>}


      {inputMode === 'text' && (
        <div>
          <textarea
            className="w-full h-48 p-3 bg-slate-900 border border-slate-700 text-slate-50 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition"
            placeholder={t('analysisPanel.textPlaceholder')}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isLoading}
          />
          <button onClick={handleTextSubmit} disabled={isLoading} className="mt-4 w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 disabled:bg-teal-500/50 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
            {isLoading ? <Spinner /> : t('analysisPanel.analyzeTextButton')}
          </button>
        </div>
      )}

      {inputMode === 'audio' && (
        <div className="text-center">
            <p className="text-slate-300 mb-4">{t('analysisPanel.audioDescription')}</p>
            
            {!isRecording && !audioBlob && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button onClick={startRecording} disabled={isLoading} className="bg-violet-500 text-white font-bold py-3 px-6 rounded-full hover:bg-violet-600 disabled:bg-violet-500/50 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-full sm:w-auto">
                        <i className="fa fa-microphone mr-2"></i> {t('analysisPanel.recordAudioButton')}
                    </button>
                    <span className="text-slate-300">OR</span>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="audio/*"
                        disabled={isLoading}
                    />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="bg-violet-500 text-white font-bold py-3 px-6 rounded-full hover:bg-violet-600 disabled:bg-violet-500/50 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-full sm:w-auto">
                        <i className="fa fa-upload mr-2"></i> {t('analysisPanel.uploadFileButton')}
                    </button>
                </div>
            )}
            
            {isRecording && (
                <button onClick={stopRecording} className="bg-rose-400 text-white font-bold py-3 px-6 rounded-full hover:bg-rose-500 transition-colors flex items-center justify-center mx-auto animate-pulse">
                    <i className="fa fa-stop mr-2"></i> {t('analysisPanel.stopRecordingButton')}
                </button>
            )}

            {audioBlob && !isRecording && (
                 <div className="mt-4 border-t border-slate-700 pt-4">
                    <p className="text-teal-400 font-semibold mb-4">
                        {audioFileName ? t('analysisPanel.fileReady', { fileName: audioFileName }) : t('analysisPanel.recordingComplete')}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={handleAudioSubmit} disabled={isLoading} className="w-full sm:w-auto bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 disabled:bg-teal-500/50 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                            {isLoading ? <Spinner/> : t('analysisPanel.transcribeAndAnalyzeButton')}
                        </button>
                        <button onClick={clearAudio} disabled={isLoading} className="w-full sm:w-auto bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors">
                            {t('analysisPanel.cancelButton')}
                        </button>
                    </div>
                 </div>
            )}
        </div>
      )}
      
      {status === 'free' && (
        <TrialBanner onStartTrial={onStartTrial} />
      )}

      {isLoading && <div className="mt-6 text-center text-slate-300">{t('analysisPanel.analyzingMessage')}</div>}
      
      {latestAnalysis && !isLoading && (
        <div className="mt-8">
            <AnalysisResultDisplay result={latestAnalysis} />
        </div>
      )}
    </div>
  );
};