
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { AnalysisResult, LocalHelpResult, UserLocation, Recommendation } from '../types';
import { decode, decodeAudioData } from '../utils/audio';

const getAiClient = () => {
  // Use process.env.API_KEY as required by the execution environment and coding guidelines.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set. Please configure it in your hosting provider.");
  }
  return new GoogleGenAI({ apiKey });
};

// Schema for the analyzeSituation function
const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        isManipulationAnalysis: { type: Type.STRING, description: 'A detailed analysis of whether the situation involves manipulation, and why.' },
        identifiedTactics: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of specific manipulation tactics identified (e.g., Gaslighting, Blame-Shifting).' },
        suggestedResponses: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of concrete, constructive responses the user could say or do.' },
        neutralizingTactics: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of broader strategies to counteract the manipulation.' },
        miniLesson: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: 'A short, catchy title for a mini-lesson about the core issue.' },
                content: { type: Type.STRING, description: 'A brief, educational paragraph explaining the primary tactic or concept.' }
            },
            required: ['title', 'content'],
        },
        professionalHelpNeeded: { type: Type.BOOLEAN, description: 'A boolean indicating if the situation is severe enough to warrant professional help.' }
    },
    required: ['isManipulationAnalysis', 'identifiedTactics', 'suggestedResponses', 'neutralizingTactics', 'miniLesson', 'professionalHelpNeeded'],
};

export const analyzeSituation = async (situation: string): Promise<AnalysisResult> => {
    const ai = getAiClient();
    const prompt = `Analyze the following user-described situation for signs of emotional manipulation. Provide a structured analysis based on the provided JSON schema. The user is looking for help identifying red flags and getting guidance.

Situation: "${situation}"

Your analysis should be empathetic, clear, and empowering. Identify specific tactics, suggest actionable responses, and provide a small educational lesson. Also, assess if the situation is severe enough to recommend professional help.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
        },
    });

    const jsonString = response.text;
    const parsedResult = JSON.parse(jsonString);

    return {
        id: new Date().toISOString() + Math.random(),
        date: new Date().toISOString(),
        summary: situation.length > 50 ? situation.substring(0, 47) + '...' : situation,
        ...parsedResult
    };
};

const toBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
        const result = reader.result as string;
        // remove data:mime/type;base64, prefix
        resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
});


export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    const ai = getAiClient();
    const base64Audio = await toBase64(audioBlob);

    const audioPart = {
        inlineData: {
            mimeType: audioBlob.type,
            data: base64Audio
        },
    };

    const textPart = {
        text: 'Transcribe this audio recording. The user is describing a personal situation, so be accurate with the words spoken.'
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [audioPart, textPart] },
    });

    return response.text;
};

let audioContext: AudioContext;
const getAudioContext = () => {
    if (!audioContext || audioContext.state === 'closed') {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContext;
};

export const textToSpeech = async (text: string): Promise<AudioBuffer> => {
    const ai = getAiClient();
    const ttsPrompt = `Please read the following meditation script in a soft, calm, and gentle ASMR-like tone. Speak slowly and pause between sentences to create a relaxing experience.

Script: "${text}"`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: ttsPrompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from API.");
    }
    
    const audioBytes = decode(base64Audio);
    const ctx = getAudioContext();
    const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
    
    return audioBuffer;
};

export const generateMeditationScript = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const fullPrompt = `You are a compassionate and skilled meditation guide. Create a detailed and immersive meditation script of approximately 10-12 minutes in length (around 1200-1500 words) based on the following user request. The script should be structured as a complete mental journey with a clear beginning (grounding/breathing), middle (deep visualization/exploration), and end (affirmations/gentle return). Speak in a gentle, empowering tone.

User Request: "${prompt}"

Generate only the script text, without any introductory or concluding remarks like "Here is the script:".`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            temperature: 0.8, // A bit more creative for scripts
        },
    });

    return response.text;
};


export const findLocalHelp = async (location: UserLocation): Promise<LocalHelpResult[]> => {
    const ai = getAiClient();
    const prompt = "Find local mental health services, therapists specializing in relationship abuse, legal aid, and domestic violence support centers near the user's location. Provide a list of places.";

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
                retrievalConfig: {
                    latLng: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                    }
                }
            }
        },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const results: LocalHelpResult[] = [];
    
    for (const chunk of chunks) {
        if (chunk.maps && chunk.maps.uri && chunk.maps.title) {
            results.push({
                title: chunk.maps.title,
                uri: chunk.maps.uri,
            });
        }
    }
    
    if (results.length === 0) {
        // Fallback to a generic message if no specific places are found
        return [{ title: "No specific local resources found via Maps Grounding. Try a broader web search.", uri: `https://www.google.com/search?q=${encodeURIComponent(prompt)}` }];
    }

    return results;
};

// Schema for generateRecommendations
const recommendationsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, enum: ['Deep Dive', 'Skill Builder', 'Healing Path', 'Red Flag Spotlight'], description: 'The category of the recommendation.' },
            title: { type: Type.STRING, description: 'The catchy, helpful title of the recommendation card.' },
            content: { type: Type.STRING, description: 'The detailed, actionable content for the user. Written in a supportive and empowering tone.' },
            icon: { type: Type.STRING, description: 'A Font Awesome icon name (e.g., "fa-book-open", "fa-shield-halved", "fa-seedling", "fa-flag").' },
        },
        required: ['type', 'title', 'content', 'icon'],
    }
};

export const generateRecommendations = async (history: AnalysisResult[]): Promise<Recommendation[]> => {
    const ai = getAiClient();
    const tacticCounts: { [key: string]: number } = {};
    history.forEach(analysis => {
        analysis.identifiedTactics.forEach(tactic => {
            tacticCounts[tactic] = (tacticCounts[tactic] || 0) + 1;
        });
    });

    const sortedTactics = Object.entries(tacticCounts).sort(([, a], [, b]) => b - a);
    const topTactics = sortedTactics.slice(0, 3).map(t => t[0]).join(', ');

    if (!topTactics) {
        return []; // No tactics to analyze
    }

    const prompt = `
        You are a compassionate AI coach for NarciFY, an app that helps users in toxic relationships.
        Based on the user's most frequently encountered manipulation tactics, generate a set of 4 personalized, actionable recommendations.
        The user's top recurring tactics are: **${topTactics}**.

        Generate one recommendation for each of the following categories, tailored to these specific tactics:
        1.  **Deep Dive:** A deeper explanation of the primary tactic. Explain the psychology, long-term effects, and why it's used.
        2.  **Skill Builder:** A practical, step-by-step guide to developing a specific counter-skill (e.g., setting boundaries, assertive communication, reality checking).
        3.  **Healing Path:** A suggested activity for emotional healing (e.g., a journaling prompt, a mindfulness exercise, a small step to reconnect with their identity).
        4.  **Red Flag Spotlight:** A related, more subtle red flag to watch out for, helping the user expand their awareness.

        Your response must be empathetic, empowering, and structured according to the provided JSON schema.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: recommendationsSchema,
        },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString);
};
