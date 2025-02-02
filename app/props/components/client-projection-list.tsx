'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProjectionDisplay } from './projection-display';
import type { ProjectionWithAttributes, ApiResponse } from '@/types/props';

interface ClientProjectionListProps {
  initialData: ApiResponse;
  refreshInterval?: number;
}

export function ClientProjectionList({ initialData, refreshInterval = 30000 }: ClientProjectionListProps) {
  const [projectionData, setProjectionData] = useState<ProjectionWithAttributes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processProjections = useCallback((response: ApiResponse) => {
    try {
      // Create player map
      const playerMap = new Map();
      response.included
        .filter(item => item.type === 'new_player')
        .forEach(player => playerMap.set(player.id, player));

      // Process projections with their related data
      const processedData = response.data.map(projection => {
        const playerId = projection.relationships.new_player?.data?.id;
        const player = playerId ? playerMap.get(playerId) : undefined;
        
        return {
          projection,
          player: player || null,
          stats: null, // Add stats processing if needed
        };
      });

      setProjectionData(processedData);
    } catch (err) {
      console.error('Error processing projection data:', err);
      throw new Error('Failed to process projection data');
    }
  }, []);

  const fetchAndUpdateProjections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/projections');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch projections');
      }

      processProjections(result.data);
    } catch (err) {
      console.error('Error fetching projections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projections');
    } finally {
      setIsLoading(false);
    }
  }, [processProjections]);

  // Initial load using provided data
  useEffect(() => {
    if (initialData) {
      processProjections(initialData);
      setIsLoading(false);
    } else {
      fetchAndUpdateProjections();
    }
  }, [initialData, processProjections, fetchAndUpdateProjections]);

  // Set up refresh interval
  useEffect(() => {
    if (!refreshInterval) return;

    const intervalId = setInterval(fetchAndUpdateProjections, refreshInterval);
    return () => clearInterval(intervalId);
  }, [refreshInterval, fetchAndUpdateProjections]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
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
