'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BetSlip {
  id: string;
  date: string;
  amount: number;
  potentialWinnings: number;
  status: 'active' | 'won' | 'lost';
  selections: Array<{
    game: string;
    pick: string;
    odds: number;
  }>;
}

function BetSlipCard({ slip }: { slip: BetSlip }) {
  const getStatusConfig = (status: BetSlip['status']) => {
    switch (status) {
      case 'active': return {
        color: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
      };
      case 'won': return {
        color: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
      };
      case 'lost': return {
        color: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
      };
    }
  };

  const config = getStatusConfig(slip.status);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="card" data-active={slip.status === 'active'}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={config.badge}>
              {slip.status.charAt(0).toUpperCase() + slip.status.slice(1)}
            </Badge>
            <span className="text-sm text-muted-foreground">{slip.date}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slip.selections.map((selection, index) => (
              <div key={index} className="space-y-1">
                <div className="text-sm font-medium">{selection.game}</div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{selection.pick}</span>
                  <span>{selection.odds}</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Stake</span>
                <p className="font-medium">${slip.amount}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-sm text-muted-foreground">Potential Win</span>
                <p className={cn("font-medium", config.color)}>${slip.potentialWinnings}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function BetSlipsManager() {
  const dummySlips: BetSlip[] = [
    {
      id: '1',
      date: '2024-02-13',
      amount: 100,
      potentialWinnings: 250,
      status: 'active',
      selections: [
        { game: 'Lakers vs Warriors', pick: 'Lakers -5.5', odds: 1.91 },
        { game: 'Celtics vs Nets', pick: 'Over 220.5', odds: 1.87 }
      ]
    },
    {
      id: '2',
      date: '2024-02-12',
      amount: 50,
      potentialWinnings: 150,
      status: 'won',
      selections: [
        { game: 'Heat vs Bulls', pick: 'Heat ML', odds: 2.1 }
      ]
    }
  ];

  return (
    <div className="bet-slips-container">
      <Card className="relative border-blue-500/10">
        {/* Organic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-blue-500/[0.03] to-background" />
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/[0.05] via-transparent to-transparent blur-xl" />
        
        {/* Content */}
        <div className="relative">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Bet Slips</CardTitle>
            <CardDescription>Manage your active and settled bets</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
                <TabsTrigger value="settled" className="flex-1">Settled</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-6 px-6 pb-6">
                    <AnimatePresence>
                      {dummySlips
                        .filter(slip => slip.status === 'active')
                        .map(slip => (
                          <BetSlipCard key={slip.id} slip={slip} />
                        ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="settled" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-6 px-6 pb-6">
                    <AnimatePresence>
                      {dummySlips
                        .filter(slip => slip.status !== 'active')
                        .map(slip => (
                          <BetSlipCard key={slip.id} slip={slip} />
                        ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
