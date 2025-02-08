'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/app/props/components/player-avatar";
import { TrendingUp, Clock, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

        <div className="space-y-6">
          {/* Player Info Section */}
          <div className="flex items-start gap-4">
            <PlayerAvatar
              imageUrl={projection.player?.attributes.image_url || undefined}
              name={projection.player?.attributes.name || 'Unknown'}
              size={64}
            />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                {projection.player?.attributes.name || 'Unknown'}
              </h3>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`${
                    projection.player?.attributes.league === 'NBA' 
                      ? 'bg-orange-50 text-orange-700 border-orange-200' 
                      : projection.player?.attributes.league === 'NHL'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : projection.player?.attributes.league === 'MLB'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {projection.player?.attributes.league || 'Unknown'}
                </Badge>
                <span className="text-muted-foreground">
                  {projection.player?.attributes.team || 'No Team'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Stat Type</div>
                    <div className="text-lg font-medium">{projection.projection.attributes.stat_display_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Line</div>
                    <div className="text-lg font-medium">{projection.projection.attributes.line_score}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Historical Average</div>
                    <div className="text-lg font-medium">{projection.statAverage?.attributes.average.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Difference</div>
                    <div className="flex items-center gap-2">
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
                      <Badge 
                        variant="outline"
                        className={`
                          ${projection.percentageDiff > 0 
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'}
                        `}
                      >
                        {projection.percentageDiff > 0 ? 'LESS' : 'MORE'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Game Time</div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-medium">
                        {formatTime(projection.projection.attributes.start_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(projection.projection.attributes.start_time)}
                      </span>
                    </div>
                  </div>

                  {projection.projection.attributes.line_movement && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Line Movement</div>
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Original</div>
                          <div className="text-lg font-medium">
                            {projection.projection.attributes.line_movement.original}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {projection.projection.attributes.line_movement.direction === 'up' ? (
                            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Current</div>
                          <div className="text-lg font-medium">
                            {projection.projection.attributes.line_movement.current}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge 
                          variant="outline" 
                          className={projection.projection.attributes.line_movement.direction === 'up' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-red-50 text-red-700 border-red-200'}
                        >
                          {projection.projection.attributes.line_movement.direction === 'up' ? '+' : ''}
                          {projection.projection.attributes.line_movement.difference}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="text-lg font-medium capitalize">
                      {projection.projection.attributes.status.toLowerCase()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
