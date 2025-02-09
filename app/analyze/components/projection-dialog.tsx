'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/app/props/components/player-avatar";
import { TrendingUp, Clock, Calendar } from "lucide-react";
import type { ProcessedProjection } from '@/app/types/props';

interface ProjectionDialogProps {
  projection: ProcessedProjection | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectionDialog({ projection, isOpen, onClose }: ProjectionDialogProps) {
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
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
