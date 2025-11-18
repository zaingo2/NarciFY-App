
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

const MEDITATION_SCRIPTS: Record<MeditationKey, string> = {
    anxiety: `
Welcome, [NAME]. Find a comfortable position, either sitting or lying down, and gently close your eyes.
Let's begin by bringing your awareness to your breath. Notice the gentle rise and fall of your chest and belly. Inhale slowly through your nose, filling your lungs completely... and exhale slowly through your mouth, releasing any tension you might be holding.
Take a few more deep, cleansing breaths at your own pace. With each exhale, feel your body becoming heavier, more relaxed, sinking deeper into the surface beneath you.
Now, bring your attention to your body. Start with your feet. Notice any sensations without judgment. Feel the ground beneath them, supporting you. Allow a wave of relaxation to flow up from your feet, through your ankles, into your calves and shins. Let go of all tightness.
This wave of calm continues up through your knees, your thighs, your hips... releasing, softening. Feel your stomach and chest relax. Let your shoulders drop away from your ears. Your arms become heavy and loose. Finally, soften the muscles in your neck, your jaw, and your face. Allow your entire body to be completely at ease.
As you rest in this stillness, you may notice thoughts arising in your mind. Worries about the past, anxieties about the future, endless loops of what-ifs. Acknowledge them without getting caught up in their stories.
Imagine you are sitting in a peaceful field on a beautiful day. The sky above you is vast and blue. Occasionally, a white, fluffy cloud drifts by. See each of your thoughts as one of these clouds. One thought appears... you notice it... and you watch as it gently floats across the sky and disappears over the horizon.
Another thought comes. Perhaps it's a persistent worry. Place it onto a cloud. Do not fight it. Do not analyze it. Simply observe it as it drifts away. You are the sky, vast and unchanging. The thoughts are merely clouds, temporary and passing.
There is no need to have a clear mind, only a willing heart to let the thoughts come and go. If you find yourself carried away by a cloud, gently and without judgment, return your focus to your breath. Your breath is your anchor to this present moment.
Feel the peace of this inner sky. The space between the clouds. This is your natural state. Calm, centered, and whole.
Stay with this image for a few moments, watching the clouds of your thoughts drift by, leaving behind the clear, peaceful blue of your awareness.
You have the power to choose not to engage with every thought. You can observe them from a distance, recognizing they are not you. They are just mental weather, passing through.
Let's affirm this newfound peace. Silently repeat after me:
I am calm and at peace.
I release all thoughts that do not serve me.
I am the observer of my mind.
My inner world is a place of serenity.
When you are ready, slowly begin to bring your awareness back to the room. Wiggle your fingers and toes. Gently stretch your arms and legs.
Take one final, deep breath in, filling yourself with this profound sense of calm. And as you exhale, slowly open your eyes, bringing this peace with you into the rest of your day. Welcome back, [NAME].
        `,
    healing: `
Hello, [NAME]. Let's begin a journey of gentle healing. Find a quiet space, close your eyes, and allow your body to settle.
Take a deep, loving breath in... and as you exhale, imagine you are releasing the weight of the day, allowing yourself to be fully present in this moment of self-care.
Imagine a warm, golden light forming above your head. It's filled with unconditional love, compassion, and healing energy. Feel its warmth. Now, allow this light to slowly enter the crown of your head, filling your entire being with a sense of safety and peace.
This light is your sacred space, a sanctuary within you where you are completely safe and loved.
Now, I want you to gently call to mind the part of you that is holding onto past pain. Perhaps you see a younger version of yourself, at a time when you were hurt. See this younger you with eyes of pure compassion. No judgment, no criticism, only love.
Notice how they feel. Scared? Alone? Misunderstood? Extend your hand to them. If it feels right, wrap them in a gentle, warm embrace. Let them know they are not alone anymore.
Silently, or in your heart, tell them what they needed to hear back then.
"I see your pain."
"You did the best you could."
"It wasn't your fault."
"You are worthy of love and respect."
"I am here for you now."
Feel the truth of these words resonate within you. Allow this younger you to absorb this love and validation.
Now, imagine that golden light surrounding both of you. It's like a gentle, flowing river. This river of light begins to wash over the old wounds, the painful memories. It doesn't erase them, but it cleanses them of their charge, their power over you.
See the pain, the anger, the sadness being gently carried away by the current, replaced by shimmering, golden light. Feel the spaces that once held pain now being filled with peace, acceptance, and self-love.
You are not defined by your past wounds. You are defined by your resilience, your capacity to heal, your courage to love yourself through it all. Your scars are a testament to your strength.
Let's honor that strength with these affirmations. Repeat them in your mind.
I forgive myself and I release the past.
I am whole and complete.
Every day, I become stronger and more resilient.
I am deserving of a future filled with peace and joy.
Spend a few moments basking in this golden light, feeling the integration of your past and present self, united in love and strength.
When you feel ready, slowly bring your awareness back to your physical body. Feel the support of the surface beneath you. Become aware of the sounds around you.
Take a deep breath in, drawing in this feeling of wholeness. Exhale, and gently open your eyes. Carry this healing energy with you, knowing that you can return to this sacred space whenever you need. You are a miracle of healing, [NAME].
        `,
    confidence: `
Welcome, [NAME]. Prepare to awaken the powerful, confident being that resides within you. Sit tall, close your eyes, and take a deep, empowering breath in, filling your lungs with potential... and exhale with a sigh, releasing any doubt or hesitation.
Bring your awareness to the core of your being, in the center of your chest. Imagine a small, warm spark of light glowing there. This is your inner strength, your personal power.
With each breath you take, see this spark growing brighter, stronger, warmer. Inhale, and the light expands. Exhale, and its glow intensifies. Feel it expanding to fill your entire chest, a radiant sun of self-assurance.
This light is your essence. It is your courage, your worth, your unique brilliance. Feel its energy vibrating through every cell of your body, pushing out shadows of self-criticism and fear.
Now, let's anchor this feeling in your body. Sit up a little straighter. Roll your shoulders back. Lift your chin slightly. Adopt the posture of a confident person. Feel how this small physical shift amplifies that inner light.
Bring to mind a time when you felt proud of yourself. A moment, big or small, when you overcame a challenge, achieved a goal, or acted with integrity. Re-live that moment now. What did you see? What did you hear? Most importantly, what did you feel? Let that feeling of success, of competence, of pride, wash over you and feed your inner sun.
You have done it before, and you can do it again. Your past successes are proof of your capabilities.
Now, imagine this radiant light from your chest is creating a protective shield of energy all around you. This shield is permeable to love and positivity, but it effortlessly repels negativity, doubt, and the unwarranted opinions of others. You are secure and centered in your own power.
Let's solidify this state with powerful truths. Repeat these affirmations silently, feeling their power.
I believe in myself and my abilities.
I am worthy of respect and happiness.
I embrace my unique talents and share them with the world.
I step into my power with grace and courage.
I am enough, exactly as I am.
Feel these truths settling deep into your being, becoming a part of you. You are a force of nature, [NAME]. Capable, resilient, and deserving of all good things.
Now, begin to bring this activated energy back into your awareness of the room. Know that this inner sun continues to shine brightly within you, whether you are consciously focused on it or not. It is your constant source of strength.
Take a final, deep breath, inhaling confidence... and exhale, ready to move through your day with purpose and self-assurance.
When you are ready, open your eyes. Go forward and shine, [NAME].
        `,
    cleanse: `
Greetings, [NAME]. Let us begin a cleansing ritual for your mind and spirit. Settle into a comfortable position, close your eyes, and take a deep breath in, imagining you are inhaling pure, clean air... and exhale fully, letting go of all that is stale and heavy.
Imagine you are standing at the edge of a lush, magical forest. Before you is a magnificent waterfall, cascading down mossy rocks into a crystal-clear pool. The sound of the water is powerful yet soothing.
This is a place of purification.
Step forward and feel the cool, gentle mist on your skin. When you are ready, step directly under the waterfall. The water is the perfect temperature, refreshing and invigorating.
Feel the pure, energized water flowing over the crown of your head. As it cascades down your body, it is washing away everything that no longer serves you.
Feel it washing away stress from your mind, clarifying your thoughts. Feel it rinsing away anxiety from your shoulders and neck. Feel it cleansing your heart of any lingering sadness or resentment.
With every passing moment, the water washes away heavy energies, mental clutter, and the emotional residue of difficult interactions. Imagine any dark, sticky energy dissolving and being carried away by the powerful flow, transformed into clean, neutral energy downstream.
You are being renewed, reset, and restored to your natural state of clarity and balance.
Now, step out from behind the waterfall and feel the warm sun on your skin, drying you instantly. You feel incredibly light, clean, and refreshed. Your personal energy field is bright, vibrant, and whole.
To protect this cleansed state, imagine a beautiful shield of shimmering, silvery light forming all around you, about an arm's length in every direction. This shield is your personal boundary. It allows love, kindness, and positive energy to flow in freely, while any negativity or unwanted energy simply bounces off, unable to penetrate.
You are sovereign in your own energy.
Let's seal this practice with affirmations for clarity and protection. Repeat them in your mind.
I release all that is not mine to carry.
My mind is clear and my spirit is light.
I am protected and grounded in my own energy.
I attract positive experiences and repel negativity.
Take a moment to simply be in this state of clean, protected, and vibrant energy. This is your true self.
Now, gently begin to bring your awareness back to your surroundings. The sound of the waterfall fades, but the feeling of clarity remains.
Take a deep, revitalizing breath in. As you exhale, slowly open your eyes. You have completed your energy cleanse, [NAME]. Move forward with a fresh perspective and a light heart.
        `,
    morning: `
Good morning, [NAME]. Welcome to a new day, filled with fresh potential. Before you begin your day, let's set a powerful and positive tone.
Find a comfortable seated position, with your back straight, and gently close your eyes.
Begin with a soft, gentle breath. Inhale the newness of the morning... and exhale any lingering grogginess from the night. With each breath, feel yourself becoming more awake, more present, more alive.
Place a hand over your heart and set an intention for your day. What quality do you wish to embody today? Perhaps it's patience, or joy, or productivity. Choose one word that resonates with you.
Hold this word in your heart. Let this be your guiding star for the day ahead.
Now, imagine the rising sun just outside your window. See its beautiful golden rays beginning to stream in. One of these rays of light finds its way directly to you, touching your forehead and filling your mind with clarity and positive thoughts.
Feel this sunlight travel down into your heart, filling it with warmth, compassion, and enthusiasm for the day. Feel it spreading into your arms and hands, preparing them to create and to help. Feel it flowing down into your legs and feet, grounding you and preparing you to walk your path with confidence.
Your entire body is now filled with the vibrant, optimistic energy of the morning sun.
Whatever today holds—challenges or triumphs—know that you have this inner light to guide you. You have the strength and resilience to navigate any situation with grace.
Let's affirm the potential of this day. Silently repeat after me:
Today is a new beginning, full of opportunity.
I greet this day with a positive mind and a grateful heart.
I am focused, energized, and ready to succeed.
I will meet any challenges with wisdom and grace.
I choose to create a day of joy and accomplishment.
Visualize your day unfolding with ease and flow. See yourself interacting with others with kindness. See yourself completing your tasks with focus. See yourself ending the day with a sense of satisfaction and peace.
This is your day to create.
Take one final, deep breath, inhaling all the promise of the morning. Exhale, releasing any final traces of doubt.
When you are ready, slowly open your eyes, bringing the light of your intention and the warmth of the sun with you. Go and have a wonderful day, [NAME].
        `
};


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
    
    const MEDITATION_OPTIONS = {
        anxiety: { title: t('personalizedAudios.meditationOptions.anxiety'), script: MEDITATION_SCRIPTS.anxiety },
        healing: { title: t('personalizedAudios.meditationOptions.healing'), script: MEDITATION_SCRIPTS.healing },
        confidence: { title: t('personalizedAudios.meditationOptions.confidence'), script: MEDITATION_SCRIPTS.confidence },
        cleanse: { title: t('personalizedAudios.meditationOptions.cleanse'), script: MEDITATION_SCRIPTS.cleanse },
        morning: { title: t('personalizedAudios.meditationOptions.morning'), script: MEDITATION_SCRIPTS.morning },
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
            let script: string;
            if (isCustom) {
                const generationPrompt = `Create a custom meditation for ${userName} about: "${customPrompt}"`;
                script = await generateMeditationScript(generationPrompt, language);
            } else {
                const option = MEDITATION_OPTIONS[selectedMeditation];
                script = option.script.replace(/\[NAME\]/g, userName);
            }
            
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
      <h1 className="text-3xl font-bold mb-2 text-slate-50">{t('personalizedAudios.title')}</h1>
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
                    <option key={key} value={key}>{MEDITATION_OPTIONS[key].title}</option>
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