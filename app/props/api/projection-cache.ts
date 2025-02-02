import { ApiResponse, Projection } from '@/types/props';

// Extend the Projection type to include our cache-specific fields
interface CacheProjectionAttributes {
  adjusted_odds: number | null;
  board_time: string;
  custom_image: string | null;
  description: string;
  end_time: string | null;
  flash_sale_line_score: number | null;
  game_id: string;
  hr_20: boolean;
  in_game: boolean;
  is_live: boolean;
  is_promo: boolean;
  line_score: number;
  line_movement?: {
    original: number;
    current: number;
    direction: 'up' | 'down';
    difference: number;
  };
  odds_type: string;
  projection_type: string;
  rank: number;
  refundable: boolean;
  start_time: string;
  stat_display_name: string;
  stat_type: string;
  status: 'pre_game' | 'in_progress' | 'final' | string;
  tv_channel: string | null;
  updated_at: string;
}

interface CachedProjection extends Projection {
  originalLineScore: number;
  lastUpdated: number;
}

interface CacheEntry {
  data: CachedProjection[];
  included: ApiResponse['included'];
  lastFetchTime: number;
}

// 4 hours in milliseconds
const CACHE_EXPIRY = 4 * 60 * 60 * 1000;
const CACHE_KEY = 'PROPS_PROJECTION_CACHE';

// Load cache from localStorage
async function loadCache(): Promise<CacheEntry | null> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    console.log('Loading cache, current cached data:', cached ? 'Found' : 'Not found');
    
    if (!cached) return null;
    
    const parsedCache = JSON.parse(cached) as CacheEntry;
    console.log('Parsed cache contains', parsedCache.data.length, 'items');
    
    // Validate cache timestamp
    if (Date.now() - parsedCache.lastFetchTime > CACHE_EXPIRY) {
      console.log('Cache expired, clearing');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return parsedCache;
  } catch (error) {
    console.error('Error loading cache:', error);
    return null;
  }
}

// Save cache to localStorage
async function saveCache(cache: CacheEntry) {
  try {
    console.log('Saving cache with', cache.data.length, 'items');
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log('Cache saved successfully');
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

// Keep track of original line scores in memory for the current request
let requestCache: CacheEntry | null = null;

export async function clearExpiredProjections() {
  try {
    const cache = await loadCache();
    if (!cache) return;

    const now = Date.now();
    
    // Filter out projections that are more than 4 hours past their start time
    const filteredData = cache.data.filter(projection => {
      const startTime = new Date(projection.attributes.start_time).getTime();
      return (now - startTime) < CACHE_EXPIRY;
    });

    // If all projections are expired, clear the entire cache
    if (filteredData.length === 0) {
      localStorage.removeItem(CACHE_KEY);
      requestCache = null;
    } else {
      // Update cache with filtered data
      const updatedCache: CacheEntry = {
        ...cache,
        data: filteredData,
      };
      await saveCache(updatedCache);
      requestCache = updatedCache;
    }
  } catch (error) {
    console.error('Error clearing expired projections:', error);
  }
}

function createCachedProjection(projection: Projection, originalLineScore: number, now: number): CachedProjection {
  return {
    ...projection,
    originalLineScore,
    lastUpdated: now,
  };
}

// Helper function to compare projections and detect changes
function compareProjections(newProjection: Projection, cachedProjection: CachedProjection): {
  hasChanged: boolean;
  changes: {
    lineScore?: {
      from: number;
      to: number;
      timestamp: number;
    };
  };
} {
  const changes: {
    lineScore?: {
      from: number;
      to: number;
      timestamp: number;
    };
  } = {};
  
  let hasChanged = false;
  
  // Check for line score changes
  if (cachedProjection.attributes.line_score !== newProjection.attributes.line_score) {
    hasChanged = true;
    changes.lineScore = {
      from: cachedProjection.attributes.line_score,
      to: newProjection.attributes.line_score,
      timestamp: Date.now()
    };
  }
  
  return { hasChanged, changes };
}

export async function updateProjectionCache(newData: ApiResponse): Promise<ApiResponse> {
  try {
    const cache = await loadCache();
    const now = Date.now();

    console.log('Updating cache with new data containing', newData.data.length, 'items');
    
    if (cache) {
      console.log('Found existing cache with', cache.data.length, 'items');
      // Compare new data with cached data and track line movements
      newData.data = newData.data.map(projection => {
        const cachedProjection = cache.data.find(p => p.id === projection.id);
        
        if (cachedProjection) {
          const { hasChanged, changes } = compareProjections(projection, cachedProjection);
          
          if (hasChanged && changes.lineScore) {
            console.log('Line score changed for projection', projection.id, 'from', changes.lineScore.from, 'to', changes.lineScore.to);
            projection.attributes.line_movement = {
              original: changes.lineScore.from,
              current: changes.lineScore.to,
              direction: changes.lineScore.to > changes.lineScore.from ? 'up' : 'down',
              difference: Math.abs(changes.lineScore.to - changes.lineScore.from)
            };
          }
        }
        
        return projection;
      });
    }

    // Update cache with new data
    const updatedCache: CacheEntry = {
      data: newData.data.map(projection => ({
        ...projection,
        originalLineScore: projection.attributes.line_score,
        lastUpdated: now
      })),
      included: newData.included,
      lastFetchTime: now
    };

    await saveCache(updatedCache);
    requestCache = updatedCache;

    return newData;
  } catch (error) {
    console.error('Error updating cache:', error);
    throw error;
  }
}

// Get cached data
export async function getCachedProjections(): Promise<ApiResponse | null> {
  console.log('Getting cached projections');
  if (requestCache) {
    console.log('Found request cache with', requestCache.data.length, 'items');
    return requestCache;
  }
  
  await clearExpiredProjections();
  const cache = await loadCache();
  if (!cache) {
    console.log('No cache found');
    return null;
  }
  
  console.log('Loaded cache with', cache.data.length, 'items');
  requestCache = cache;
  return {
    data: cache.data,
    included: cache.included,
  };
}

// Clear the entire cache
export async function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    requestCache = null;
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
