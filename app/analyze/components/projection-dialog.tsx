'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/app/props/components/player-avatar";
import { TrendingUp, Clock, Calendar, Loader2, ChevronUp, ChevronDown, Minus, Sparkles, BarChart2 } from "lucide-react";
import type { ProcessedProjection, AnalysisResponse, ProjectionWithAttributes } from '@/app/types/props';
import { useToast } from "@/components/ui/use-toast";
import { analyzeProjection } from '@/app/actions';
import { cn } from "@/lib/utils";
import { ErrorBoundary } from './error-boundary';
import { AnalysisResult } from "./analysis-result";
import { useBetSlipStore } from '@/app/props/stores/bet-slip-store';
import { BetSlip } from '@/components/dashboard/bet-slip';

// Error display component
const AnalysisErrorDisplay = () => (
  <Card className="mt-4 border-destructive bg-gray-900/50 dark:bg-gray-900/50 border border-border shadow-sm backdrop-blur-sm">
    <CardContent className="pt-6 text-destructive">
      Failed to display analysis. Showing raw data...
    </CardContent>
  </Card>
);

interface ProjectionDialogProps {
  projection: ProcessedProjection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProjectionDialogState {
  isAnalyzing: boolean;
  error?: string;
  analysis?: AnalysisResponse;
}

export function ProjectionDialog({ projection, open, onOpenChange }: ProjectionDialogProps) {
  const [state, setState] = useState<ProjectionDialogState>({
    isAnalyzing: false
  });
  const { addSelection, hasSelection, getSelectionType } = useBetSlipStore();
  const { toast } = useToast();

  if (!projection) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const minutes = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return formatDate(dateString);
  };

  const handleAnalyze = async () => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: undefined }));
    try {
      const analysis = await analyzeProjection(projection);
      
      if (!analysis) {
        throw new Error('No analysis data received');
      }

      setState({
        isAnalyzing: false,
        analysis
      });

      toast({
        title: 'Analysis Complete',
        description: 'The projection analysis has been updated.',
      });
    } catch (error) {
      console.error('Analysis failed:', {
        error,
        timestamp: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Failed to analyze projection'
      }));

      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze projection',
      });
    }
  };

  // Helper function to convert ProcessedProjection to ProjectionWithAttributes
  function convertToProjectionWithAttributes(processed: ProcessedProjection): ProjectionWithAttributes {
    return {
      id: (id: any) => processed.projection.id,
      projection: {
        type: "projection" as const,
        id: processed.projection.id,
        attributes: {
          adjusted_odds: null,
          board_time: processed.projection.attributes.start_time,
          custom_image: null,
          description: processed.projection.attributes.description,
          end_time: null,
          flash_sale_line_score: null,
          game_id: processed.projection.attributes.game_id,
          hr_20: false,
          in_game: false,
          is_live: false,
          is_promo: false,
          line_score: processed.projection.attributes.line_score,
          odds_type: "standard",
          projection_type: "standard",
          rank: 0, // Added required field
          refundable: false, // Added required field
          start_time: processed.projection.attributes.start_time,
          stat_type: processed.projection.attributes.stat_type,
          stat_display_name: processed.projection.attributes.stat_display_name, // Added required field
          status: processed.projection.attributes.status,
          tv_channel: null, // Added required field
          updated_at: processed.projection.attributes.updated_at
        },
        relationships: processed.projection.relationships
      },
      player: processed.player,
      stats: processed.statAverage, // Fixed to use correct property name
      attributes: processed.projection.attributes,
      relationships: processed.projection.relationships
    };
  }

  const addToBetSlip = (type: 'more' | 'less') => {
    const selection = convertToProjectionWithAttributes(projection);
    addSelection(selection, type);
    toast({
      title: `Added ${type === 'more' ? 'More' : 'Less'} to Slip`,
      description: "The prop has been added to your bet slip.",
    });
  };

  const handleClose = () => {
    setState({
      isAnalyzing: false,
      error: undefined,
      analysis: undefined
    });
    onOpenChange(false);
  };

  const getRecommendationColor = (recommendation: AnalysisResponse['recommendation']) => {
    switch (recommendation) {
      case 'strong_over':
        return 'text-green-600 dark:text-green-500';
      case 'lean_over':
        return 'text-green-500 dark:text-green-400';
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400';
      case 'lean_under':
        return 'text-red-500 dark:text-red-400';
      case 'strong_under':
        return 'text-red-600 dark:text-red-500';
    }
  };

  const getRecommendationIcon = (recommendation: AnalysisResponse['recommendation']) => {
    switch (recommendation) {
      case 'strong_over':
        return <ChevronUp className="w-5 h-5" />;
      case 'lean_over':
        return <ChevronUp className="w-4 h-4" />;
      case 'neutral':
        return <Minus className="w-4 h-4" />;
      case 'lean_under':
        return <ChevronDown className="w-4 h-4" />;
      case 'strong_under':
        return <ChevronDown className="w-5 h-5" />;
    }
  };

  const getRiskLevelColor = (riskLevel: AnalysisResponse['risk_level']) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
  };

  const getLineMovementIndicator = () => {
    if (projection.projection.attributes.line_movement) {
      return <ChevronUp className="h-4 w-4 text-green-500" />;
    } else if (projection.projection.attributes.line_movement) {
      return <ChevronDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderContent = () => (
    <div className="flex-1 overflow-y-auto pr-1 space-y-6">
      {/* Game Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(projection.projection.attributes.start_time)}
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(projection.projection.attributes.start_time)}
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            {projection.projection.attributes.stat_display_name}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 dark:bg-gray-900/50 border border-border shadow-sm backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {projection.projection.attributes.line_score}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {projection.projection.attributes.stat_display_name}
              </div>
              {getLineMovementIndicator()}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 dark:bg-gray-900/50 border border-border shadow-sm backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(projection.projection.attributes.start_time)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(projection.projection.attributes.start_time)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 dark:bg-gray-900/50 border border-border shadow-sm backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-sm font-medium">Status</div>
              <div className="mt-1">
                <Badge variant="secondary" className="capitalize">
                  {projection.projection.attributes.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 dark:bg-gray-900/50 border border-border shadow-sm backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-sm font-medium">Odds Type</div>
              <div className="mt-1">
                <Badge variant="secondary" className="capitalize">
                  {projection.projection.attributes.odds_type.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        {!state.analysis && !state.error && (
          <div className="flex justify-center">
            <Button
              onClick={handleAnalyze}
              disabled={state.isAnalyzing}
              className="w-full sm:w-auto"
            >
              {state.isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Get AI Analysis
                </>
              )}
            </Button>
          </div>
        )}

        {/* Analysis Results */}
        {state.analysis && (
          <ErrorBoundary fallback={<AnalysisErrorDisplay />}>
            <AnalysisResult 
              analysis={state.analysis} 
              projection={projection}
              onReanalyze={handleAnalyze}
              isAnalyzing={state.isAnalyzing}
            />
          </ErrorBoundary>
        )}
        {state.error && (
          <Card className="border-destructive bg-gray-900/50 dark:bg-gray-900/50 border border-border shadow-sm backdrop-blur-sm">
            <CardContent className="pt-6 text-destructive">
              {state.error}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900/50 dark:bg-gray-900/50 border border-border shadow-sm backdrop-blur-sm max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <PlayerAvatar
              name={projection.player?.attributes.display_name || 'Unknown Player'}
              imageUrl={projection.player?.attributes.image_url || ''}
              className="h-8 w-8"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate leading-relaxed py-0.5">
                  {projection.player?.attributes.display_name || 'Unknown Player'}
                </span>
                {projection.projection.attributes.is_promo && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Promo
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground truncate leading-relaxed py-0.5">
                {projection.projection.attributes.description}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="outline"
                className={cn(
                  "flex-1",
                  getSelectionType(projection.projection.id) === 'more' && "bg-primary text-primary-foreground"
                )}
                onClick={() => addToBetSlip('more')}
                disabled={hasSelection(projection.projection.id) && getSelectionType(projection.projection.id) !== 'more'}
              >
                More
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "flex-1",
                  getSelectionType(projection.projection.id) === 'less' && "bg-primary text-primary-foreground"
                )}
                onClick={() => addToBetSlip('less')}
                disabled={hasSelection(projection.projection.id) && getSelectionType(projection.projection.id) !== 'less'}
              >
                Less
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
