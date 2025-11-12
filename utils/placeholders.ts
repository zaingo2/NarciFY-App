import type { AnalysisResult } from '../types';

export const placeholderAnalysisHistory: AnalysisResult[] = [
    {
        id: 'placeholder-1',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        summary: 'They blamed me for being late.',
        isManipulationAnalysis: 'The situation described suggests a pattern of blame-shifting, a common tactic where an individual avoids taking responsibility for their actions by projecting it onto someone else. This can make you feel unfairly criticized and defensive.',
        identifiedTactics: ['Blame-Shifting', 'Gaslighting'],
        suggestedResponses: ["I understand you're frustrated, but I don't think it's fair to put all the blame on me.", "Let's focus on finding a solution instead of assigning blame."],
        neutralizingTactics: ['Use "I" statements to express your feelings without accusing.', 'Refuse to accept unfair blame calmly.'],
        miniLesson: {
            title: 'Understanding Blame-Shifting',
            content: 'Blame-shifting is a defense mechanism used to deflect responsibility. Recognizing it is the first step to not internalizing unfair criticism.'
        },
        professionalHelpNeeded: false,
    },
    {
        id: 'placeholder-2',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        summary: 'They ignored me after an argument.',
        isManipulationAnalysis: 'This behavior is known as the "silent treatment" or "stonewalling." It is a form of emotional punishment and control, designed to make you feel anxious and eager to resolve the conflict on their terms, often without addressing the actual issue.',
        identifiedTactics: ['Silent Treatment', 'Stonewalling'],
        suggestedResponses: ["I'm here to talk when you're ready.", "I feel hurt when you shut me out. I'd like to understand what's going on."],
        neutralizingTactics: ['Focus on your own well-being during this time.', "Don't repeatedly try to engage; it can reinforce the behavior."],
        miniLesson: {
            title: 'What is the Silent Treatment?',
            content: 'The silent treatment is a passive-aggressive form of emotional abuse where an individual refuses to communicate, effectively punishing and isolating the other person.'
        },
        professionalHelpNeeded: false,
    },
    {
        id: 'placeholder-3',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        summary: 'They made me feel guilty for wanting to see my friends.',
        isManipulationAnalysis: 'This is a classic example of guilt-tripping, a form of emotional manipulation. The person is making you feel responsible for their negative emotions to control your behavior and isolate you from your support system.',
        identifiedTactics: ['Guilt-Tripping', 'Isolation Tactic'],
        suggestedResponses: ["My friendships are important to me, just as your interests are to you.", "I'm sorry you feel that way, but I've already made plans."],
        neutralizingTactics: ['Set clear boundaries about your personal time.', 'Recognize that you are not responsible for others\' happiness.'],
        miniLesson: {
            title: 'Recognizing Guilt-Tripping',
            content: "Guilt-tripping happens when someone tries to control you by making you feel guilty. Healthy relationships involve mutual respect for each other's independence and social lives."
        },
        professionalHelpNeeded: true,
    },
     {
        id: 'placeholder-4',
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
        summary: 'They said I was remembering things wrong.',
        isManipulationAnalysis: "This is a key sign of gaslighting. By making you doubt your own memory and perception, the person aims to undermine your confidence and gain more control over you. It's a serious form of manipulation that can erode your sense of reality over time.",
        identifiedTactics: ['Gaslighting'],
        suggestedResponses: ["I am confident in what I remember.", "We seem to remember this differently. Let's not argue about the past."],
        neutralizingTactics: ['Keep a private journal to affirm your experiences.', 'Confide in a trusted friend to get an outside perspective.'],
        miniLesson: {
            title: 'What is Gaslighting?',
            content: "Gaslighting is a psychological manipulation tactic where a person tries to make someone question their own sanity, memory, or perception of reality. It's a severe form of emotional abuse."
        },
        professionalHelpNeeded: true,
    },
];
