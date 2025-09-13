// Available content tags organized by categories
export const CONTENT_TAGS = {
  personal: [
    'acceptance', 'aging', 'ambition', 'aspirations', 'authenticity', 'behavior',
    'beliefs', 'boundaries', 'change', 'choices', 'confessions', 'contentment',
    'courage', 'death', 'desires', 'doubt', 'dreams', 'emotions', 'fear',
    'forgiveness', 'freedom', 'growth', 'habits', 'happiness', 'healing',
    'identity', 'independence', 'individuality', 'life', 'loneliness', 'loss',
    'meaning', 'mental_health', 'mistakes', 'morality', 'mortality', 'pain',
    'personal', 'personality', 'principles', 'purpose', 'quirks', 'regrets',
    'responsibility', 'secret', 'secrets', 'selfishness', 'vulnerability',
    'weakness', 'wisdom'
  ],

  social: [
    'attraction', 'betrayal', 'chemistry', 'communication', 'connection',
    'conflict', 'crowd', 'family', 'friendship', 'gender', 'generation',
    'groups', 'humanity', 'jealousy', 'justice', 'kindness', 'loyalty',
    'marriage', 'relationships', 'sharing', 'siblings', 'social', 'society',
    'trust', 'truth'
  ],

  entertainment: [
    'acting', 'actor', 'actors', 'actress', 'art', 'artistic', 'cinema',
    'classic', 'classical', 'comedy', 'composer', 'composers', 'dance',
    'directing', 'director', 'documentary', 'drama', 'entertainment',
    'fantasy', 'games', 'music', 'novels', 'painting', 'performance',
    'photography', 'poetry', 'pop', 'radio', 'rap', 'satire', 'shows',
    'singing', 'soundtracks', 'theater', 'television', 'tv', 'youtube'
  ],

  culture: [
    'ancient', 'architecture', 'culture', 'egypt', 'folklore', 'golden_age',
    'history', 'islam', 'legend', 'legends', 'literature', 'monuments',
    'nubian', 'religion', 'revolution', 'royalty', 'tradition', 'veterans'
  ],

  technology: [
    'ai', 'digital', 'instagram', 'notifications', 'passwords', 'phone',
    'privacy', 'social_media', 'surveillance', 'tech', 'technology'
  ],

  business: [
    'billionaire', 'business', 'career', 'commercial', 'corruption',
    'entrepreneurs', 'innovation', 'money', 'retail', 'spending', 'success',
    'telecom', 'work'
  ],

  sports: [
    'athletics', 'champion', 'champions', 'coaching', 'football', 'sports',
    'squash', 'swimming', 'tennis', 'world_champion'
  ],

  science: [
    'geology', 'medicine', 'nasa', 'nobel', 'science', 'space', 'surgery'
  ],

  lifestyle: [
    'cooking', 'daily', 'fashion', 'food', 'late_night', 'morning',
    'routine', 'shopping', 'sleep', 'style'
  ],

  abstract: [
    'calculation', 'combinations', 'complicated', 'consequences', 'control',
    'cost', 'dark', 'definition', 'delivery', 'design', 'differences',
    'dynamics', 'effort', 'equality', 'ethics', 'events', 'excuses',
    'exploitation', 'failure', 'fate', 'flexibility', 'forbidden', 'fun',
    'future', 'global', 'hidden', 'impact', 'impulse', 'impulses',
    'inheritance', 'intelligence', 'international', 'isolation', 'judgment',
    'karma', 'knowledge', 'learning', 'legacy', 'lessons', 'lies', 'limits',
    'luck', 'masks', 'media', 'modern', 'naivety', 'obligations', 'patterns',
    'peace', 'planning', 'preferences', 'pressure', 'pretense', 'privilege',
    'progress', 'quirky', 'reactions', 'reality', 'rebellion', 'regret',
    'resistance', 'rising', 'rivalry', 'roles', 'sacrifice', 'search',
    'silence', 'stalking', 'stigma', 'struggles', 'suppressed', 'suppression',
    'survival', 'system', 'time', 'timing', 'traits', 'unique', 'values',
    'verification'
  ]
};

// Flatten all tags for search/filter functionality
export const ALL_TAGS = Object.values(CONTENT_TAGS).flat().sort();

// Get category for a specific tag
export const getTagCategory = (tag: string): string | null => {
  for (const [category, tags] of Object.entries(CONTENT_TAGS)) {
    if (tags.includes(tag)) {
      return category;
    }
  }
  return null;
};

// Get popular/common tags
export const POPULAR_TAGS = [
  'social', 'personal', 'relationships', 'family', 'friendship', 'love',
  'career', 'success', 'happiness', 'growth', 'change', 'future',
  'entertainment', 'music', 'art', 'technology', 'games'
];