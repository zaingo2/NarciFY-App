import React, { useState, useRef, useEffect } from 'react';
import { generateMeditationScript, textToSpeech } from '../services/geminiService';
import { bufferToWav, applyEffectsToBuffer, createImpulseResponse } from '../utils/audio';
import { Spinner } from './Spinner';
import { useAuth } from '../contexts/AuthContext';
import { UpgradeTeaser } from './UpgradeTeaser';
import { useTranslation } from '../hooks/useTranslation';

type PlaybackState = 'idle' | 'generating' | 'playing' | 'paused' | 'ready' | 'error';
type MeditationKey = 'anxiety' | 'healing' | 'confidence' | 'cleanse' | 'morning';
type GeneratingType = 'none' | 'predefined' | 'custom';

interface PersonalizedAudiosProps {
    onUpgrade: () => void;
}

type BackgroundSoundKey = 'rain' | 'forest' | 'ocean' | 'birds';

export const PersonalizedAudios: React.FC<PersonalizedAudiosProps> = ({ onUpgrade }) => {
    const { status } = useAuth();
    const { t, language } = useTranslation();

    const BACKGROUND_SOUNDS: Record<BackgroundSoundKey, { name: string; icon: string; url: string; height: string; }> = {
        rain: { name: t('personalizedAudios.backgroundSounds.rain'), icon: 'fa-cloud-showers-heavy', url: 'https://earth.fm/embed/22866?theme=green&size=190', height: '190' },
        forest: { name: t('personalizedAudios.backgroundSounds.forest'), icon: 'fa-tree', url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/644503206&color=%23014e54&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true', height: '166' },
        ocean: { name: t('personalizedAudios.backgroundSounds.ocean'), icon: 'fa-water', url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A1169532079&color=%23cb9d67&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true', height: '166' },
        birds: { name: t('personalizedAudios.backgroundSounds.birds'), icon: 'fa-dove', url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A325844524&color=%231e291b&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true', height: '166' }
    };
    
    const MEDITATION_OPTIONS: Record<MeditationKey, string> = {
        anxiety: t('personalizedAudios.meditationOptions.anxiety'),
        healing: t('personalizedAudios.meditationOptions.healing'),
        confidence: t('personalizedAudios.meditationOptions.confidence'),
        cleanse: t('personalizedAudios.meditationOptions.cleanse'),
        morning: t('personalizedAudios.meditationOptions.morning'),
    };


    const [userName, setUserName] = useState('');
    const [selectedMeditation, setSelectedMeditation] = useState<MeditationKey>('anxiety');
    const [customPrompt, setCustomPrompt] = useState('');
    const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
    const [generatingType, setGeneratingType] = useState<GeneratingType>('none');
    const [selectedBackground, setSelectedBackground] = useState<BackgroundSoundKey>('rain');
    const [isLooping, setIsLooping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const voiceSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const pannerRef = useRef<PannerNode | null>(null);
    const voiceBufferRef = useRef<AudioBuffer | null>(null);
    const pannerIntervalRef = useRef<number | null>(null);
    const playbackStartTimeRef = useRef<number>(0);
    const convolverRef = useRef<ConvolverNode | null>(null);
    
    // Cleanup audio resources on component unmount
    useEffect(() => {
        return () => {
            if (pannerIntervalRef.current) clearInterval(pannerIntervalRef.current);
            audioContextRef.current?.close().catch(console.error);
        };
    }, []);

    const initAudioContext = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
             // The audio from Gemini TTS has a sample rate of 24000Hz. 
             // The playback AudioContext MUST match this sample rate to avoid errors.
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        // Ensure the context is running, as browsers may suspend it by default.
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const stopPlayback = () => {
        if (pannerIntervalRef.current) clearInterval(pannerIntervalRef.current);
        if (voiceSourceRef.current) {
            voiceSourceRef.current.onended = null; // Prevent onended from firing on manual stop
            voiceSourceRef.current.stop();
        }
        voiceSourceRef.current = null;
        setPlaybackState(voiceBufferRef.current ? 'ready' : 'idle');
    };
    
    const handleGenerateAndPlay = async (isCustom: boolean = false) => {
        if (!userName.trim()) {
            setError(t("personalizedAudios.errors.noName"));
            return;
        }
        if (isCustom && !customPrompt.trim()) {
            setError(t("personalizedAudios.errors.noCustomPrompt"));
            return;
        }

        stopPlayback(); // Stop any existing playback
        voiceBufferRef.current = null;
        setPlaybackState('generating');
        setGeneratingType(isCustom ? 'custom' : 'predefined');
        setError(null);
        
        try {
            let generationPrompt: string;
            
            if (isCustom) {
                generationPrompt = `Create a custom meditation for ${userName} about: "${customPrompt}".`;
            } else {
                // For predefined options, we use the localized title as the topic for generation.
                // This ensures the generated script is always in the user's language (handled by geminiService).
                const topic = MEDITATION_OPTIONS[selectedMeditation];
                generationPrompt = `Create a soothing, personalized meditation script for ${userName} focused on: "${topic}".`;
            }
            
            const script = await generateMeditationScript(generationPrompt, language);
            
            // Remove parenthetical instructions like (Pause for 30 seconds) to prevent TTS issues.
            const cleanScript = script.replace(/\([\s\S]*?\)/g, '');
            
            const voiceBuffer = await textToSpeech(cleanScript);
            voiceBufferRef.current = voiceBuffer;
            
            // After the long async call, re-initialize/resume the context
            // right before playing to handle browser auto-suspension.
            initAudioContext();
            const audioCtx = audioContextRef.current!;
            
            const voiceSource = audioCtx.createBufferSource();
            voiceSource.buffer = voiceBuffer;
            voiceSource.loop = isLooping;

            // Reverb (Wet) Path
            const wetGain = audioCtx.createGain();
            wetGain.gain.value = 0.35; // How much reverb
            if (!convolverRef.current || convolverRef.current.context !== audioCtx) {
                 const impulseBuffer = createImpulseResponse(audioCtx);
                 const newConvolver = audioCtx.createConvolver();
                 newConvolver.buffer = impulseBuffer;
                 convolverRef.current = newConvolver;
            }
            voiceSource.connect(wetGain).connect(convolverRef.current);

            // Dry Path
            const dryGain = audioCtx.createGain();
            dryGain.gain.value = 0.7; // How much original voice
            voiceSource.connect(dryGain);

            // Summing Bus (Merge dry and wet signals)
            const summingBus = audioCtx.createGain();
            dryGain.connect(summingBus);
            convolverRef.current.connect(summingBus);
            
            // 8D Panner
            const panner = audioCtx.createPanner();
            panner.panningModel = 'equalpower';
            summingBus.connect(panner).connect(audioCtx.destination);


            voiceSource.onended = () => {
                // This will only be called if loop is false and the sound ends, or if stop() is called.
                stopPlayback();
            };

            voiceSource.start();
            
            voiceSourceRef.current = voiceSource;
            pannerRef.current = panner;

            // --- PANNING LOGIC ---
            playbackStartTimeRef.current = audioCtx.currentTime;
            pannerIntervalRef.current = window.setInterval(() => {
                if (audioContextRef.current && pannerRef.current && audioContextRef.current.state === 'running') {
                    const elapsedTime = audioContextRef.current.currentTime - playbackStartTimeRef.current;
                    const HOLD_DURATION = 20, TRANSITION_DURATION = 5;
                    const SEGMENT_DURATION = HOLD_DURATION + TRANSITION_DURATION;
                    const CYCLE_DURATION = SEGMENT_DURATION * 4;
                    const timeInCycle = elapsedTime % CYCLE_DURATION;
                    let pan = 0;

                    if (timeInCycle < SEGMENT_DURATION) {
                        if (timeInCycle < HOLD_DURATION) pan = 0; else pan = -(timeInCycle - HOLD_DURATION) / TRANSITION_DURATION;
                    } else if (timeInCycle < SEGMENT_DURATION * 2) {
                        const t = timeInCycle - SEGMENT_DURATION;
                        if (t < HOLD_DURATION) pan = -1; else pan = -1 + (t - HOLD_DURATION) / TRANSITION_DURATION;
                    } else if (timeInCycle < SEGMENT_DURATION * 3) {
                        const t = timeInCycle - (SEGMENT_DURATION * 2);
                        if (t < HOLD_DURATION) pan = 0; else pan = (t - HOLD_DURATION) / TRANSITION_DURATION;
                    } else {
                        const t = timeInCycle - (SEGMENT_DURATION * 3);
                        if (t < HOLD_DURATION) pan = 1; else pan = 1 - (t - HOLD_DURATION) / TRANSITION_DURATION;
                    }
                    
                    pannerRef.current.positionX.setTargetAtTime(Math.max(-1, Math.min(1, pan)), audioContextRef.current.currentTime, 0.1);
                }
            }, 100);

            setPlaybackState('playing');

        } catch (err: any) {
            console.error("Audio Generation Error:", err);
            setError(err.message || t("personalizedAudios.errors.generationFailed"));
            setPlaybackState('error');
        } finally {
            setGeneratingType('none');
        }
    };
    
    const handlePlayPause = () => {
        if (!audioContextRef.current) return;
        
        if (audioContextRef.current.state === 'running') {
            audioContextRef.current.suspend();
            setPlaybackState('paused');
        } else if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
            setPlaybackState('playing');
        }
    };

    const toggleLoop = () => {
        const newLoopingState = !isLooping;
        setIsLooping(newLoopingState);
        if (voiceSourceRef.current) {
            voiceSourceRef.current.loop = newLoopingState;
        }
    };
    
    const handleDownload = async () => {
        if (!voiceBufferRef.current) {
            setError(t("personalizedAudios.errors.downloadGenerateFirst"));
            return;
        }
        setError(null);
        try {
            const bufferWithEffects = await applyEffectsToBuffer(voiceBufferRef.current);
            const wavBlob = bufferToWav(bufferWithEffects);
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NarciFY_Meditation.wav`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
        } catch (err) {
            console.error("Download error:", err);
            setError("Could not prepare audio for download.");
        }
    };
    
    if (status === 'free') {
        return (
            <UpgradeTeaser 
                title={t('upgrade.teaserAudiosTitle')}
                description={t('upgrade.teaserAudiosDesc')}
                onUpgrade={onUpgrade}
                icon="fa-heart"
            />
        );
    }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-slate-800 rounded-xl shadow-lg">
      <div className="flex justify-between items-start mb-2">
        <h1 className="text-3xl font-bold text-slate-50">{t('personalizedAudios.title')}</h1>
        <h2 className="text-xl font-bold text-slate-50">
          Narci<span className="text-teal-400">FY</span>
        </h2>
      </div>
      <p className="text-slate-300 mb-8">{t('personalizedAudios.description')}</p>
      
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-8">
        <h3 className="text-lg font-semibold text-teal-300 mb-3 flex items-center"><i className="fa-solid fa-circle-info mr-2"></i> {t('personalizedAudios.howToTitle')}</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-300">
          <li><span className="font-semibold">{t('personalizedAudios.howToStep1').split(': ')[0]}:</span> {t('personalizedAudios.howToStep1').split(': ')[1]}</li>
          <li><span className="font-semibold">{t('personalizedAudios.howToStep2').split(': ')[0]}:</span> {t('personalizedAudios.howToStep2').split(': ')[1]}</li>
          <li><span className="font-semibold">{t('personalizedAudios.howToStep3').split(': ')[0]}:</span> {t('personalizedAudios.howToStep3').split(': ')[1]}</li>
          <li><span className="font-semibold">{t('personalizedAudios.howToStep4').split(': ')[0]}:</span> {t('personalizedAudios.howToStep4').split(': ')[1]}</li>
        </ol>
      </div>

      {error && <div className="bg-rose-400/20 text-rose-300 p-3 rounded-md mb-4">{error}</div>}

      <div className="space-y-6">
        {/* --- Step 1: Personalization --- */}
        <div>
            <label htmlFor="userName" className="block text-sm font-medium text-slate-300 mb-2">
                {t('personalizedAudios.step1Label')}
            </label>
            <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder={t('personalizedAudios.step1Placeholder')}
                className="w-full p-3 bg-slate-900 border border-slate-700 text-slate-50 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition"
            />
        </div>
        
        {/* --- Step 2: Choose Background Sound --- */}
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('personalizedAudios.step2Label')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(Object.keys(BACKGROUND_SOUNDS) as BackgroundSoundKey[]).map((key) => {
                  const { name, icon } = BACKGROUND_SOUNDS[key];
                  return (
                    <button 
                        key={key}
                        onClick={() => setSelectedBackground(key)}
                        className={`p-3 rounded-lg text-center transition-colors ${selectedBackground === key ? 'bg-teal-500 text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        <i className={`fa ${icon} text-2xl mb-1`}></i>
                        <span className="block text-sm font-semibold">{name}</span>
                    </button>
                  )
                })}
            </div>
            <div className="mt-4">
                <iframe 
                    key={selectedBackground}
                    src={BACKGROUND_SOUNDS[selectedBackground].url}
                    width="100%"
                    height={BACKGROUND_SOUNDS[selectedBackground].height}
                    style={{ border: 'none', borderRadius: '8px' }}
                    frameBorder="no"
                    scrolling="no"
                    allow="autoplay; encrypted-media; clipboard-write;">
                </iframe>
            </div>
             <div className="mt-4 bg-violet-500/10 border border-violet-400 text-violet-200 p-3 rounded-lg text-center">
                <p className="text-sm">
                    <i className="fa-solid fa-headphones mr-2"></i>
                    {t('personalizedAudios.headphonesRecommended')}
                </p>
            </div>
        </div>
        
        {/* --- Step 3: Choose Meditation --- */}
        <div>
            <label htmlFor="meditationSelect" className="block text-sm font-medium text-slate-300 mb-2">
                {t('personalizedAudios.step3Label')}
            </label>
            <select
                id="meditationSelect"
                value={selectedMeditation}
                onChange={(e) => setSelectedMeditation(e.target.value as MeditationKey)}
                className="w-full p-3 bg-slate-900 border border-slate-700 text-slate-50 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition"
            >
                {(Object.keys(MEDITATION_OPTIONS) as MeditationKey[]).map((key) => (
                    <option key={key} value={key}>{MEDITATION_OPTIONS[key]}</option>
                ))}
            </select>
            <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                    onClick={() => handleGenerateAndPlay(false)}
                    disabled={playbackState === 'generating' || playbackState === 'playing'}
                    className="w-full sm:w-auto bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 disabled:bg-teal-500/50 transition-colors flex items-center justify-center"
                >
                    {playbackState === 'generating' && generatingType === 'predefined' ? <Spinner /> : <i className="fa-solid fa-play mr-2"></i>}
                    {playbackState === 'generating' && generatingType === 'predefined' ? t('personalizedAudios.generatingVoiceButton') : t('personalizedAudios.generateAndPlayButton')}
                </button>
                <div className="flex items-center gap-2">
                     <button onClick={handlePlayPause} disabled={!['playing', 'paused'].includes(playbackState)} className="bg-violet-500 text-white font-bold p-3 rounded-lg hover:bg-violet-600 disabled:bg-violet-500/50 transition-colors">
                        <i className={`fa-solid ${playbackState === 'playing' ? 'fa-pause' : 'fa-play'} w-5 h-5`}></i>
                    </button>
                    <button onClick={toggleLoop} disabled={playbackState === 'generating'} className={`font-bold p-3 rounded-lg transition-colors ${ isLooping ? 'bg-teal-500 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500' } disabled:bg-slate-600/50 disabled:text-slate-300/50`}>
                        <i className="fa-solid fa-repeat w-5 h-5"></i>
                    </button>
                     <button onClick={stopPlayback} disabled={!['playing', 'paused', 'ready'].includes(playbackState)} className="bg-rose-500 text-white font-bold p-3 rounded-lg hover:bg-rose-600 disabled:bg-rose-500/50 transition-colors">
                        <i className="fa-solid fa-stop w-5 h-5"></i>
                    </button>
                     <button onClick={handleDownload} disabled={!voiceBufferRef.current || playbackState === 'generating'} className="bg-sky-500 text-white font-bold p-3 rounded-lg hover:bg-sky-600 disabled:bg-sky-500/50 transition-colors">
                        <i className="fa-solid fa-download w-5 h-5"></i>
                    </button>
                </div>
            </div>
            {playbackState === 'generating' && generatingType === 'predefined' && (
                <p className="text-sm text-slate-400 mt-2 text-center">
                    {t('personalizedAudios.generatingMessage')}
                </p>
            )}
        </div>
        
        {/* --- Custom Request --- */}
        <div className="border-t border-slate-700 pt-6">
             <h3 className="text-xl font-bold text-slate-50">{t('personalizedAudios.customTitle')}</h3>
             <p className="text-slate-300 mb-4">
               {t('personalizedAudios.customDescription')}
             </p>
             <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 mb-4 text-sm text-slate-400">
                 <p><i className="fa-solid fa-lightbulb mr-2 text-yellow-300"></i><span className="font-semibold">{t('personalizedAudios.customExamplesTitle')}</span></p>
                 <ul className="list-disc list-inside ml-4 mt-1">
                     <li>{t('personalizedAudios.customExample1')}</li>
                     <li>{t('personalizedAudios.customExample2')}</li>
                     <li>{t('personalizedAudios.customExample3')}</li>
                 </ul>
             </div>
             <label htmlFor="customPrompt" className="block text-sm font-medium text-slate-300 mb-2">
                {t('personalizedAudios.customRequestLabel')}
            </label>
            <textarea
                id="customPrompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={t('personalizedAudios.customPlaceholder')}
                rows={3}
                className="w-full p-3 bg-slate-900 border border-slate-700 text-slate-50 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition"
            />
            <button 
                onClick={() => handleGenerateAndPlay(true)}
                disabled={playbackState === 'generating' || playbackState === 'playing'}
                className="mt-3 w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 disabled:bg-pink-500/50 transition-colors flex items-center justify-center"
            >
                {playbackState === 'generating' && generatingType === 'custom' ? <Spinner /> : t('personalizedAudios.generateCustomButton')}
            </button>
            {playbackState === 'generating' && generatingType === 'custom' && (
                <p className="text-sm text-slate-400 mt-2 text-center">
                    {t('personalizedAudios.generatingMessage')}
                </p>
            )}
        </div>
      </div>
    </div>
  );
};