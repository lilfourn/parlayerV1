'use client';

import { ProjectionWithAttributes } from "@/types/props";
import { Card } from "@/components/ui/card";
import { PlayerAvatar } from "@/app/props/components/player-avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DifferenceCardProps {
  projection: ProjectionWithAttributes;
}

export function DifferenceCard({ projection }: DifferenceCardProps) {
  const player = projection.player?.attributes;
  const stats = projection.stats?.attributes;
  const projectionData = projection.projection.attributes;
  
  if (!player || !stats || !projectionData) return null;
  
  const avgValue = stats.average;
  const lineScore = projectionData.line_score;
  const diff = ((lineScore - avgValue) / avgValue) * 100;
  const absDiff = Math.abs(diff);
  const intensity = Math.min(absDiff / 30, 1);
  
  const isPositive = diff > 0;
  const colorClass = isPositive 
    ? "from-green-500/20 to-green-500/5 dark:from-green-500/30 dark:to-green-500/5"
    : "from-red-500/20 to-red-500/5 dark:from-red-500/30 dark:to-red-500/5";
  
  return (
    <Card className="overflow-hidden bg-white/85 dark:bg-gray-900/75 border border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-md">
      <div
        className={cn(
          "p-4 bg-gradient-to-b",
          colorClass
        )}
        style={{
          backgroundColor: `rgba(34, 197, 94, ${intensity * 0.15})`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlayerAvatar 
              imageUrl={player.image_url || undefined}
              name={player.name}
              size={40}
            />
            <div>
              <div className="font-medium text-foreground">{player.name}</div>
              <div className="text-sm text-muted-foreground">
                {projectionData.stat_display_name}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={cn(
              "text-2xl font-bold",
              isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">difference</div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Average</div>
            <div className="font-medium text-foreground">{avgValue.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Line</div>
            <div className="font-medium text-foreground">{lineScore.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Start</div>
            <div className="font-medium text-foreground">
              {format(new Date(projectionData.start_time), 'h:mm a')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
