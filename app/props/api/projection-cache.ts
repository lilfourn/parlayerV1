import { ApiResponse, Projection } from '@/types/props';
import { kv } from '@vercel/kv';

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

// Load cache from Redis
async function loadCache(): Promise<CacheEntry | null> {
  try {
    const cached = await kv.get(CACHE_KEY);
    if (!cached) return null;
    
    const parsedCache = cached as CacheEntry;
    
    // Validate cache timestamp
    if (Date.now() - parsedCache.lastFetchTime > CACHE_EXPIRY) {
      await kv.del(CACHE_KEY);
      return null;
    }
    
    return parsedCache;
  } catch (error) {
    console.error('Error loading cache:', error);
    return null;
  }
}

// Save cache to Redis
async function saveCache(cache: CacheEntry) {
  try {
    await kv.set(CACHE_KEY, cache);
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
      await kv.del(CACHE_KEY);
      requestCache = null;
    } else {
      const newCache = { ...cache, data: filteredData };
      await saveCache(newCache);
      requestCache = newCache;
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

export async function updateProjectionCache(newData: ApiResponse): Promise<ApiResponse> {
  const now = Date.now();
  
  // First, clear any expired projections
  await clearExpiredProjections();
  
  try {
    const existingCache = await loadCache();
    
    if (!existingCache) {
      // First time caching, store original line scores
      const cachedData = newData.data.map(projection => 
        createCachedProjection(projection, projection.attributes.line_score, now)
      );
      
      const newCache = {
        data: cachedData,
        included: newData.included,
        lastFetchTime: now,
      };
      
      await saveCache(newCache);
      requestCache = newCache;
      return newData;
    }

    // Update existing projections and track line score changes
    const updatedData = newData.data.map(newProjection => {
      const cachedProjection = existingCache.data.find(p => p.id === newProjection.id);
      
      if (!cachedProjection) {
        // New projection, store its original line score
        const cachedData = createCachedProjection(newProjection, newProjection.attributes.line_score, now);
        existingCache.data.push(cachedData);
        return newProjection;
      }

      // Compare line scores and add trend information
      const currentLine = newProjection.attributes.line_score;
      const originalLine = cachedProjection.originalLineScore;
      
      if (currentLine !== originalLine) {
        // Add line movement information to the projection
        return {
          ...newProjection,
          attributes: {
            ...newProjection.attributes,
            line_movement: {
              original: originalLine,
              current: currentLine,
              direction: currentLine > originalLine ? 'up' : 'down',
              difference: currentLine - originalLine,
            },
          },
        };
      }

      return newProjection;
    });

    // Update the cache with new data
    const newCache = {
      data: updatedData.map(projection => {
        const originalLineScore = (existingCache.data.find(p => p.id === projection.id)?.originalLineScore) 
          ?? projection.attributes.line_score;
        return createCachedProjection(projection, originalLineScore, now);
      }),
      included: newData.included,
      lastFetchTime: now,
    };
    
    await saveCache(newCache);
    requestCache = newCache;

    return {
      ...newData,
      data: updatedData,
    };
  } catch (error) {
    console.error('Error updating projection cache:', error);
    return newData;
  }
}

// Get cached data
export async function getCachedProjections(): Promise<ApiResponse | null> {
  if (requestCache) return requestCache;
  
  await clearExpiredProjections();
  const cache = await loadCache();
  if (!cache) return null;
  
  requestCache = cache;
  return {
    data: cache.data,
    included: cache.included,
  };
}

// Clear the entire cache
export async function clearCache() {
  try {
    await kv.del(CACHE_KEY);
    requestCache = null;
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
