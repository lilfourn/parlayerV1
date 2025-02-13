'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, History } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  glowColor: string;
}

function StatsCard({ title, value, icon, glowColor }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg
        before:absolute before:w-24 before:h-24 before:rounded-full 
        before:blur-2xl before:opacity-20 before:-z-10 before:transition-all
        before:duration-500 hover:before:scale-150 before:${glowColor}
        border border-${glowColor}/20 bg-gray-900/50 dark:bg-gray-900/50`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-foreground/80 dark:text-foreground/90">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-full bg-${glowColor}/10`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground dark:text-foreground">
            {value}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StatsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard
        title="Total Money in Play"
        value="$1,234"
        icon={<DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />}
        glowColor="emerald-500"
      />
      <StatsCard
        title="Potential Earnings"
        value="$2,345"
        icon={<TrendingUp className="h-4 w-4 text-purple-500 dark:text-purple-400" />}
        glowColor="purple-500"
      />
      <StatsCard
        title="Total Won"
        value="$3,456"
        icon={<History className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
        glowColor="blue-500"
      />
    </div>
  );
}
