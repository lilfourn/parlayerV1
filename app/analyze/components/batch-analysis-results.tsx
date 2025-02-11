'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalysisResponse, ProcessedProjection } from '@/app/types/props';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface BatchAnalysisResultsProps {
  results: Array<{
    analysis: AnalysisResponse;
    projection: ProcessedProjection;
    isError?: boolean;
  }>;
  isAnalyzing: boolean;
}

function getRecommendationColor(recommendation?: string) {
  switch (recommendation?.toLowerCase()) {
    case 'over':
      return 'text-green-500 dark:text-green-400';
    case 'under':
      return 'text-red-500 dark:text-red-400';
    default:
      return 'text-yellow-500 dark:text-yellow-400'; // neutral or undefined
  }
}

function getConfidenceIndicator(confidence: number) {
  if (confidence >= 0.8) return '🟢 High';
  if (confidence >= 0.5) return '🟡 Medium';
  return '🔴 Low';
}

export function BatchAnalysisResults({ results, isAnalyzing }: BatchAnalysisResultsProps) {
  // Sort results by confidence (highest to lowest)
  const sortedResults = [...results].sort((a, b) => 
    (b.analysis.confidence || 0) - (a.analysis.confidence || 0)
  );

  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Batch Analysis Results</h2>
        <span className="text-sm text-muted-foreground">
          {results.length} projections analyzed
        </span>
      </div>
      
      <ScrollArea className="h-[calc(100vh-12rem)] w-full rounded-md border">
        <div className="grid gap-4 p-4">
          {sortedResults.map(({ analysis, projection, isError }) => (
            <Card 
              key={projection.id}
              className={cn(
                "transition-all duration-200 hover:shadow-md w-full max-w-full",
                isError ? "border-destructive/50" : "border-border"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-lg truncate">
                    {projection.player?.attributes.display_name || 'Unknown Player'}
                  </CardTitle>
                  <span className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    getRecommendationColor(analysis.recommendation)
                  )}>
                    {analysis.recommendation?.toUpperCase() || 'NEUTRAL'}
                  </span>
                </div>
                <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="truncate">
                    {projection.projection.attributes.stat_display_name} - {projection.projection.attributes.line_score}
                  </span>
                  <span className="text-sm font-medium whitespace-nowrap">
                    Confidence: {getConfidenceIndicator(analysis.confidence)}
                    <span className="ml-2 text-xs opacity-75">
                      ({Math.round(analysis.confidence * 100)}%)
                    </span>
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {isError ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>Analysis failed for this projection</span>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    <p className="text-sm leading-relaxed text-muted-foreground break-words">
                      {analysis.summary || 'No analysis provided'}
                    </p>
                    {analysis.key_factors && analysis.key_factors.length > 0 && (
                      <div className="space-y-4 w-full">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-semibold tracking-tight whitespace-nowrap">Key Factors</h4>
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-border/80 to-border/20" />
                        </div>
                        <div className="relative rounded-lg bg-gradient-to-b from-muted/30 to-muted/10 p-3">
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px]" />
                          <div className="relative space-y-2">
                            {analysis.key_factors.map((factor, index) => (
                              <div 
                                key={index} 
                                className={cn(
                                  "group grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-2 items-center",
                                  "rounded-md bg-background/80 p-2.5 text-sm transition-all duration-200",
                                  "hover:bg-accent hover:shadow-sm",
                                  "border border-transparent hover:border-border/50"
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={cn(
                                    "h-2 w-2 rounded-full shrink-0 transition-transform duration-200",
                                    "group-hover:scale-110",
                                    factor.impact === 'positive' && "bg-green-500/90",
                                    factor.impact === 'negative' && "bg-red-500/90",
                                    factor.impact === 'neutral' && "bg-yellow-500/90"
                                  )} />
                                  <span className="font-medium truncate">
                                    {factor.factor}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                  <div className="h-1.5 w-16 sm:w-20 overflow-hidden rounded-full bg-muted shrink-0">
                                    <div 
                                      className={cn(
                                        "h-full transition-all duration-500 ease-out",
                                        factor.impact === 'positive' && "bg-green-500/90",
                                        factor.impact === 'negative' && "bg-red-500/90",
                                        factor.impact === 'neutral' && "bg-yellow-500/90"
                                      )}
                                      style={{ 
                                        width: `${Math.round(factor.weight * 100)}%`,
                                        transition: `width ${(index + 1) * 200}ms ease-out`
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap min-w-[2.5rem] text-right">
                                    {Math.round(factor.weight * 100)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {isAnalyzing && (
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%] mt-2" />
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
