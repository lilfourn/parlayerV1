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
        "fixed bottom-4 right-4 w-96 bg-white shadow-lg rounded-lg overflow-hidden",
        isMaxed && "ring-2 ring-amber-500/50 ring-offset-2 ring-offset-white shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]"
      )}
    >
      <motion.div 
        className="relative p-4 border-b bg-gray-50 cursor-pointer select-none"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('button')) {
            toggleCollapsed();
          }
        }}
        whileHover={{ backgroundColor: 'rgb(243 244 246)' }}
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
          <div className="space-y-1">
            <h3 className="font-semibold">Selected Projections ({selections.length})</h3>
            {selections.length >= 2 && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                Payout Multiplier: <span className="text-green-600 font-medium">{payoutMultiplier}x</span>
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              clearSelections();
            }}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: 'min(calc(100vh - 200px), 400px)', 
              opacity: 1
            }}
            exit={{ 
              height: 0,
              opacity: 0
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="flex flex-col overflow-hidden"
          >
            <ScrollArea className="flex-1">
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
                  const diffColor = diff > 0 ? 'text-green-600' : 'text-red-600';

                  return (
                    <motion.div
                      key={selection.projection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
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
                                : 'Unknown League'}
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
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Line</span>
                          <span>{lineScore}</span>
                        </div>
                        {stats && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg</span>
                            <span className={diffColor}>{avgValue.toFixed(1)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                          <span>Start Time</span>
                          <span>{format(startTime, 'MMM d, h:mm a')}</span>
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
              className="p-4 border-t bg-gray-50 mt-auto"
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
