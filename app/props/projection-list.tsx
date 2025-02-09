'use client';

import { useState, useEffect } from 'react';
import { ProjectionDisplay } from './components/projection-display';
import { updateProjectionCache, getCachedProjections } from './api/projection-cache';
import { type ProjectionWithAttributes, type ApiResponse } from '@/types/props';

export function ProjectionList({ apiResponse }: { apiResponse: ApiResponse }) {
  const [projectionData, setProjectionData] = useState<ProjectionWithAttributes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processData() {
      try {
        setIsLoading(true);
        setError(null);

        let processedResponse: ApiResponse;
        if (apiResponse?.data) {
          // If we have new data, update the cache
          processedResponse = await updateProjectionCache(apiResponse);
        } else {
          // Try to load from cache if no new data
          const cached = await getCachedProjections();
          if (!cached) {
            setError('No projection data available');
            return;
          }
          processedResponse = cached;
        }

        processProjections(processedResponse);
      } catch (err) {
        console.error('Error processing projections:', err);
        setError('Failed to load projections');
      } finally {
        setIsLoading(false);
      }
    }

    processData();
  }, [apiResponse]);

  // Process the API response into projection data
  function processProjections(response: ApiResponse) {
    try {
      // Create player map
      const playerMap = new Map();
      const statsMap = new Map();
      
      // Process included data
      response.included?.forEach(item => {
        if (item.type === 'new_player') {
          playerMap.set(item.id, item);
        } else if (item.type === 'stat_average') {
          statsMap.set(item.id, item);
        }
      });

      // Process and filter projections
      const processedData = response.data
        .filter(projection => projection.attributes.odds_type === 'standard')
        .map(projection => {
          const playerId = projection.relationships.new_player?.data?.id;
          const player = playerId ? playerMap.get(playerId) : null;
          
          const statAverageId = projection.relationships.stat_average?.data?.id;
          const stats = statAverageId ? statsMap.get(statAverageId) : null;
          
          return {
            projection,
            player,
            stats
          };
        });

      // Sort by difference percentage
      const sortedData = processedData.sort((a, b) => {
        const getDiffPercentage = (item: ProjectionWithAttributes) => {
          if (!item.stats?.attributes?.average) return 0;
          const diff = item.projection.attributes.line_score - item.stats.attributes.average;
          return Math.abs(diff / item.stats.attributes.average * 100);
        };

        return getDiffPercentage(b) - getDiffPercentage(a);
      });

      setProjectionData(sortedData);
    } catch (err) {
      console.error('Error processing projections:', err);
      throw new Error('Failed to process projections');
    }
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600">Loading projections...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {projectionData && projectionData.length > 0 ? (
        <ProjectionDisplay
          projectionData={projectionData}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No projections available.</p>
        </div>
      )}
    </div>
  );
}
