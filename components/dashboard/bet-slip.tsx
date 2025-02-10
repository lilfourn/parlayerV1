'use client';

import { useBetSlipStore } from '@/app/props/stores/bet-slip-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { PlayerAvatar } from '@/app/props/components/player-avatar';

export function BetSlip() {
  const { selections, removeSelection, clearSelections } = useBetSlipStore();

  if (selections.length === 0) {
    return null;
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-96 bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300",
      selections.length === 6 && "ring-2 ring-amber-500/50 ring-offset-2 ring-offset-white shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]"
    )}>
      <div className="relative p-4 border-b bg-gray-50">
        {selections.length === 6 && (
          <div className="absolute inset-x-0 -top-0.5 flex items-center justify-center">
            <span className="px-3 py-0.5 text-[11px] leading-4 font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-b-md shadow-sm">
              Max Selections Reached
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold">Selected Projections ({selections.length})</h3>
            {selections.length >= 2 && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                Payout Multiplier: <span className="text-green-600 font-medium">{useBetSlipStore.getState().getPayoutMultiplier()}x</span>
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelections}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      </div>
      <ScrollArea className="max-h-[400px]">
        <div className="p-4 space-y-4">
          {selections.map((selection) => {
            const startTime = new Date(selection.projection.attributes.start_time);
            const updatedAt = new Date(selection.projection.attributes.updated_at);
            const stats = selection.stats?.attributes;
            const avgValue = stats?.average ?? 0;
            const lineScore = selection.projection.attributes.line_score;
            const diff = avgValue ? ((lineScore - avgValue) / avgValue) * 100 : 0;
            const diffColor = diff > 0 ? 'text-green-600' : 'text-red-600';

            return (
              <div
                key={selection.projection.id}
                className="space-y-3 p-3 rounded-lg border bg-gray-50/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar 
                      name={selection.player?.attributes?.name || 'Unknown'} 
                      imageUrl={selection.player?.attributes?.image_url || undefined}
                      size={32}
                    />
                    <div>
                      <p className="font-medium">
                        {selection.player?.attributes?.name || 'Unknown Player'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selection.projection.relationships.league?.data 
                          ? `League ${selection.projection.relationships.league.data.id}`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSelection(selection.projection.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Stat Type</p>
                    <p className="font-medium">{selection.projection.attributes.stat_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Line</p>
                    <p className="font-medium">{lineScore}</p>
                  </div>
                  {avgValue > 0 && (
                    <>
                      <div>
                        <p className="text-muted-foreground">Average</p>
                        <p className="font-medium">{avgValue.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Diff</p>
                        <p className={`font-medium ${diffColor}`}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-muted-foreground">Start Time</p>
                    <p className="font-medium">{format(startTime, 'h:mm a')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium">{selection.projection.attributes.status}</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-gray-50">
        <Link href="/dashboard" className="w-full">
          <Button className="w-full">View in Dashboard</Button>
        </Link>
      </div>
    </Card>
  );
}
