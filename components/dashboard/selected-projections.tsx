'use client';

import { useBetSlipStore } from '@/app/props/stores/bet-slip-store';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { PlayerAvatar } from '@/app/props/components/player-avatar';

export function SelectedProjections() {
  const { selections, removeSelection } = useBetSlipStore();

  if (selections.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No projections selected. Go to the Props page to select some projections.
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>League</TableHead>
            <TableHead>Stat Type</TableHead>
            <TableHead>Line</TableHead>
            <TableHead>Selection</TableHead>
            <TableHead>Average</TableHead>
            <TableHead>Diff %</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selections.map((selection) => {
            const stats = selection.stats?.attributes;
            const avgValue = stats?.average ?? 0;
            const lineScore = selection.projection.attributes.line_score;
            const diff = avgValue ? ((lineScore - avgValue) / avgValue) * 100 : 0;
            const diffColor = diff > 0 ? 'text-green-600' : 'text-red-600';
            const startTime = new Date(selection.projection.attributes.start_time);
            const updatedAt = new Date(selection.projection.attributes.updated_at);

            return (
              <TableRow key={selection.projection.projection.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <PlayerAvatar 
                      name={selection.player?.attributes?.name || 'Unknown'} 
                      imageUrl={selection.player?.attributes?.image_url ?? undefined}
                      size={32}
                    />
                    <span className="font-medium">
                      {selection.player?.attributes?.name || 'Unknown Player'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {selection.projection.relationships.league?.data?.id ? Number(selection.projection.relationships.league.data.id) : 'N/A'}
                </TableCell>
                <TableCell>{selection.projection.attributes.stat_type}</TableCell>
                <TableCell className="font-medium">{lineScore}</TableCell>
                <TableCell>
                  <span className={selection.selectionType === 'more' ? 'text-green-600' : 'text-red-600'}>
                    {selection.selectionType === 'more' ? 'More' : 'Less'}
                  </span>
                </TableCell>
                <TableCell>{avgValue > 0 ? avgValue.toFixed(1) : 'N/A'}</TableCell>
                <TableCell className={avgValue > 0 ? diffColor : ''}>
                  {avgValue > 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%` : 'N/A'}
                </TableCell>
                <TableCell>{format(startTime, 'h:mm a')}</TableCell>
                <TableCell>{selection.projection.attributes.status}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(updatedAt, { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSelection(selection.projection.projection.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
