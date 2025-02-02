import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/props';

const CACHE_KEY = 'PROPS_PROJECTION_CACHE';
const CACHE_EXPIRY = 4 * 60 * 60 * 1000; // 4 hours
const API_URL = 'https://partner-api.prizepicks.com/projections?per_page=1000&include=new_player,stat_average,league';

// In-memory cache for server
let memoryCache: {
  data: ApiResponse;
  timestamp: number;
} | null = null;

async function loadCache(): Promise<ApiResponse | null> {
  try {
    if (!memoryCache) return null;

    if (Date.now() - memoryCache.timestamp > CACHE_EXPIRY) {
      memoryCache = null;
      return null;
    }

    return memoryCache.data;
  } catch (error) {
    console.error('Error loading cache:', error);
    return null;
  }
}

async function saveCache(data: ApiResponse) {
  try {
    memoryCache = {
      data,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

export async function GET() {
  try {
    // Try to get data from cache first
    const cachedData = await loadCache();
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
        message: 'Data retrieved from cache'
      }, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    // If no cache, fetch fresh data
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Save to cache
    await saveCache(data);

    return NextResponse.json({
      success: true,
      data: data,
      cached: false,
      message: 'Fresh data fetched successfully'
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to fetch projections data'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}

// Clear cache endpoint
export async function DELETE() {
  try {
    memoryCache = null;
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully'
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to clear cache'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  }
}
