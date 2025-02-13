'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProjectionWithAttributes, ApiResponse } from '@/types/props';
import { DifferenceCard } from './difference-card';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientDifferenceListProps {
  initialData: ApiResponse;
}

export function ClientDifferenceList({ initialData }: ClientDifferenceListProps) {
  const [projectionData, setProjectionData] = useState<ProjectionWithAttributes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [minDifference, setMinDifference] = useState<number>(15);
  const { toast } = useToast();

  const processProjections = useCallback((response: ApiResponse) => {
    try {
      const playerMap = new Map();
      const statsMap = new Map();
      const leagueMap = new Map();

      response.included
        .filter(item => item.type === 'new_player')
        .forEach(player => playerMap.set(player.id, player));

      response.included
        .filter(item => item.type === 'stat_average')
        .forEach(stat => statsMap.set(stat.id, stat));

      response.included
        .filter(item => item.type === 'league')
        .forEach(league => leagueMap.set(league.id, league));

      const processedData = response.data.map(projection => {
        const playerId = projection.relationships.new_player?.data?.id;
        const player = playerId ? playerMap.get(playerId) : null;
        
        const statAverageId = projection.relationships.stat_average?.data?.id;
        const stats = statAverageId ? statsMap.get(statAverageId) : null;
        
        const leagueId = projection.relationships.league?.data?.id;
        const league = leagueId ? leagueMap.get(leagueId) : null;
        
        return {
          projection: {
            ...projection,
            attributes: {
              ...projection.attributes,
              updated_at: projection.attributes.updated_at || new Date().toISOString(),
            },
            relationships: {
              ...projection.relationships,
              league: league ? { data: { type: 'league', id: league.id } } : undefined
            }
          },
          player,
          stats,
          percentageDiff: 0 // Will be calculated later
        } as ProjectionWithAttributes;
      });

      return processedData;
    } catch (err) {
      console.error('Error processing projections:', err);
      throw new Error('Failed to process projections data');
    }
  }, []);

  const fetchProjections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/projections');
      if (!response.ok) throw new Error('Failed to fetch projections');
      
      const data: ApiResponse = await response.json();
      const processed = processProjections(data);
      setProjectionData(processed);
      setLastRefreshed(new Date());
      
      toast({
        title: "Success",
        description: "Projections updated successfully",
      });
    } catch (err) {
      console.error('Error fetching projections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projections');
      toast({
        title: "Error",
        description: "Failed to fetch projections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [processProjections, toast]);

  useEffect(() => {
    const processed = processProjections(initialData);
    setProjectionData(processed);
  }, [initialData, processProjections]);

  const getLargestDifferences = useCallback((data: ProjectionWithAttributes[]) => {
    return data
      .map(item => {
        const stats = item.stats;
        const projection = item.projection;
        
        if (!stats?.attributes?.average || !projection?.attributes?.line_score) {
          return null;
        }
        
        const avgValue = stats.attributes.average;
        const lineScore = projection.attributes.line_score;
        const diff = ((lineScore - avgValue) / avgValue) * 100;
        const absDiff = Math.abs(diff);
        
        return {
          ...item,
          percentageDiff: diff,
          absDiff
        };
      })
      .filter((item): item is NonNullable<typeof item> => 
        item !== null && item.absDiff >= minDifference
      )
      .sort((a, b) => b.absDiff - a.absDiff);
  }, [minDifference]);

  const filteredProjections = getLargestDifferences(projectionData);

  return (
    <div className="space-y-4">
      {/* Controls Section */}
      <div className="bg-white/85 dark:bg-gray-900/75 border border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-md rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={fetchProjections} 
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
            <Label className="text-sm font-medium">Min Difference:</Label>
            <Select
              value={minDifference.toString()}
              onValueChange={(value) => setMinDifference(Number(value))}
            >
              <SelectTrigger className="w-[120px] bg-white/50 dark:bg-gray-800/50">
                <SelectValue placeholder="Select %" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 25, 30].map((value) => (
                  <SelectItem 
                    key={value} 
                    value={value.toString()}
                    className="cursor-pointer"
                  >
                    {value}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-destructive/15 text-destructive rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Differences Grid */}
      <div className="bg-white/85 dark:bg-gray-900/75 border border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-md rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjections.map((projection) => (
            <DifferenceCard 
              key={projection.projection.id} 
              projection={projection}
            />
          ))}
        </div>
        
        {filteredProjections.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No differences found matching the current criteria.
          </div>
        )}
      </div>
    </div>
  );
}
