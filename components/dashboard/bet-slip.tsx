'use client';

import { useBetSlipStore } from '@/app/props/stores/bet-slip-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { PlayerAvatar } from '@/app/props/components/player-avatar';
import { AnimatePresence, motion } from 'framer-motion';

export function BetSlip() {
  const { selections, removeSelection, clearSelections, isCollapsed, toggleCollapsed } = useBetSlipStore();
  const payoutMultiplier = useBetSlipStore.getState().getPayoutMultiplier();
  const isMaxed = selections.length === 6;

  if (selections.length === 0) {
    return null;
  }

  return (
    <Card 
      className={cn(
        "fixed bottom-4 right-4 w-96 bg-background rounded-lg overflow-hidden shadow-[inset_0_0_12px_rgba(59,130,246,0.02),0_0_12px_rgba(59,130,246,0.06),0_0_25px_rgba(59,130,246,0.04),0_0_50px_rgba(59,130,246,0.02)]",
        isMaxed && "ring-2 ring-amber-500/50 ring-offset-2 ring-offset-background shadow-[0_0_12px_-3px_rgba(245,158,11,0.3)]"
      )}
    >
      <motion.div 
        className="relative p-4 border-b bg-background dark:bg-gray-900/50 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('button')) {
            toggleCollapsed();
          }
        }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence>
          {isMaxed && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-0 -top-0.5 flex items-center justify-center"
            >
              <span className="px-3 py-0.5 text-[11px] leading-4 font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-b-md shadow-sm">
                Max Selections Reached
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Bet Slip</h3>
            <p className="text-sm text-muted-foreground">
              {selections.length} Selection{selections.length !== 1 && 's'}
            </p>
          </div>
          {selections.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelections}
              className="h-8"
            >
              Clear All
            </Button>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col"
            style={{ overflow: 'hidden' }}
          >
            <ScrollArea className="flex-1 max-h-[60vh]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="p-4 space-y-4"
              >
                {selections.map((selection, index) => {
                  const startTime = new Date(selection.projection.attributes.start_time);
                  const stats = selection.stats?.attributes;
                  const avgValue = stats?.average ?? 0;
                  const lineScore = selection.projection.attributes.line_score;
                  const diff = avgValue ? ((lineScore - avgValue) / avgValue) * 100 : 0;
                  const diffColor = diff > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                  const projectionId = selection.projection.projection.id;

                  return (
                    <motion.div
                      key={projectionId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="space-y-3 p-3 rounded-lg border bg-gray-50/50 dark:bg-gray-900/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar 
                            name={selection.player?.attributes?.name || 'Unknown'} 
                            imageUrl={selection.player?.attributes?.image_url || undefined}
                            size={32}
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {selection.player?.attributes?.name || 'Unknown Player'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selection.projection.relationships.league?.data 
                                ? `League ${selection.projection.relationships.league.data.id}`
                                : 'Unknown League'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelection(projectionId)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Line</span>
                          <span>{lineScore}</span>
                        </div>
                        {stats && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg</span>
                            <span className="text-white">{avgValue.toFixed(1)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                          <span>Start Time</span>
                          <span>{format(startTime, 'MMM d, h:mm a')}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Selection</span>
                          <span className="font-medium text-primary">{selection.selectionType === 'more' ? 'More' : 'Less'}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </ScrollArea>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="p-4 border-t bg-gray-50 dark:bg-gray-800/50 mt-auto"
            >
              <Link href="/dashboard" className="w-full">
                <Button className="w-full">View in Dashboard</Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
