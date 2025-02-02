import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { ApiResponse } from '@/types/props';

const CACHE_KEY = 'PROPS_PROJECTION_CACHE';
const CACHE_EXPIRY = 4 * 60 * 60 * 1000; // 4 hours
const API_URL = 'https://partner-api.prizepicks.com/projections?per_page=1000&include=new_player,stat_average,league';

async function loadCache(): Promise<ApiResponse | null> {
  try {
    const cached = await kv.get(CACHE_KEY);
    if (!cached) return null;

    const parsedCache = cached as { data: ApiResponse; timestamp: number };
    if (Date.now() - parsedCache.timestamp > CACHE_EXPIRY) {
      await kv.del(CACHE_KEY);
      return null;
    }

    return parsedCache.data;
  } catch (error) {
    console.error('Error loading cache:', error);
    return null;
  }
}

async function saveCache(data: ApiResponse) {
  try {
    await kv.set(CACHE_KEY, {
      data,
      timestamp: Date.now(),
    });
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
    await kv.del(CACHE_KEY);
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
