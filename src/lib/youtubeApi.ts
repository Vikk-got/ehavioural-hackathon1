import { VideoRecord, AgeGroup, Gender, Emotion, Region, Language } from '@/types/video';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';

interface YouTubeSearchParams {
  query?: string;
  language?: Language;
  maxResults?: number;
  regionCode?: string;
}

interface YouTubeSnippet {
  title: string;
  description: string;
  thumbnails: {
    medium?: { url: string };
    default?: { url: string };
  };
  publishedAt: string;
  channelTitle: string;
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: YouTubeSnippet;
}

interface YouTubeVideoItem {
  id: string;
  snippet: YouTubeSnippet;
  contentDetails: {
    duration: string;
  };
}

// Map region filter to search query terms
const regionQueryMap: Record<Region, string> = {
  'North India': 'Delhi UP Punjab Haryana',
  'South India': 'Chennai Bangalore Kerala Tamil Nadu',
  'East India': 'Kolkata Bihar Odisha Bengal',
  'West India': 'Mumbai Gujarat Rajasthan Maharashtra',
  'Other': 'India',
};

// Parse ISO 8601 duration to readable format
function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = match[1] ? `${match[1]}:` : '';
  const m = match[2] || '0';
  const s = match[3]?.padStart(2, '0') || '00';
  return `${h}${m}:${s}`;
}

// Get duration in seconds
function getDurationSeconds(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] || '0') * 3600) + (parseInt(match[2] || '0') * 60) + parseInt(match[3] || '0');
}

// Simple heuristic to guess gender from title/description
function guessGender(text: string): Gender {
  const lower = text.toLowerCase();
  const maleTerms = ['man', 'boy', 'male', 'he ', 'his ', 'bhai', 'sir', 'uncle', 'father', 'husband', 'son'];
  const femaleTerms = ['woman', 'girl', 'female', 'she ', 'her ', 'didi', 'ma\'am', 'aunt', 'mother', 'wife', 'daughter', 'bhabhi'];

  const maleScore = maleTerms.filter(t => lower.includes(t)).length;
  const femaleScore = femaleTerms.filter(t => lower.includes(t)).length;

  if (maleScore > femaleScore) return 'Male';
  if (femaleScore > maleScore) return 'Female';
  return 'Unknown';
}

// Heuristic emotion detection from text
function guessEmotion(text: string): Emotion {
  const lower = text.toLowerCase();
  const emotionKeywords: Record<Emotion, string[]> = {
    Happy: ['happy', 'joy', 'laugh', 'smile', 'fun', 'comedy', 'funny', 'celebrate', 'khushi', 'hasna', 'masti'],
    Angry: ['angry', 'rage', 'fight', 'gussa', 'argument', 'debate', 'shout', 'protest', 'controversy'],
    Sad: ['sad', 'cry', 'emotional', 'dukh', 'pain', 'loss', 'rona', 'heartbreak', 'tragedy'],
    Surprise: ['surprise', 'shock', 'amazing', 'unbelievable', 'wow', 'unexpected', 'hairaan'],
    Disgust: ['disgust', 'gross', 'worst', 'terrible', 'horrible', 'bakwas'],
    Fear: ['fear', 'scary', 'horror', 'danger', 'darr', 'afraid', 'panic', 'warning'],
    Neutral: ['review', 'tutorial', 'explain', 'how to', 'guide', 'information', 'news'],
  };

  let best: Emotion = 'Neutral';
  let bestScore = 0;
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = emotion as Emotion;
    }
  }
  return best;
}

// Heuristic age group from channel/content patterns
function guessAgeGroup(text: string): AgeGroup {
  const lower = text.toLowerCase();
  if (lower.includes('student') || lower.includes('college') || lower.includes('teen') || lower.includes('vlog')) return '15-25';
  if (lower.includes('uncle') || lower.includes('veteran') || lower.includes('senior') || lower.includes('retired')) return '46-55';
  if (lower.includes('professional') || lower.includes('corporate') || lower.includes('expert')) return '36-45';
  return '26-35';
}

// Guess region from text
function guessRegion(text: string): Region {
  const lower = text.toLowerCase();
  if (/delhi|punjab|haryana|up |lucknow|jaipur|chandigarh|rajasthan/.test(lower)) return 'North India';
  if (/chennai|bangalore|bengaluru|kerala|hyderabad|tamil|telugu|kannada|malayalam/.test(lower)) return 'South India';
  if (/kolkata|bihar|odisha|assam|bengal|jharkhand/.test(lower)) return 'East India';
  if (/mumbai|pune|gujarat|ahmedabad|marathi|maharashtra|goa/.test(lower)) return 'West India';
  return 'Other';
}

// Detect language from text
function guessLanguage(text: string): Language {
  // Check for Hindi characters (Devanagari)
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi';
  // Common Hindi transliteration words
  const hindiWords = ['hai', 'ka', 'ki', 'ke', 'se', 'ko', 'mein', 'kya', 'nahi', 'aur', 'yeh', 'woh', 'kaise'];
  const lower = text.toLowerCase();
  const hindiScore = hindiWords.filter(w => lower.includes(` ${w} `) || lower.startsWith(`${w} `) || lower.endsWith(` ${w}`)).length;
  return hindiScore >= 2 ? 'Hindi' : 'English';
}

// Generate behavioral description
function generateDescription(snippet: YouTubeSnippet, gender: Gender, ageGroup: AgeGroup, emotion: Emotion): string {
  const ageDesc = ageGroup === '15-25' ? 'young' : ageGroup === '26-35' ? 'adult' : ageGroup === '36-45' ? 'middle-aged' : 'older';
  const genderDesc = gender === 'Male' ? 'male' : gender === 'Female' ? 'female' : 'person';
  const emotionDesc = emotion.toLowerCase();

  return `The video likely shows a ${ageDesc} ${genderDesc} expressing ${emotionDesc} emotion. Content relates to "${snippet.title}". The speaker appears to be communicating in a ${emotionDesc === 'neutral' ? 'calm and measured' : emotionDesc === 'happy' ? 'cheerful and energetic' : emotionDesc === 'angry' ? 'intense and forceful' : emotionDesc === 'sad' ? 'subdued and emotional' : 'expressive'} manner. Published by ${snippet.channelTitle}.`;
}

export async function searchYouTubeVideos(params: YouTubeSearchParams): Promise<VideoRecord[]> {
  const { query = 'Indian speaker', language, maxResults = 15 } = params;

  // Build search query for Indian content
  let searchQuery = query;
  if (language === 'Hindi') searchQuery += ' Hindi';
  else if (language === 'English') searchQuery += ' English India';
  else searchQuery += ' India';

  // Step 1: Search for videos
  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: searchQuery,
    type: 'video',
    maxResults: String(maxResults),
    regionCode: 'IN',
    relevanceLanguage: language === 'Hindi' ? 'hi' : 'en',
key: API_KEY,
  });

  const searchResponse = await fetch(`${YOUTUBE_SEARCH_URL}?${searchParams}`);
  if (!searchResponse.ok) {
    const err = await searchResponse.json();
    throw new Error(err.error?.message || 'YouTube API error');
  }
  const searchData = await searchResponse.json();
  const searchItems: YouTubeSearchItem[] = searchData.items || [];

  if (searchItems.length === 0) return [];

  // Step 2: Get video details (duration)
  const videoIds = searchItems.map(item => item.id.videoId).join(',');
  const detailParams = new URLSearchParams({
    part: 'contentDetails,snippet',
    id: videoIds,
    key: API_KEY,
  });

  const detailResponse = await fetch(`${YOUTUBE_VIDEOS_URL}?${detailParams}`);
  if (!detailResponse.ok) {
    const err = await detailResponse.json();
    throw new Error(err.error?.message || 'YouTube API error');
  }
  const detailData = await detailResponse.json();
  const videoItems: YouTubeVideoItem[] = detailData.items || [];

  // Step 3: Map to VideoRecord with heuristic tagging
  return videoItems
    .filter(v => getDurationSeconds(v.contentDetails.duration) <= 60) // Keep short videos
    .map((video, index) => {
      const fullText = `${video.snippet.title} ${video.snippet.description}`;
      const gender = guessGender(fullText);
      const emotion = guessEmotion(fullText);
      const ageGroup = guessAgeGroup(fullText);
      const region = guessRegion(fullText);
      const lang = language || guessLanguage(fullText);

      return {
        id: String(index + 1),
        videoId: video.id,
        method: 'Scraped' as const,
        language: lang,
        gender,
        ageGroup,
        region,
        emotion,
        description: generateDescription(video.snippet, gender, ageGroup, emotion),
        thumbnailUrl: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url || '',
        title: video.snippet.title,
        duration: parseDuration(video.contentDetails.duration),
        createdAt: video.snippet.publishedAt.slice(0, 10),
      };
    });
}
