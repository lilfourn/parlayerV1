'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { isValidProcessedProjection } from '@/app/types/props';
import type { ProjectionWithAttributes, ApiResponse, Projection, StatAverage, NewPlayer, ProcessedProjection } from '@/app/types/props';
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronLeft, ChevronRight, TrendingUp, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PlayerAvatar } from "@/app/props/components/player-avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ProjectionDialog } from './projection-dialog';

interface DifferenceAnalysisProps {
  initialData: ApiResponse;
}

export function DifferenceAnalysis({ initialData }: DifferenceAnalysisProps) {
  const [projectionData, setProjectionData] = useState<ProcessedProjection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedProjection, setSelectedProjection] = useState<ProcessedProjection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const processProjections = useCallback((response: ApiResponse) => {
    try {
      const playerMap = new Map<string, NewPlayer>();
      const statsMap = new Map<string, StatAverage>();

      // Process players
      response.included
        .filter((item): item is NewPlayer => item.type === 'new_player')
        .forEach(player => playerMap.set(player.id, player));

      // Process stat averages
      response.included
        .filter((item): item is StatAverage => item.type === 'stat_average')
        .forEach(stat => statsMap.set(stat.id, stat));

      // Process projections with their related data
      const processedData = response.data
        .filter(projection => projection.attributes.odds_type === 'standard')
        .map(projection => {
          try {
            const playerId = projection.relationships.new_player?.data?.id;
            const player = playerId ? (playerMap.get(playerId) ?? null) : null;
            
            const statAverageId = projection.relationships.stat_average?.data?.id;
            const statAverage = statAverageId ? (statsMap.get(statAverageId) ?? null) : null;
            
            // Calculate percentage difference with safety checks
            const line = projection.attributes.line_score;
            const average = statAverage?.attributes.average ?? 0;
            const percentageDiff = average > 0 ? ((line - average) / average) * 100 : 0;

            // Create processed projection with required relationships
            const processedProjection: ProcessedProjection = {
              id: projection.id,
              projection: {
                id: projection.id,
                type: projection.type,
                attributes: {
                  is_promo: Boolean(projection.attributes.is_promo),
                  is_live: Boolean(projection.attributes.is_live),
                  in_game: Boolean(projection.attributes.in_game),
                  hr_20: Boolean(projection.attributes.hr_20),
                  refundable: Boolean(projection.attributes.refundable),
                  tv_channel: projection.attributes.tv_channel,
                  description: projection.attributes.description,
                  status: projection.attributes.status,
                  line_score: projection.attributes.line_score,
                  start_time: projection.attributes.start_time,
                  stat_type: projection.attributes.stat_type,
                  stat_display_name: projection.attributes.stat_display_name,
                  game_id: projection.attributes.game_id,
                  updated_at: projection.attributes.updated_at,
                  odds_type: projection.attributes.odds_type,
                  line_movement: projection.attributes.line_movement,
                },
                relationships: {
                  duration: projection.relationships.duration,
                  projection_type: projection.relationships.projection_type,
                  score: projection.relationships.score,
                  stat_type: projection.relationships.stat_type,
                  new_player: projection.relationships.new_player,
                  stat_average: projection.relationships.stat_average,
                  league: projection.relationships.league,
                },
              },
              player,
              statAverage,
              percentageDiff,
              stat_type: undefined,
              line_score: undefined,
              attributes: undefined
            };

            if (!isValidProcessedProjection(processedProjection)) {
              console.warn('Invalid projection data:', projection.id);
              return null;
            }

            return processedProjection;
          } catch (err) {
            console.warn('Error processing projection:', projection.id, err);
            return null;
          }
        })
        .filter((item): item is ProcessedProjection => item !== null)
        .sort((a, b) => Math.abs(b.percentageDiff) - Math.abs(a.percentageDiff));

      setProjectionData(processedData);
      setLastRefreshed(new Date());
      setError(null);
    } catch (error) {
      console.error('Error processing projections:', error);
      setError('Error processing projections data');
      toast({
        title: "Error",
        description: "Failed to process projections data",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchProjections = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projections', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projections');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch projections');
      }

      processProjections(result.data);
    } catch (error) {
      console.error('Error fetching projections:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast({
        title: "Error",
        description: "Failed to fetch projections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [processProjections, toast]);

  // Process initial data
  useEffect(() => {
    if (initialData) processProjections(initialData);
  }, [initialData, processProjections]);

  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil((projectionData?.length || 0) / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = projectionData?.slice(startIndex, endIndex) || [];

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls Section */}
      <div className="bg-white/85 dark:bg-gray-900/75 border border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-md rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProjections}
              disabled={isLoading}
              className={cn(
                "transition-all duration-200",
                isLoading && "opacity-50"
              )}
            >
              <RefreshCw className={cn(
                "h-4 w-4 mr-2",
                isLoading && "animate-spin"
              )} />
              Refresh
            </Button>
            <span className="text-sm text-muted-foreground">
              Last updated: {formatTime(lastRefreshed.toISOString())}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 per page</SelectItem>
                <SelectItem value="24">24 per page</SelectItem>
                <SelectItem value="48">48 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="bg-white/85 dark:bg-gray-900/75 border border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-md rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-slate-200/50 dark:hover:bg-gray-900/60">
                <TableHead className="w-[100px]">Player</TableHead>
                <TableHead>League</TableHead>
                <TableHead>Stat Type</TableHead>
                <TableHead className="text-right">Line</TableHead>
                <TableHead className="text-right">Average</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead className="text-right">Start Time</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-8 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : currentData.map((item) => (
                <React.Fragment key={item.projection.id}>
                  <TableRow 
                    className={cn(
                      "cursor-pointer hover:bg-slate-200/50 dark:hover:bg-gray-900/60 transition-colors",
                      expandedRows.has(item.projection.id) && "bg-amber-500/20"
                    )}
                    onClick={() => {
                      setSelectedProjection(item);
                      setIsDialogOpen(true);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <PlayerAvatar
                          imageUrl={item.player?.attributes.image_url || undefined}
                          name={item.player?.attributes.name || 'Unknown'}
                          size={32}
                        />
                        <span className="font-medium">
                          {item.player?.attributes.name || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-900/30">
                        {item.player?.attributes.league || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.projection.attributes.stat_display_name}</TableCell>
                    <TableCell className="text-right font-medium">
                      {item.projection.attributes.line_score}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.statAverage?.attributes.average.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant="default"
                        className={`
                          ${Math.abs(item.percentageDiff) >= 15
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                            : Math.abs(item.percentageDiff) >= 5
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                        `}
                      >
                        {item.percentageDiff > 0 ? '+' : ''}{item.percentageDiff.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatTime(item.projection.attributes.start_time)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(item.projection.id);
                        }}
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedRows.has(item.projection.id) && "transform rotate-180"
                          )}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(item.projection.id) && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0">
                        <div className="bg-gray-900/30 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Player Stats</h4>
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Games Played: {item.statAverage?.attributes.count || 'N/A'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Standard Deviation: {item.statAverage?.attributes.min_value?.toFixed(2) || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-2">Projection Details</h4>
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Game Time: {formatTime(item.projection.attributes.start_time)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Status: {item.projection.attributes.status}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-gray-900/50 dark:bg-gray-900/50 border border-border shadow-sm backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Projection Dialog */}
      <ProjectionDialog
        projection={selectedProjection}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
