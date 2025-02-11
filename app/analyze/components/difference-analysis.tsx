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
  const [itemsPerPage] = useState(12);
  const { toast } = useToast();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedProjection, setSelectedProjection] = useState<ProcessedProjection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    <Card className="w-full bg-gradient-to-b from-background to-muted/20">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">Projections</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Sorted by variance from historical averages
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchProjections}
              disabled={isLoading}
              className="relative shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 p-4 text-center rounded-lg bg-red-50 border border-red-100">
            {error}
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block rounded-lg border bg-card">
              <Table className="bg-gray-900/50">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[250px]">Player</TableHead>
                    <TableHead>League</TableHead>
                    <TableHead>Stat</TableHead>
                    <TableHead className="text-right">Line</TableHead>
                    <TableHead className="text-right">Average</TableHead>
                    <TableHead className="text-right">Difference</TableHead>
                    <TableHead className="text-right">Recommended</TableHead>
                    <TableHead className="text-right">Start Time</TableHead>
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
                    <TableRow 
                      key={item.projection.id}
                      className="group hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedProjection(item);
                        setIsDialogOpen(true);
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <PlayerAvatar
                            imageUrl={item.player?.attributes.image_url || undefined}
                            name={item.player?.attributes.name || 'Unknown'}
                            size={32}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {item.player?.attributes.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.player?.attributes.team || 'No Team'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${
                            item.player?.attributes.league === 'NBA' 
                              ? 'bg-orange-50 text-orange-700 border-orange-200 group-hover:bg-orange-100' 
                              : item.player?.attributes.league === 'NHL'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100'
                              : item.player?.attributes.league === 'MLB'
                              ? 'bg-red-50 text-red-700 border-red-200 group-hover:bg-red-100'
                              : 'bg-gray-50 text-gray-700 border-gray-200 group-hover:bg-gray-100'
                          }`}
                        >
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
                      <TableCell className="text-right">
                        <Badge 
                          variant="outline"
                          className={`
                            ${item.percentageDiff > 0 
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700'}
                          `}
                        >
                          {item.percentageDiff > 0 ? 'LESS' : 'MORE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatTime(item.projection.attributes.start_time)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </Card>
                ))
              ) : currentData.map((item) => (
                <div key={item.projection.id} onClick={() => {
                  setSelectedProjection(item);
                  setIsDialogOpen(true);
                }}>
                  <Collapsible
                    open={expandedRows.has(item.projection.id)}
                    onOpenChange={() => toggleRow(item.projection.id)}
                  >
                    <Card className="p-4 bg-gray-900/50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar
                            imageUrl={item.player?.attributes.image_url || undefined}
                            name={item.player?.attributes.name || 'Unknown'}
                            size={40}
                          />
                          <div>
                            <div className="font-medium">
                              {item.player?.attributes.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.player?.attributes.team || 'No Team'}
                            </div>
                          </div>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronDown className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              expandedRows.has(item.projection.id) && "transform rotate-180"
                            )} />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${
                            item.player?.attributes.league === 'NBA' 
                              ? 'bg-orange-50 text-orange-700 border-orange-200' 
                              : item.player?.attributes.league === 'NHL'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.player?.attributes.league === 'MLB'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {item.player?.attributes.league || 'Unknown'}
                        </Badge>
                        <Badge 
                          variant="default"
                          className={`
                            ${Math.abs(item.percentageDiff) >= 15
                              ? 'bg-emerald-100 text-emerald-700' 
                              : Math.abs(item.percentageDiff) >= 5
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'}
                          `}
                        >
                          {item.percentageDiff > 0 ? '+' : ''}{item.percentageDiff.toFixed(1)}%
                        </Badge>
                      </div>

                      <CollapsibleContent className="mt-4 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Stat</div>
                          <div>{item.projection.attributes.stat_display_name}</div>
                          
                          <div className="text-muted-foreground">Line</div>
                          <div className="font-medium">{item.projection.attributes.line_score}</div>
                          
                          <div className="text-muted-foreground">Average</div>
                          <div>{item.statAverage?.attributes.average.toFixed(1)}</div>
                          
                          <div className="text-muted-foreground">Difference</div>
                          <div>
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
                          </div>
                          
                          <div className="text-muted-foreground">Recommended</div>
                          <div>
                            <Badge 
                              variant="outline"
                              className={`
                                ${item.percentageDiff > 0 
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'}
                              `}
                            >
                              {item.percentageDiff > 0 ? 'LESS' : 'MORE'}
                            </Badge>
                          </div>
                          
                          <div className="text-muted-foreground">Time</div>
                          <div>{formatTime(item.projection.attributes.start_time)}</div>
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </div>
              ))}
            </div>

            {!isLoading && currentData.length === 0 && (
              <div className="text-center py-8">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
                  <span>No projections found</span>
                </div>
              </div>
            )}
            
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 space-x-0 sm:space-x-2 py-4">
              <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Showing {startIndex + 1}-{Math.min(endIndex, projectionData?.length || 0)} of {projectionData?.length || 0}
              </div>
              <div className="flex items-center space-x-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm text-muted-foreground px-2 min-w-[80px] text-center">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </div>

            {/* Projection Dialog */}
            <ProjectionDialog
              projection={selectedProjection}
              isOpen={isDialogOpen}
              onClose={() => {
                setIsDialogOpen(false);
                setSelectedProjection(null);
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
