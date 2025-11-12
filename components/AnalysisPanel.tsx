import React, { useState, useRef } from 'react';
import type { AnalysisResult } from '../types';
import { analyzeSituation, transcribeAudio } from '../services/geminiService';
import { AnalysisResultDisplay } from './AnalysisResultDisplay';
import { Spinner } from './Spinner';
import { AnalysisBanner } from './AnalysisBanner';
import { AudioBanner } from './AudioBanner';

interface AnalysisPanelProps {
  latestAnalysis: AnalysisResult | null;
  onNewAnalysis: (result: AnalysisResult) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

type InputMode = 'text' | 'audio';

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ latestAnalysis, onNewAnalysis, isLoading, setIsLoading }) => {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      setError('Please describe a situation.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeSituation(textInput);
      onNewAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
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
        setError("Microphone access was denied. Please enable it in your browser settings.");
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
          setError('Please record or upload some audio first.');
          return;
      }
      setIsLoading(true);
      setError(null);
      try {
          const transcription = await transcribeAudio(audioBlob);
          if(!transcription.trim()) {
            throw new Error("Audio could not be transcribed or was empty.");
          }
          setTextInput(transcription); 
          const result = await analyzeSituation(`A user recorded or uploaded the following: "${transcription}"`);
          onNewAnalysis(result);
      } catch (err: any) {
          setError(err.message || 'An unknown error occurred during transcription or analysis.');
      } finally {
          setIsLoading(false);
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > 20 * 1024 * 1024) { // 20MB limit
            setError('File size exceeds 20MB limit.');
            return;
        }
        if (!file.type.startsWith('audio/')) {
            setError('Invalid file type. Please upload an audio file.');
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
      <h2 className="text-2xl font-bold mb-4 text-slate-50 flex items-center">
        <i className="fa-solid fa-house mr-3 text-pink-300"></i>
        Home
      </h2>
      <p className="text-slate-300">Describe a situation, conversation, or behavior. Our AI will help you identify potential manipulation and offer guidance.</p>
      
      {inputMode === 'text' ? <AnalysisBanner /> : <AudioBanner />}

      <div className="mb-4 border-b border-slate-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button onClick={() => setInputMode('text')} className={`${inputMode === 'text' ? 'border-pink-300 text-pink-300' : 'border-transparent text-slate-300 hover:text-slate-50 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
            <i className="fa-solid fa-keyboard mr-2"></i> Text Input
          </button>
          <button onClick={() => setInputMode('audio')} className={`${inputMode === 'audio' ? 'border-pink-300 text-pink-300' : 'border-transparent text-slate-300 hover:text-slate-50 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}>
            <i className="fa-solid fa-microphone mr-2"></i> Audio Input
          </button>
        </nav>
      </div>

      {error && <div className="bg-rose-400/20 text-rose-300 p-3 rounded-md mb-4">{error}</div>}

      {inputMode === 'text' && (
        <div>
          <textarea
            className="w-full h-48 p-3 bg-slate-900 border border-slate-700 text-slate-50 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition"
            placeholder="e.g., 'They told me I was overreacting when I got upset about them canceling our plans last minute again...'"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button onClick={handleTextSubmit} disabled={isLoading} className="mt-4 w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 disabled:bg-teal-500/50 transition-colors flex items-center justify-center">
            {isLoading ? <Spinner /> : 'Analyze Text'}
          </button>
        </div>
      )}

      {inputMode === 'audio' && (
        <div className="text-center">
            <p className="text-slate-300 mb-4">Record your thoughts, a recent conversation, or upload an audio file.</p>
            
            {!isRecording && !audioBlob && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button onClick={startRecording} disabled={isLoading} className="bg-violet-500 text-white font-bold py-3 px-6 rounded-full hover:bg-violet-600 transition-colors flex items-center justify-center w-full sm:w-auto">
                        <i className="fa fa-microphone mr-2"></i> Record Audio
                    </button>
                    <span className="text-slate-300">OR</span>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="audio/*"
                    />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="bg-violet-500 text-white font-bold py-3 px-6 rounded-full hover:bg-violet-600 transition-colors flex items-center justify-center w-full sm:w-auto">
                        <i className="fa fa-upload mr-2"></i> Upload File
                    </button>
                </div>
            )}
            
            {isRecording && (
                <button onClick={stopRecording} className="bg-rose-400 text-white font-bold py-3 px-6 rounded-full hover:bg-rose-500 transition-colors flex items-center justify-center mx-auto animate-pulse">
                    <i className="fa fa-stop mr-2"></i> Stop Recording
                </button>
            )}

            {audioBlob && !isRecording && (
                 <div className="mt-4 border-t border-slate-700 pt-4">
                    <p className="text-teal-400 font-semibold mb-4">
                        {audioFileName ? `File ready: "${audioFileName}"` : 'Recording complete!'}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={handleAudioSubmit} disabled={isLoading} className="w-full sm:w-auto bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 disabled:bg-teal-500/50 transition-colors flex items-center justify-center">
                            {isLoading ? <Spinner/> : 'Transcribe & Analyze'}
                        </button>
                        <button onClick={clearAudio} disabled={isLoading} className="w-full sm:w-auto bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors">
                            Cancel
                        </button>
                    </div>
                 </div>
            )}
        </div>
      )}

      {isLoading && <div className="mt-6 text-center text-slate-300">Analyzing, please wait... This may take a moment for complex situations.</div>}
      
      {latestAnalysis && !isLoading && (
        <div className="mt-8">
            <AnalysisResultDisplay result={latestAnalysis} />
        </div>
      )}
    </div>
  );
};
