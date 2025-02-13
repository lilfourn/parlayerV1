'use client';

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ApiResponse, ProjectionWithAttributes, NewPlayer, StatAverage } from '@/types/props';
import type { AnalysisResponse, ProcessedProjection } from '@/app/types/props';
import { RefreshCw, CheckSquare, Bell, ListPlus } from "lucide-react";
import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { ProjectionDisplay } from './projection-display';
import { ProjectionDialog } from '@/app/analyze/components/projection-dialog';
import { BatchAnalysisResults } from '@/app/analyze/components/batch-analysis-results';
import { analyzeBatchProjections } from '@/app/actions';
import { playNotificationSound } from '@/app/lib/notification-sound';

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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProjections, setSelectedProjections] = useState<Set<string>>(new Set());
  const [batchResults, setBatchResults] = useState<Array<{ analysis: AnalysisResponse; projection: ProcessedProjection; isError?: boolean }>>([]);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [currentStatType, setCurrentStatType] = useState<string | null>(null);

  const processProjections = useCallback((data: ApiResponse): ProjectionWithAttributes[] => {
    try {
      // Validate response structure
      if (!data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format: missing or invalid data array');
      }

      // Process projections with null checks and filter by odds_type
      const processedData = data.data
        .filter(projection => projection.attributes.odds_type === 'standard')
        .map(projection => {
          const player = data.included.find(
            item => item.type === 'new_player' && item.id === projection.relationships.new_player?.data?.id
          ) as NewPlayer | null;

          const stats = data.included.find(
            item => item.type === 'stat_average' && item.id === projection.relationships.stat_average?.data?.id
          ) as StatAverage | null;

          return {
            projection,
            player,
            stats,
            attributes: projection.attributes,
            relationships: projection.relationships
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

      return sortedData;
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

      const processedData = processProjections(result.data);
      setProjectionData(processedData);
      setLastRefreshed(new Date());
      
      toast.success("Projections Updated", {
        description: "Latest projections have been loaded.",
        duration: 2000,
      });
    } catch (err) {
      console.error('Error fetching projections:', err);
      setError('Failed to fetch projections');
      toast.error("Error", {
        description: "Failed to refresh projections. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, processProjections]);

  useEffect(() => {
    if (initialData) {
      const processedData = processProjections(initialData);
      setProjectionData(processedData);
    }
  }, [initialData, processProjections]);

  const toggleProjectionSelection = (projection: ProjectionWithAttributes) => {
    setSelectedProjections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projection.projection.id)) {
        newSet.delete(projection.projection.id);
      } else {
        newSet.add(projection.projection.id);
      }
      return newSet;
    });
  };

  const transformToProcessedProjection = (projection: ProjectionWithAttributes): ProcessedProjection => {
    const stats = projection.stats;
    const diff = stats?.attributes?.average
      ? ((projection.projection.attributes.line_score - stats.attributes.average) / stats.attributes.average) * 100
      : 0;

    return {
      id: projection.projection.id,
      attributes: projection.projection.attributes,
      stat_type: projection.projection.attributes.stat_type,
      line_score: projection.projection.attributes.line_score,
      projection: {
        id: projection.projection.id,
        type: projection.projection.type,
        attributes: {
          is_promo: Boolean(projection.projection.attributes.is_promo),
          is_live: Boolean(projection.projection.attributes.is_live),
          in_game: Boolean(projection.projection.attributes.in_game),
          hr_20: Boolean(projection.projection.attributes.hr_20),
          refundable: Boolean(projection.projection.attributes.refundable),
          tv_channel: projection.projection.attributes.tv_channel,
          description: projection.projection.attributes.description,
          status: projection.projection.attributes.status,
          line_score: projection.projection.attributes.line_score,
          start_time: projection.projection.attributes.start_time,
          stat_type: projection.projection.attributes.stat_type,
          stat_display_name: projection.projection.attributes.stat_display_name,
          game_id: projection.projection.attributes.game_id,
          updated_at: projection.projection.attributes.updated_at,
          odds_type: projection.projection.attributes.odds_type,
          line_movement: projection.projection.attributes.line_movement
        },
        relationships: projection.projection.relationships
      },
      player: projection.player,
      statAverage: stats,
      percentageDiff: diff
    };
  };

  const handleBatchAnalyze = async () => {
    if (selectedProjections.size === 0) {
      toast.error("Please select at least one projection to analyze.");
      return;
    }

    setIsBatchAnalyzing(true);
    setIsSelectionMode(false); // Exit selection mode
    
    // Show starting toast with loading state
    toast.promise(
      (async () => {
        const selectedData = projectionData.filter(p => selectedProjections.has(p.projection.id));

        try {
          // Transform all projections first
          const processedProjections = selectedData.map(projection => 
            transformToProcessedProjection(projection)
          );

          // Send all projections in a single API call
          const analyses = await analyzeBatchProjections(processedProjections);
          
          // Map the results back to their projections
          const results = analyses.map((analysis, index) => ({
            analysis,
            projection: processedProjections[index],
            isError: analysis.confidence === 0 && analysis.recommendation === 'neutral'
          }));

          setBatchResults(results);

          // Play notification sound
          await playNotificationSound({ 
            volume: 0.8  // Adjust volume as needed
          });

          return results;
        } catch (error) {
          console.error('Batch analysis failed:', error);
          throw error;
        }
      })(),
      {
        loading: 'Analyzing projections...',
        success: (results) => {
          // Show action toast separately after success
          toast(
            `Successfully analyzed ${results.length} projections`,
            {
              description: "Click 'View Results' to see the analysis details",
              icon: <Bell className="h-4 w-4 text-green-500" />,
              duration: 5000,
              action: {
                label: "View Results",
                onClick: () => {
                  const resultsElement = document.getElementById('batch-analysis-results');
                  if (resultsElement) {
                    resultsElement.scrollIntoView({ behavior: 'smooth' });
                  }
                },
              },
            }
          );
          
          // Return just the success message
          return `Completed ${results.length} analyses`;
        },
        error: "Failed to analyze projections. Please try again.",
        finally: () => {
          setIsBatchAnalyzing(false);
        }
      }
    );
  };

  const handleClearResults = useCallback(() => {
    setBatchResults([]);
    setSelectedProjections(new Set());
  }, []);

  const handleProjectionSelect = useCallback((projectionId: string) => {
    setSelectedProjections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectionId)) {
        newSet.delete(projectionId);
      } else {
        newSet.add(projectionId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allProjectionIds = batchResults
      .map(result => result.projection.id)
      .filter((id): id is string => id != null);
    setSelectedProjections(new Set(allProjectionIds));
  }, [batchResults]);

  const handleUnselectAll = useCallback(() => {
    setSelectedProjections(new Set());
  }, []);

  const handleSelectAllForCurrentStat = useCallback(() => {
    if (!currentStatType) return;
    
    const projectionsForStat = projectionData.filter(
      p => p.projection.attributes.stat_type === currentStatType
    );
    
    const projectionIds = projectionsForStat.map(p => p.projection.id);
    setSelectedProjections(new Set(projectionIds));
  }, [currentStatType, projectionData]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
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
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (!isSelectionMode) {
                setSelectedProjections(new Set());
                setBatchResults([]);
              }
            }}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            {isSelectionMode ? "Exit Selection" : "Select Multiple"}
          </Button>
          {isSelectionMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllForCurrentStat}
                disabled={!currentStatType}
              >
                <ListPlus className="h-4 w-4 mr-2" />
                Select All {currentStatType}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleBatchAnalyze}
                disabled={isBatchAnalyzing || selectedProjections.size === 0}
              >
                {isBatchAnalyzing ? "Analyzing..." : "Analyze Selected"}
              </Button>
            </>
          )}
        </div>
      </div>

      <ProjectionDisplay
        projectionData={projectionData}
        onProjectionSelect={(projection: ProjectionWithAttributes) => {
          if (isSelectionMode) {
            toggleProjectionSelection(projection);
          } else {
            setSelectedProjection(projection);
            setIsDialogOpen(true);
          }
        }}
        isSelectionMode={isSelectionMode}
        selectedProjections={selectedProjections}
        onStatTypeChange={(statType: string | null) => setCurrentStatType(statType)}
      />

      <ProjectionDialog 
        projection={selectedProjection ? transformToProcessedProjection(selectedProjection) : null}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
        }}
      />

      {batchResults.length > 0 && (
        <div 
          id="batch-analysis-results" 
          className="mt-8 scroll-mt-24" // Add padding for smooth scroll
        >
          <BatchAnalysisResults 
            results={batchResults}
            isAnalyzing={isBatchAnalyzing}
            onClearResults={handleClearResults}
          />
        </div>
      )}
    </div>
  );
}
