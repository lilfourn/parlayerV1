'use client';

import { ProjectionWithAttributes } from "@/types/props";
import { Card } from "@/components/ui/card";
import { PlayerAvatar } from "@/app/props/components/player-avatar";
import { format } from "date-fns";

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
  
  return (
    <Card className="overflow-hidden">
      <div
        className="p-4"
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
              <div className="font-medium">{player.name}</div>
              <div className="text-sm text-gray-500">
                {projectionData.stat_display_name}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">difference</div>
          </div>
        </div>
      </div>
      <div className="p-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-500">Line</div>
          <div className="font-semibold">{lineScore}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Average</div>
          <div className="font-semibold">{avgValue.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Games</div>
          <div className="font-semibold">{stats.count}</div>
        </div>
      </div>
      <div className="px-4 pb-4 text-xs text-gray-500">
        Start: {format(new Date(projectionData.start_time), 'MMM d, h:mm a')}
      </div>
    </Card>
  );
}
