export interface AnalysisResult {
  id: string;
  date: string;
  summary: string;
  isManipulationAnalysis: string;
  identifiedTactics: string[];
  suggestedResponses: string[];
  neutralizingTactics: string[];
  miniLesson: {
    title: string;
    content: string;
  };
  professionalHelpNeeded: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface UserLocation {
    latitude: number;
    longitude: number;
}

export interface LocalHelpResult {
    title: string;
    uri: string;
}

export interface Recommendation {
  type: 'Deep Dive' | 'Skill Builder' | 'Healing Path' | 'Red Flag Spotlight';
  title: string;
  content: string;
  icon: string;
}
