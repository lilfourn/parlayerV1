'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/app/props/components/player-avatar";
import { TrendingUp, Clock, Calendar, Loader2, ChevronUp, ChevronDown, Minus, Sparkles } from "lucide-react";
import type { ProcessedProjection, AnalysisResponse, ProjectionWithAttributes } from '@/app/types/props';
import { useToast } from "@/components/ui/use-toast";
import { analyzeProjection } from '@/app/actions';
import { cn } from "@/lib/utils";
import { ErrorBoundary } from './error-boundary';
import { AnalysisResults } from './analysis-results';
import { useBetSlipStore } from '@/app/props/stores/bet-slip-store';
import { BetSlip } from '@/components/dashboard/bet-slip';

// Error display component
const AnalysisErrorDisplay = () => (
  <Card className="mt-4 border-destructive">
    <CardContent className="pt-6 text-destructive">
      Failed to display analysis. Showing raw data...
    </CardContent>
  </Card>
);

interface ProjectionDialogProps {
  projection: ProcessedProjection | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectionDialog({ projection, isOpen, onClose }: ProjectionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { addSelection, hasSelection } = useBetSlipStore();
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

  const handleGetMoreInfo = async () => {
    if (!projection) return;
    
    try {
      setIsLoading(true);
      const analysis: AnalysisResponse = await analyzeProjection(projection);
      setAnalysis(analysis);
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been generated for this projection.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the projection at this time.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      console.log('Starting analysis request:', {
        player: {
          name: projection.player?.attributes.display_name,
          team: projection.player?.attributes.team,
          attributes: projection.player?.attributes
        },
        projection: {
          ...projection.projection.attributes,
          relationships: projection.projection.relationships
        },
        stats: {
          season_average: projection.statAverage?.attributes.average,
          recent_average: projection.statAverage?.attributes.last_n_average,
          trend: projection.statAverage?.attributes.trend,
          recent_games: projection.statAverage?.attributes.recent_games,
          percentage_diff: projection.percentageDiff
        }
      });

      setIsAnalyzing(true);
      const analysis: AnalysisResponse = await analyzeProjection(projection);
      
      console.log('Analysis completed successfully:', {
        hasResult: !!analysis,
        confidence: analysis?.confidence,
        recommendation: analysis?.recommendation,
        timestamp: new Date().toISOString()
      });

      if (!analysis) {
        throw new Error('No analysis result received');
      }

      setAnalysis(analysis);
      setError(null);
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

      setError(error instanceof Error ? error : new Error('Failed to analyze projection'));
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze projection',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to convert ProcessedProjection to ProjectionWithAttributes
  function convertToProjectionWithAttributes(processed: ProcessedProjection): ProjectionWithAttributes {
    return {
      projection: {
        type: "projection" as const,
        id: processed.projection.id,
        attributes: {
          adjusted_odds: null,  // Default value since it's missing
          board_time: processed.projection.attributes.start_time, // Using start_time as board_time
          custom_image: null,  // Default value since it's missing
          description: processed.projection.attributes.description,
          end_time: null,  // Default value since it's missing
          flash_sale_line_score: null,  // Default value since it's missing
          game_id: processed.projection.attributes.game_id,
          hr_20: processed.projection.attributes.hr_20,
          in_game: processed.projection.attributes.in_game,
          is_live: processed.projection.attributes.is_live,
          is_promo: processed.projection.attributes.is_promo,
          line_score: processed.projection.attributes.line_score,
          line_movement: processed.projection.attributes.line_movement,
          odds_type: processed.projection.attributes.odds_type,
          projection_type: processed.projection.attributes.stat_type, // Using stat_type as projection_type
          rank: 0,  // Default value since it's missing
          refundable: processed.projection.attributes.refundable,
          start_time: processed.projection.attributes.start_time,
          stat_display_name: processed.projection.attributes.stat_display_name,
          stat_type: processed.projection.attributes.stat_type,
          status: processed.projection.attributes.status,
          tv_channel: processed.projection.attributes.tv_channel,
          updated_at: processed.projection.attributes.updated_at
        },
        relationships: {
          ...processed.projection.relationships,
          duration: processed.projection.relationships.duration,
          projection_type: processed.projection.relationships.projection_type,
          score: processed.projection.relationships.score,
          stat_type: processed.projection.relationships.stat_type,
          new_player: processed.projection.relationships.new_player,
          stat_average: processed.projection.relationships.stat_average,
          league: processed.projection.relationships.league
        }
      },
      player: processed.player,
      stats: processed.statAverage
    };
  }

  const handleAddToBetSlip = () => {
    if (!projection) return;
    addSelection(convertToProjectionWithAttributes(projection));
    toast({
      title: "Prop Added",
      description: "The prop has been added to your bet slip.",
    });
  };

  const handleClose = () => {
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
    onClose();
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
          <Card>
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

          <Card>
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

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium">Status</div>
              <div className="mt-1">
                <Badge variant="secondary" className="capitalize">
                  {projection.projection.attributes.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
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
        {!analysis && !error && (
          <div className="flex justify-center">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Analysis
                </>
              )}
            </Button>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <ErrorBoundary fallback={<AnalysisErrorDisplay />}>
            <AnalysisResults 
              analysis={analysis} 
              projection={projection}
              onReanalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
          </ErrorBoundary>
        )}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-destructive">
              {error.message}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            <Button 
              variant="outline" 
              onClick={handleAddToBetSlip}
              disabled={hasSelection(projection.projection.id)}
            >
              {hasSelection(projection.projection.id) ? 'Added to Slip' : 'Add Prop'}
            </Button>
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
