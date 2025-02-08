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
      
      response.included
        .filter(item => item.type === 'new_player')
        .forEach(player => playerMap.set(player.id, player));
        
      response.included
        .filter(item => item.type === 'stat_average')
        .forEach(stat => statsMap.set(stat.id, stat));

      // Process projections with their related data
      const processedData = response.data.map(projection => {
        const playerId = projection.relationships.new_player?.data?.id;
        const player = playerId ? playerMap.get(playerId) : undefined;
        const statAverageId = projection.relationships.stat_average?.data?.id;
        const stats = statAverageId ? statsMap.get(statAverageId) : undefined;
        
        return {
          projection,
          player: player || null,
          stats: stats || null,
        };
      });

      setProjectionData(processedData);
    } catch (err) {
      console.error('Error processing projection data:', err);
      throw new Error('Failed to process projection data');
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
