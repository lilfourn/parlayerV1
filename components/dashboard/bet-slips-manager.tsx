'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="mb-4 relative overflow-hidden backdrop-blur-sm border border-border bg-gray-900/50 dark:bg-gray-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground">
              Bet Slip #{slip.id}
            </CardTitle>
            <Badge className={config.badge}>
              {slip.status === 'active' && <Sparkles className="w-3 h-3 mr-1" />}
              {slip.status === 'won' && <Check className="w-3 h-3 mr-1" />}
              {slip.status === 'lost' && <X className="w-3 h-3 mr-1" />}
              {slip.status.toUpperCase()}
            </Badge>
          </div>
          <CardDescription className="text-muted-foreground">{slip.date}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {slip.selections.map((selection, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between items-center text-sm bg-muted/50 dark:bg-muted/10 p-3 rounded-lg"
              >
                <span className="text-muted-foreground">{selection.game}</span>
                <span className="font-medium text-foreground">
                  {selection.pick} ({selection.odds})
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-muted/50 dark:bg-muted/10 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Bet Amount</p>
            <p className={`text-lg font-bold ${config.color}`}>
              ${slip.amount}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Potential Winnings</p>
            <p className={`text-lg font-bold ${config.color}`}>
              ${slip.potentialWinnings}
            </p>
          </div>
        </CardFooter>
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
    <div className="relative overflow-hidden rounded-xl p-6 border border-border backdrop-blur-sm bg-gray-900/50 dark:bg-gray-900/50">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/5 backdrop-blur-sm">
          <TabsTrigger 
            value="active"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600"
          >
            Active Slips
          </TabsTrigger>
          <TabsTrigger 
            value="past"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600"
          >
            Past Slips
          </TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <TabsContent key="active" value="active">
            <ScrollArea className="h-[600px] pr-4">
              {dummySlips.filter(slip => slip.status === 'active').map(slip => (
                <BetSlipCard key={slip.id} slip={slip} />
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent key="past" value="past">
            <ScrollArea className="h-[600px] pr-4">
              {dummySlips.filter(slip => slip.status !== 'active').map(slip => (
                <BetSlipCard key={slip.id} slip={slip} />
              ))}
            </ScrollArea>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
