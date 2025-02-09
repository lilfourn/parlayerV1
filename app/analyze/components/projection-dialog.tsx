'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/app/props/components/player-avatar";
import { TrendingUp, Clock, Calendar, Loader2 } from "lucide-react";
import type { ProcessedProjection } from '@/app/types/props';
import { useToast } from "@/components/ui/use-toast";

interface ProjectionDialogProps {
  projection: ProcessedProjection | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectionDialog({ projection, isOpen, onClose }: ProjectionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
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
    try {
      setIsLoading(true);
      const response = await fetch('/api/analyze/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projection: projection.projection,
          player: projection.player,
          stats: projection.statAverage,
        }),
      });

      if (!response.ok) throw new Error('Failed to get analysis');

      const data = await response.json();
      // TODO: Handle the response data once the API is implemented
      toast({
        title: "Analysis Retrieved",
        description: "Additional analysis has been generated for this projection.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get additional analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Projection Details
          </DialogTitle>
        </DialogHeader>

        {/* Player Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Player Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <PlayerAvatar
                    imageUrl={projection.player?.attributes.image_url || undefined}
                    name={projection.player?.attributes.name || 'Unknown'}
                    size={64}
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {projection.player?.attributes.name || 'Unknown Player'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {projection.player?.attributes.team || 'Unknown Team'}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="secondary"
                  className="capitalize"
                >
                  {projection.projection.attributes.status}
                </Badge>
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {/* Stat Type */}
                <div>
                  <div className="text-sm text-muted-foreground">Stat</div>
                  <div className="font-semibold">Fantasy Score</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span className="text-muted-foreground/60">vs</span>
                    {projection.projection.attributes.description}
                  </div>
                </div>

                {/* Line */}
                <div>
                  <div className="text-sm text-muted-foreground">Line</div>
                  <div className="font-semibold">{projection.projection.attributes.line_score}</div>
                </div>

                {/* Analysis */}
                <div>
                  <div className="text-sm text-muted-foreground">Analysis</div>
                  <Badge 
                    variant="default"
                    className={`
                      ${Math.abs(projection.percentageDiff) >= 15
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                        : Math.abs(projection.percentageDiff) >= 5
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    {projection.percentageDiff > 0 ? '+' : ''}{projection.percentageDiff.toFixed(1)}%
                  </Badge>
                </div>

                {/* Start Time */}
                <div>
                  <div className="text-sm text-muted-foreground">Start</div>
                  <div className="font-semibold">
                    {formatTime(projection.projection.attributes.start_time)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(projection.projection.attributes.start_time)}
                  </div>
                </div>

                {/* Updated */}
                <div>
                  <div className="text-sm text-muted-foreground">Updated</div>
                  <div className="font-semibold">
                    {formatTimeAgo(projection.projection.attributes.updated_at)}
                  </div>
                </div>

                {/* Empty column to maintain grid layout */}
                <div></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Line Details */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Line Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Line Score</div>
                    <div className="font-semibold">{projection.projection.attributes.line_score}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Average</div>
                    <div className="font-semibold">{projection.statAverage?.attributes.average.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Difference</div>
                    <Badge 
                      variant="default"
                      className={`
                        ${Math.abs(projection.percentageDiff) >= 15
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                          : Math.abs(projection.percentageDiff) >= 5
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      {projection.percentageDiff > 0 ? '+' : ''}{projection.percentageDiff.toFixed(1)}%
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Recommended</div>
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      {projection.percentageDiff > 0 ? 'LESS' : 'MORE'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats Info */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Stats Info</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Sample Size</div>
                    <div className="font-semibold">{projection.statAverage?.attributes.count || 'N/A'} games</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Max Value</div>
                    <div className="font-semibold">{projection.statAverage?.attributes.max_value || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Game Info</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div>{formatDate(projection.projection.attributes.start_time)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Time</div>
                    <div>{formatTime(projection.projection.attributes.start_time)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Flags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {projection.projection.attributes.refundable && (
                <Badge variant="secondary">Refundable</Badge>
              )}
              {projection.projection.attributes.tv_channel && (
                <Badge variant="outline">
                  Watch on {projection.projection.attributes.tv_channel}
                </Badge>
              )}
            </div>

            {/* Get More Information Button */}
            <div className="mt-6">
              <Button
                variant="outline"
                size="lg"
                className="w-full relative group overflow-hidden border-border hover:border-[#0066ff]/0 transition-all duration-300
                  before:absolute before:inset-0 before:rounded-md before:border before:border-transparent before:transition-all before:duration-300
                  hover:before:border-[#0066ff] hover:before:shadow-[0_0_15px_rgba(0,102,255,0.5)]
                  bg-background"
                onClick={handleGetMoreInfo}
                disabled={isLoading}
              >
                <div className="relative flex items-center justify-center gap-2 py-2 group-hover:scale-[0.98] transition-transform duration-300">
                  {isLoading ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-[#0066ff]" />
                        <span className="text-base font-medium">Generating Analysis...</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5 text-[#0066ff] transition-transform group-hover:scale-110" />
                      <span className="text-base font-medium">Get Deeper Analysis</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
