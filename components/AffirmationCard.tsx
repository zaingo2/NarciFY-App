
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { generateAffirmation } from '../services/geminiService';
import { Spinner } from './Spinner';
import { useAuth } from '../contexts/AuthContext';

interface AffirmationCardProps {
    onUpgrade: () => void;
}

// Internal translation dictionary to avoid modifying large translation files 
// while ensuring quotes match the UI language immediately.
const QUOTES_BY_LANG: Record<string, string[]> = {
    en: [
        "You have power over your mind - not outside events. Realize this, and you will find strength.",
        "The best revenge is not to be like your enemy.",
        "Your worth is not defined by someone else's inability to see it.",
        "Healing is not linear. Be patient with yourself.",
        "Boundaries are the distance at which I can love you and me simultaneously.",
        "What you allow is what will continue."
    ],
    es: [
        "Tienes poder sobre tu mente, no sobre los eventos externos. Date cuenta de esto y encontrarás fuerza.",
        "La mejor venganza es no ser como tu enemigo.",
        "Tu valor no se define por la incapacidad de otros para verlo.",
        "Sanar no es lineal. Ten paciencia contigo mismo.",
        "Los límites son la distancia a la que puedo amarte a ti y a mí simultáneamente.",
        "Lo que permites es lo que continuará."
    ],
    pt: [
        "Você tem poder sobre sua mente - não sobre eventos externos. Perceba isso e encontrará força.",
        "A melhor vingança é não ser como o seu inimigo.",
        "O seu valor não é definido pela incapacidade de outra pessoa em vê-lo.",
        "A cura não é linear. Seja paciente consigo mesmo.",
        "Limites são a distância na qual posso amar você e a mim simultaneamente.",
        "O que você permite é o que continuará."
    ],
    de: [
        "Du hast Macht über deinen Geist – nicht über äußere Ereignisse. Erkenne dies, und du wirst Stärke finden.",
        "Die beste Rache ist, nicht wie dein Feind zu sein.",
        "Dein Wert wird nicht durch die Unfähigkeit anderer definiert, ihn zu sehen.",
        "Heilung verläuft nicht linear. Sei geduldig mit dir selbst.",
        "Grenzen sind der Abstand, in dem ich dich und mich gleichzeitig lieben kann.",
        "Was du zulässt, wird fortdauern."
    ],
    fr: [
        "Vous avez du pouvoir sur votre esprit - pas sur les événements extérieurs. Réalisez ceci, et vous trouverez la force.",
        "La meilleure vengeance est de ne pas ressembler à son ennemi.",
        "Votre valeur n'est pas définie par l'incapacité de quelqu'un d'autre à la voir.",
        "La guérison n'est pas linéaire. Soyez patient avec vous-même.",
        "Les limites sont la distance à laquelle je peux vous aimer et m'aimer simultanément.",
        "Ce que vous tolérez est ce qui continuera."
    ],
    ja: [
        "あなたは自分の心を支配する力を持っていますが、外の出来事はそうではありません。これに気づけば、強さを見つけるでしょう。",
        "最高の復讐は、敵のようにならないことです。",
        "あなたの価値は、他人がそれを見ることができないことによって定義されるものではありません。",
        "癒しは一直線ではありません。自分に忍耐強くいましょう。",
        "境界線とは、あなたと私を同時に愛することができる距離のことです。",
        "あなたが許すことは、これからも続くでしょう。"
    ]
};

const DAILY_LIMIT = 5;

export const AffirmationCard: React.FC<AffirmationCardProps> = ({ onUpgrade }) => {
    const { t, language } = useTranslation();
    const { status } = useAuth();
    const [quote, setQuote] = useState("");
    const [isInputMode, setIsInputMode] = useState(false);
    const [userMood, setUserMood] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [remainingGens, setRemainingGens] = useState(DAILY_LIMIT);

    // Load a random static quote based on current language
    useEffect(() => {
        // Fallback to English if language not found
        const langKey = QUOTES_BY_LANG[language] ? language : 'en';
        const quotes = QUOTES_BY_LANG[langKey];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
    }, [language]);

    // Check limit on mount
    useEffect(() => {
        checkDailyLimit();
    }, []);

    const checkDailyLimit = () => {
        try {
            const today = new Date().toDateString();
            const storedDate = localStorage.getItem('narciFy_affirmation_date');
            const storedCount = parseInt(localStorage.getItem('narciFy_affirmation_count') || '0');

            if (storedDate !== today) {
                // Reset for new day
                localStorage.setItem('narciFy_affirmation_date', today);
                localStorage.setItem('narciFy_affirmation_count', '0');
                setRemainingGens(DAILY_LIMIT);
            } else {
                setRemainingGens(Math.max(0, DAILY_LIMIT - storedCount));
            }
        } catch (e) {
            console.error("Storage error", e);
        }
    };

    const incrementUsage = () => {
        const currentCount = parseInt(localStorage.getItem('narciFy_affirmation_count') || '0');
        const newCount = currentCount + 1;
        localStorage.setItem('narciFy_affirmation_count', newCount.toString());
        setRemainingGens(Math.max(0, DAILY_LIMIT - newCount));
    };

    const handleButtonClick = () => {
        // 1. Check Premium Status
        if (status !== 'premium' && status !== 'trial') {
            onUpgrade();
            return;
        }

        // 2. Check Daily Limit
        if (remainingGens <= 0) {
            alert(t('upgrade.limitReached') || "You have reached your daily limit of 5 unique affirmations. Come back tomorrow!");
            return;
        }

        setIsInputMode(true);
    };

    const handleGenerate = async () => {
        if (!userMood.trim()) return;
        
        setIsLoading(true);
        try {
            // Calls the text-only API (Cheaper/Higher Quota than images)
            const newAffirmation = await generateAffirmation(userMood, language);
            setQuote(newAffirmation);
            setIsInputMode(false);
            setUserMood("");
            incrementUsage();
        } catch (error) {
            console.error("Failed to generate affirmation", error);
            // Fallback to a static one if API fails
            const langKey = QUOTES_BY_LANG[language] ? language : 'en';
            const quotes = QUOTES_BY_LANG[langKey];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            setQuote(randomQuote);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 p-6 rounded-xl shadow-lg mb-6 overflow-hidden min-h-[200px] flex flex-col justify-center items-center text-center group">
            {/* Decorative Background Elements (CSS Only - No Image Cost) */}
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_60%)] animate-[spin_20s_linear_infinite] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 w-full flex flex-col h-full justify-between min-h-[160px]">
                {/* Header */}
                <div className="flex justify-center items-center mb-2 opacity-80">
                    <span className="text-xs font-bold uppercase tracking-widest text-white"><i className="fa-solid fa-sparkles mr-1"></i> {t('affirmation.dailyMessage')}</span>
                </div>

                {/* Content Area */}
                {isInputMode ? (
                    <div className="animate-fade-in flex-1 flex flex-col justify-center">
                        <p className="text-white text-sm mb-2 font-medium">{t('affirmation.howDoYouFeel')}</p>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={userMood}
                                onChange={(e) => setUserMood(e.target.value)}
                                placeholder={t('affirmation.placeholder')}
                                className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:bg-white/30 transition-colors text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                autoFocus
                            />
                            <button 
                                onClick={handleGenerate} 
                                disabled={isLoading}
                                className="bg-white text-violet-600 rounded-lg px-3 py-2 font-bold hover:bg-white/90 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? <Spinner /> : <i className="fa-solid fa-arrow-right"></i>}
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsInputMode(false)}
                            className="text-white/60 text-xs mt-2 hover:text-white underline decoration-dotted"
                        >
                            {t('affirmation.cancel')}
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in flex-1 flex flex-col justify-center items-center">
                        <i className="fa-solid fa-quote-left text-white/20 text-xl mb-1 block self-start"></i>
                        <p className="text-xl md:text-2xl font-serif font-medium text-white leading-relaxed drop-shadow-md px-4">
                            "{quote}"
                        </p>
                        <i className="fa-solid fa-quote-right text-white/20 text-xl mt-1 block self-end"></i>
                    </div>
                )}

                {/* Footer Button */}
                {!isInputMode && (
                    <div className="mt-4 flex justify-end w-full">
                        <button 
                            onClick={handleButtonClick}
                            className={`flex items-center gap-2 text-xs font-bold py-1.5 px-3 rounded-full transition-all ${status === 'premium' || status === 'trial' ? 'bg-white/20 text-white hover:bg-white hover:text-violet-600' : 'bg-amber-400/20 text-amber-200 border border-amber-400/50 hover:bg-amber-400 hover:text-slate-900'}`}
                            title={t('affirmation.customizeTooltip')}
                        >
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            {status === 'premium' || status === 'trial' 
                                ? <span>{remainingGens}/5</span> 
                                : <i className="fa-solid fa-lock text-[10px]"></i>
                            }
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
