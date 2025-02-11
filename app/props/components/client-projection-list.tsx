'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { ApiResponse, ProjectionWithAttributes, ProcessedProjection, StatAverage } from '@/app/types/props';
import { RefreshCw } from "lucide-react";
import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { ProjectionDisplay } from './projection-display';
import { ProjectionDialog } from '@/app/analyze/components/projection-dialog';

interface ClientProjectionListProps {
  initialData: ApiResponse;
  onProjectionSelect?: (projection: ProjectionWithAttributes) => void;
  selectedProjectionId?: string;
}

export function ClientProjectionList({ 
  initialData, 
  onProjectionSelect,
  selectedProjectionId 
}: ClientProjectionListProps) {
  const [projectionData, setProjectionData] = useState<ProjectionWithAttributes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [selectedProjection, setSelectedProjection] = useState<ProjectionWithAttributes | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const processProjections = useCallback((response: ApiResponse) => {
    try {
      // Validate response structure
      if (!response || !Array.isArray(response.data)) {
        throw new Error('Invalid response format: missing or invalid data array');
      }

      // Create maps with proper type checking
      const playerMap = new Map();
      const statsMap = new Map();

      // Safely process included data if it exists
      if (Array.isArray(response.included)) {
        // Process players
        response.included
          .filter(item => item.type === 'new_player')
          .forEach(player => playerMap.set(player.id, player));

        // Process stat averages
        response.included
          .filter(item => item.type === 'stat_average')
          .forEach(stat => statsMap.set(stat.id, stat));
      } else {
        console.warn('No included data found in response');
      }

      // Process projections with null checks and filter by odds_type
      const processedData = response.data
        .filter(projection => projection.attributes.odds_type === 'standard')
        .map(projection => {
          const playerId = projection.relationships.new_player?.data?.id;
          const player = playerId ? playerMap.get(playerId) : undefined;
          
          const statAverageId = projection.relationships.stat_average?.data?.id;
          const stats = statAverageId ? statsMap.get(statAverageId) : undefined;
          
          return {
            projection: {
              ...projection,
              attributes: {
                ...projection.attributes,
                updated_at: projection.attributes.updated_at || new Date().toISOString(),
              }
            },
            player: player || null,
            stats: stats || null,
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
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error processing projection data:', err);
      throw new Error('Failed to process projection data');
    }
  }, []);

  const refreshProjections = useCallback(async () => {
    if (isLoading) return;

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
      
      toast({
        title: "Projections Updated",
        description: "Latest projections have been loaded.",
        duration: 2000,
      });
    } catch (err) {
      console.error('Error fetching projections:', err);
      setError('Failed to fetch projections');
      toast({
        title: "Error",
        description: "Failed to refresh projections. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, processProjections, toast]);

  const refreshControlsRef = useRef<ReturnType<typeof ReactDOM.createRoot> | null>(null);

  useEffect(() => {
    // Mount refresh controls
    const refreshContainer = document.getElementById('refresh-controls');
    if (refreshContainer && !refreshControlsRef.current) {
      refreshControlsRef.current = ReactDOM.createRoot(refreshContainer);
    }

    // Only render if we have a root
    if (refreshControlsRef.current) {
      const controls = (
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </div>
          <Button 
            onClick={refreshProjections} 
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      );
      refreshControlsRef.current.render(controls);
    }

    // Cleanup function
    return () => {
      // Only unmount if we're actually unmounting the component
      if (refreshControlsRef.current && !document.getElementById('refresh-controls')) {
        refreshControlsRef.current.unmount();
        refreshControlsRef.current = null;
      }
    };
  }, [isLoading, lastRefreshed, refreshProjections]);

  // Initial load
  useEffect(() => {
    processProjections(initialData);
  }, [initialData, processProjections]);

  function transformToProcessedProjection(projection: ProjectionWithAttributes): ProcessedProjection {
    const stats = projection.stats as StatAverage;
    const avgValue = stats?.attributes?.average ?? 0;
    const lineScore = projection.projection.attributes.line_score;
    const diff = avgValue ? ((lineScore - avgValue) / avgValue) * 100 : 0;

    return {
      projection: {
        ...projection.projection,
        type: 'projection',
        relationships: {
          ...projection.projection.relationships,
          new_player: {
            data: projection.projection.relationships.new_player?.data ?? null
          },
          stat_average: {
            data: projection.projection.relationships.stat_average?.data ?? null
          },
          league: projection.projection.relationships.league
        }
      },
      player: projection.player,
      statAverage: stats,
      percentageDiff: diff,
    };
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
      )}
      
      <ProjectionDisplay 
        projectionData={projectionData} 
        onProjectionSelect={(projection) => {
          setSelectedProjection(projection);
          setIsDialogOpen(true);
        }}
        selectedProjectionId={selectedProjection?.projection.id}
      />

      <ProjectionDialog 
        projection={selectedProjection ? transformToProcessedProjection(selectedProjection) : null}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedProjection(null);
        }}
      />
    </div>
  );
}
