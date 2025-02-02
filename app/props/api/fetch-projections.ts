import { ApiResponse } from '@/types/props';
import { updateProjectionCache, clearExpiredProjections } from './projection-cache';

const CACHE_DURATION = 60 * 1000; // 1 minute
let lastFetchTime = 0;

const USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0'
];

const getRandomUserAgent = () => {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, baseDelay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, i);
                console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${retries}`);
                await delay(waitTime);
                continue;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            const waitTime = baseDelay * Math.pow(2, i);
            console.log(`Request failed. Waiting ${waitTime}ms before retry ${i + 1}/${retries}`);
            await delay(waitTime);
        }
    }
    throw new Error('Max retries reached');
}

export async function fetchProjections() {
    const now = Date.now();
    
    // Clear expired projections (4 hours after start time)
    clearExpiredProjections();
    
    // Fetch new data if cache is expired
    if ((now - lastFetchTime) >= CACHE_DURATION) {
        const headers = {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://app.prizepicks.com/',
            'Origin': 'https://app.prizepicks.com',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };

        try {
            const response = await fetchWithRetry(
                'https://partner-api.prizepicks.com/projections?per_page=100&include=new_player,stat_average,league,team',
                { 
                    headers,
                    cache: 'no-store'
                }
            );
            
            const data: ApiResponse = await response.json();
            lastFetchTime = now;
            
            // Update cache and get data with line movement information
            return updateProjectionCache(data);
        } catch (error) {
            console.error('Failed to fetch projections:', error);
            throw error;
        }
    }
    
    // Return cached data with line movement information
    return updateProjectionCache({
        data: [],
        included: []
    });
}
