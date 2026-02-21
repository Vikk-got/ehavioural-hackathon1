export type AgeGroup = '15-25' | '26-35' | '36-45' | '46-55';
export type Gender = 'Male' | 'Female' | 'Unknown';
export type Emotion = 'Happy' | 'Angry' | 'Sad' | 'Surprise' | 'Disgust' | 'Fear' | 'Neutral';
export type Region = 'North India' | 'South India' | 'East India' | 'West India' | 'Other';
export type Language = 'Hindi' | 'English';
export type VideoMethod = 'Scraped' | 'Manual';

export interface VideoRecord {
  id: string;
  videoId: string;
  method: VideoMethod;
  language: Language;
  gender: Gender;
  ageGroup: AgeGroup;
  region: Region;
  emotion: Emotion;
  description: string;
  thumbnailUrl: string;
  title: string;
  duration: string;
  createdAt: string;
}

export interface FilterState {
  ageGroups: AgeGroup[];
  genders: Gender[];
  emotions: Emotion[];
  regions: Region[];
  languages: Language[];
}
