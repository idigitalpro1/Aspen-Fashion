
export type City = 'Paris' | 'Milan' | 'London' | 'LA' | 'Aspen';
/* Updated ContentCategory to include specific names and remove generic ones */
export type ContentCategory = 
  | 'Vogue'
  | 'Elle'
  | 'GQ'
  | 'W'
  | 'Facebook'
  | 'Instagram'
  | 'TikTok'
  | 'Pinterest'
  | 'Fashion Feeds' 
  | 'You Got The Look' 
  | 'Spring / Summer' 
  | 'Fall / Winter' 
  | 'Runway Archives (10y)' 
  | 'Master Photographers' 
  | 'Print Media' 
  | 'Spring 2026 Collections' 
  | 'Heritage Runway';

export type Brand = 'Versace' | 'Hugo Boss' | 'Prada' | 'Armani' | 'Gucci' | 'Saint Laurent';
export type Magazine = 'VOGUE' | 'ELLE' | 'HARPER\'S' | 'GQ' | 'W' | 'VANITY FAIR';
export type SocialPlatform = 'Facebook' | 'TikTok' | 'Instagram' | 'Pinterest';
export type Season = 'Spring/Summer' | 'Fall/Winter' | 'Resort' | 'Pre-Fall';

export interface FashionItem {
  name: string;
  category: string;
  brandHint?: string;
  suggestedAcquisition: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface AnalysisResult {
  identifiedItems: FashionItem[];
  regionalTrends: Record<string, string>;
  agentVerdict: string;
}

export interface RunwayShow {
  id: string;
  brand: Brand;
  year: number;
  season: Season;
  youtubeId: string;
  description: string;
  heritageImpact: string;
}

export interface Photographer {
  name: string;
  era: 'The Icons' | 'Modern Visionaries' | 'Rising Stars';
  style: string;
}

export interface PaparazziShot {
  id: string;
  url: string;
  city: string; 
  timestamp: number;
  prompt: string;
  analysis?: AnalysisResult;
  groundingChunks?: GroundingChunk[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  assetUrl?: string;
}

export interface AgentPersona {
  id: string;
  name: string;
  style: string;
  role: string;
  avatarIcon: string;
  voiceName: string;
  bio: string;
}

export interface AppState {
  isKeySelected: boolean;
  activeCity: City;
  activeCategory: ContentCategory;
  activeBrand: Brand | null;
  activeMagazine: Magazine | null;
  activePlatform: SocialPlatform | null;
  isGenerating: boolean;
  isAnalyzing: boolean;
  shots: PaparazziShot[];
  selectedShotId: string | null;
  selectedPersonaId: string;
  savedAnalyses: PaparazziShot[];
  membershipPlan: 'Elite' | 'Lifetime' | 'Trial' | null;
}
