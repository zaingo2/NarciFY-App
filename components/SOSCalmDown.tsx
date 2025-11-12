import React, { useState, useRef, useEffect, useCallback } from 'react';
import { textToSpeech } from '../services/geminiService';
import { Spinner } from './Spinner';
import { bufferToWav } from '../utils/audio';

const affirmations = [
    "This feeling is temporary and it will pass.",
    "I am safe and in control of my breath.",
    "I release the need to control things outside of myself.",
    "I am grounded in this present moment.",
    "With every exhale, I let go of tension.",
    "My mind is becoming calmer with each breath.",
    "I am allowed to feel this way, and I will be okay.",
    "I choose peace over this feeling of anxiety.",
    "I am resilient and I can handle this.",
    "I inhale calm and exhale worry.",
    "I am anchored in the here and now.",
    "I give myself permission to find stillness.",
    "This situation does not define my worth.",
    "I am strong enough to overcome this moment."
];

const getSessionAffirmations = () => {
    const shuffled = [...affirmations].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
};

const BREATH_CYCLE_DURATION = 14000; // 4s in, 2s hold, 8s out = 14s

type SessionState = 'idle' | 'generating' | 'playing' | 'paused' | 'error';

export const SOSCalmDown: React.FC = () => {
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [currentAffirmation, setCurrentAffirmation] = useState('Focus on the circle and breathe.');
    const [error, setError] = useState<string | null>(null);
    const [isBinauralOn, setIsBinauralOn] = useState(false);
    const [binauralVolume, setBinauralVolume] = useState(0.05);
    const [isLooping, setIsLooping] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioElRef = useRef<HTMLAudioElement | null>(null);
    const voiceBufferRef = useRef<AudioBuffer | null>(null);
    const binauralGainRef = useRef<GainNode | null>(null);
    const binauralOscLRef = useRef<OscillatorNode | null>(null);
    const binauralOscRRef = useRef<OscillatorNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const sessionAffirmationsRef = useRef<string[]>([]);
    
    const stopSession = useCallback((isComponentUnmounting = false) => {
        setSessionState('idle');
        setCurrentAffirmation('Focus on the circle and breathe.');

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (audioElRef.current) {
            audioElRef.current.pause();
            if (audioElRef.current.src) {
                audioElRef.current.removeAttribute('src');
            }
        }
        
        setAudioUrl(null); // This will trigger the URL cleanup effect
        voiceBufferRef.current = null;

        if (binauralOscLRef.current) try { binauralOscLRef.current.stop(); } catch(e) {/* ignore */}
        if (binauralOscRRef.current) try { binauralOscRRef.current.stop(); } catch(e) {/* ignore */}
        binauralOscLRef.current = null;
        binauralOscRRef.current = null;
        binauralGainRef.current = null;
        
        if (isComponentUnmounting) {
             if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(console.error);
            }
        }
    }, []);

    // Effect for revoking the object URL when it changes or on unmount
    useEffect(() => {
        const urlToClean = audioUrl;
        return () => {
            if (urlToClean) {
                URL.revokeObjectURL(urlToClean);
            }
        };
    }, [audioUrl]);

    // Effect for cleaning up resources ONLY on component unmount
    useEffect(() => {
        return () => {
            stopSession(true); // isComponentUnmounting = true
        };
    }, [stopSession]);


    const initAudioContext = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const affirmationLoop = useCallback(() => {
        if (audioElRef.current && voiceBufferRef.current && sessionAffirmationsRef.current.length > 0) {
            const { currentTime, duration } = audioElRef.current;
            if (duration > 0) {
                const affirmationDuration = duration / sessionAffirmationsRef.current.length;
                let index = Math.floor(currentTime / affirmationDuration);
                index = Math.min(index, sessionAffirmationsRef.current.length - 1);
                
                const newAffirmation = sessionAffirmationsRef.current[index];
                setCurrentAffirmation(prev => prev === newAffirmation ? prev : newAffirmation);
            }
        }
        animationFrameRef.current = requestAnimationFrame(affirmationLoop);
    }, []);

    const handleGenerateSession = async () => {
        stopSession(false);
        setSessionState('generating');
        setError(null);

        try {
            sessionAffirmationsRef.current = getSessionAffirmations();
            const script = `Read the following affirmations in a very calm, slow, and reassuring voice. Pause for a couple of seconds between each one. ${sessionAffirmationsRef.current.join('. ')}`;
            
            const buffer = await textToSpeech(script);
            voiceBufferRef.current = buffer;
            
            const wavBlob = bufferToWav(buffer);
            const newAudioUrl = URL.createObjectURL(wavBlob);
            setAudioUrl(newAudioUrl);
            
            initAudioContext();
            
        } catch (err: any) {
            console.error("SOS Audio Generation Error:", err);
            setError("Could not start the calming session. Please try again.");
            setSessionState('error');
        }
    };
    
    // This effect starts playback ONLY when a new audio URL is available.
    useEffect(() => {
        if (audioUrl && audioElRef.current) {
            audioElRef.current.src = audioUrl;
            const playPromise = audioElRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Ignore abort errors which are expected if the user stops the session.
                    if (error.name === 'AbortError') {
                        console.log('Audio playback aborted by user action.');
                    } else {
                        console.error("Audio play failed:", error);
                        setError("Could not start audio playback.");
                        setSessionState('error');
                    }
                });
            }
        }
    }, [audioUrl]);

    // This effect handles changes to loop state during playback
    useEffect(() => {
        if (audioElRef.current) {
            audioElRef.current.loop = isLooping;
        }
    }, [isLooping]);

    // This effect handles changes to playback rate during playback
    useEffect(() => {
        if (audioElRef.current) {
            audioElRef.current.playbackRate = playbackRate;
            audioElRef.current.preservesPitch = true;
        }
    }, [playbackRate]);


    const handlePlayPause = () => {
        if (!audioElRef.current) return;
        if (sessionState === 'playing') {
            audioElRef.current.pause();
        } else if (sessionState === 'paused') {
            audioElRef.current.play();
        }
    };

    const handleToggleBinaural = () => {
        const nextState = !isBinauralOn;
        setIsBinauralOn(nextState);

        initAudioContext();
        const audioCtx = audioContextRef.current!;

        if (nextState) {
            if (!binauralOscLRef.current) {
                 const baseFrequency = 432;
                const beatFrequency = 4;

                binauralGainRef.current = audioCtx.createGain();
                binauralGainRef.current.gain.value = 0; // Start muted
                binauralGainRef.current.connect(audioCtx.destination);
                
                const pannerL = audioCtx.createStereoPanner();
                pannerL.pan.value = -1;
                const pannerR = audioCtx.createStereoPanner();
                pannerR.pan.value = 1;
                
                binauralOscLRef.current = audioCtx.createOscillator();
                binauralOscLRef.current.type = 'sine';
                binauralOscLRef.current.frequency.setValueAtTime(baseFrequency, audioCtx.currentTime);
                binauralOscLRef.current.connect(pannerL).connect(binauralGainRef.current);
                
                binauralOscRRef.current = audioCtx.createOscillator();
                binauralOscRRef.current.type = 'sine';
                binauralOscRRef.current.frequency.setValueAtTime(baseFrequency + beatFrequency, audioCtx.currentTime);
                binauralOscRRef.current.connect(pannerR).connect(binauralGainRef.current);
                
                binauralOscLRef.current.start();
                binauralOscRRef.current.start();
            }
             binauralGainRef.current?.gain.setTargetAtTime(binauralVolume, audioCtx.currentTime, 0.2);

        } else {
            if (binauralGainRef.current) {
                binauralGainRef.current.gain.setTargetAtTime(0, audioCtx.currentTime, 0.2);
            }
        }
    };
    
    useEffect(() => {
        if (isBinauralOn && binauralGainRef.current && audioContextRef.current) {
            binauralGainRef.current.gain.setTargetAtTime(binauralVolume, audioContextRef.current.currentTime, 0.1);
        }
    }, [binauralVolume, isBinauralOn]);


    const handleToggleSpeed = () => {
        setPlaybackRate(prevRate => {
            const newRate = prevRate === 1 ? 1.5 : prevRate === 1.5 ? 2 : 1;
            return newRate;
        });
    };

    const handleToggleLoop = () => {
        setIsLooping(prev => !prev);
    };

    const isSessionActive = ['playing', 'paused'].includes(sessionState);

    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg text-center flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-2 text-slate-50 flex items-center">
                <i className="fa-solid fa-shield-heart mr-3 text-pink-300"></i>
                SOS Calm Down
            </h1>
            <p className="text-slate-300 mb-6 max-w-lg">
                Instant relief for when you're feeling overwhelmed. Focus on your breath and let these words guide you back to center.
            </p>
            
            <audio
                ref={audioElRef}
                onPlay={() => {
                    setSessionState('playing');
                    animationFrameRef.current = requestAnimationFrame(affirmationLoop);
                }}
                onPause={() => {
                    // Only set to paused if we are not in the process of stopping completely
                    if (sessionState === 'playing') {
                        setSessionState('paused');
                    }
                    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                }}
                onEnded={() => {
                    if (!isLooping) stopSession(false);
                }}
            />

            <div className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center relative shadow-2xl mb-6 overflow-hidden ${isSessionActive ? 'animated-gradient-bg' : 'bg-slate-900'}`}>
                <div className={`breathing-animation absolute inset-0 rounded-full bg-white/10 ${isSessionActive ? 'animate-breathe' : ''} ${sessionState === 'paused' ? 'paused' : ''}`} style={{ animationDuration: `${BREATH_CYCLE_DURATION}ms` }}></div>
                <div className="relative text-center text-slate-50">
                    <p className={`affirmation-text text-2xl font-bold transition-opacity duration-1000 ${isSessionActive ? 'animate-breathe-text' : ''} ${sessionState === 'paused' ? 'paused' : ''}`} style={{ animationDuration: `${BREATH_CYCLE_DURATION}ms` }}>
                        {/* Breathing instruction text goes here */}
                    </p>
                </div>
                 <style>{`
                    .animated-gradient-bg {
                        background-size: 300% 300%;
                        background-image: linear-gradient(-45deg, #8b5cf6, #ec4899, #22d3ee, #3b82f6);
                        animation: animateGradient 20s ease infinite;
                    }
                    @keyframes animateGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                    @keyframes breathe { 0% { transform: scale(0.8); opacity: 0.5; } 28% { transform: scale(1); opacity: 1; } 42% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.8); opacity: 0.5; } }
                    .animate-breathe { animation: breathe ease-in-out infinite; }
                    .paused { animation-play-state: paused; }
                    @keyframes breathe-text { 0% { content: 'Breathe In'; opacity: 1; } 25% { opacity: 1; } 30% { opacity: 0; } 30.01% { content: 'Hold'; opacity: 1; } 40% { opacity: 1; } 45% { opacity: 0; } 45.01% { content: 'Breathe Out'; opacity: 1; } 95% { opacity: 1; } 100% { opacity: 0; } }
                    .animate-breathe-text::before { content: 'Breathe In'; animation: breathe-text ease-in-out infinite; animation-duration: inherit; }
                `}</style>
            </div>
            
            <p className="text-xl text-teal-300 h-16 transition-all duration-500">{currentAffirmation}</p>

            {error && <div className="bg-rose-400/20 text-rose-300 p-3 rounded-md my-4">{error}</div>}
            
            <div className="mb-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700 max-w-md mx-auto w-full">
                <div className="flex items-center justify-between">
                    <label htmlFor="binaural-toggle" className="flex flex-col text-left">
                        <span className="font-semibold text-slate-200">Enable Binaural Tone</span>
                        <span className="text-sm text-slate-400">Creates a relaxing 432Hz hum.</span>
                    </label>
                    <button
                        id="binaural-toggle"
                        onClick={handleToggleBinaural}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isBinauralOn ? 'bg-teal-500' : 'bg-slate-700'}`}
                        aria-pressed={isBinauralOn}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isBinauralOn ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                 {isBinauralOn && (
                     <div className="mt-4">
                        <input
                            type="range"
                            min="0"
                            max="0.1"
                            step="0.005"
                            value={binauralVolume}
                            onChange={(e) => setBinauralVolume(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                            aria-label="Binaural tone volume"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>Quiet</span>
                            <span>Loud</span>
                        </div>
                        <p className="text-xs text-violet-300 mt-3 text-center"><i className="fa-solid fa-headphones mr-2"></i>Headphones are required for the binaural effect.</p>
                     </div>
                 )}
            </div>

            <div className="mt-2 flex flex-col items-center gap-4">
                {sessionState === 'idle' || sessionState === 'error' || sessionState === 'generating' ? (
                    <button onClick={handleGenerateSession} disabled={sessionState === 'generating'} className="bg-teal-500 text-white font-bold py-3 px-8 rounded-full hover:bg-teal-600 disabled:bg-teal-500/50 transition-colors flex items-center justify-center w-52">
                        {sessionState === 'generating' ? <Spinner /> : (sessionState === 'error' ? 'Try Again' : 'Start Session')}
                    </button>
                ) : null}

                {isSessionActive && (
                    <div className="flex items-center justify-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <button onClick={handlePlayPause} className="bg-violet-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-violet-600 transition-colors w-24">
                            <i className={`fa-solid ${sessionState === 'playing' ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                            {sessionState === 'playing' ? 'Pause' : 'Play'}
                        </button>
                        <button onClick={handleToggleSpeed} className="bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors w-20">
                            {playbackRate}x
                        </button>
                        <button onClick={handleToggleLoop} className={`font-bold p-2 rounded-lg transition-colors w-12 h-10 flex items-center justify-center text-lg ${isLooping ? 'bg-teal-500 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'}`} aria-pressed={isLooping}>
                            <i className="fa-solid fa-repeat"></i>
                        </button>
                         <button onClick={() => stopSession(false)} className="bg-rose-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-600 transition-colors">
                            <i className="fa-solid fa-stop mr-2"></i> Stop
                        </button>
                    </div>
                )}
            </div>
            {sessionState === 'generating' && ( <p className="text-sm text-slate-400 mt-2">Generating your calming audio, please wait...</p> )}

            <div className="mt-12 bg-slate-900/50 p-4 rounded-lg border border-slate-700 max-w-2xl">
                <h3 className="font-semibold text-slate-200">Why this works</h3>
                <p className="text-sm text-slate-400 mt-1">
                    Controlled breathing calms your nervous system, reducing the "fight-or-flight" response. Positive affirmations help interrupt cycles of anxious thoughts, reminding you of your strength and grounding you in the present moment.
                </p>
            </div>
        </div>
    );
};
