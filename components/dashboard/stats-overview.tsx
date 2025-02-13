'use client';

import { DollarSign, TrendingUp, Activity, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

function StatsCard({ title, value, change, icon, prefix, suffix }: StatsCardProps) {
  return (
    <Card className={cn(
      "flex-1 backdrop-blur-sm border transition-all duration-300",
      "dark:bg-slate-900/30 dark:border-slate-800/50 dark:hover:border-slate-700/50",
      "bg-white/50 border-slate-200 hover:border-slate-300"
    )}>
      <CardContent className="p-6">
        <div className={cn(
          "flex items-center gap-2 mb-2",
          "dark:text-slate-400 text-slate-600"
        )}>
          {icon}
          <h3 className="font-medium">{title}</h3>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            {prefix && <span className="dark:text-slate-400 text-slate-600">{prefix}</span>}
            <span className={cn(
              "text-2xl font-mono font-semibold",
              "dark:text-white text-slate-900"
            )}>
              {value}
            </span>
            {suffix && <span className="dark:text-slate-400 text-slate-600">{suffix}</span>}
          </div>
          
          <div className={cn(
            "flex items-center gap-1 text-sm",
            change.startsWith('+') ? "text-emerald-500" : "text-red-500"
          )}>
            <span>{change}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsOverview() {
  const stats = [
    {
      title: 'Revenue',
      value: '45,231',
      change: '+20.1% vs last month',
      prefix: '$',
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      title: 'Active Bets',
      value: '573',
      change: '+201 today',
      icon: <Activity className="w-4 h-4" />
    },
    {
      title: 'Win Rate',
      value: '62.3',
      change: '+7% vs last week',
      suffix: '%',
      icon: <TrendingUp className="w-4 h-4" />
    },
  ];

  return (
    <Card className={cn(
      "backdrop-blur-sm border transition-all duration-300",
      "dark:bg-slate-950/30 dark:border-slate-800/50",
      "bg-white/50 border-slate-200"
    )}>
      <CardContent className="p-8 space-y-6">
        <h2 className={cn(
          "text-xl font-semibold",
          "dark:text-white text-slate-900"
        )}>
          Betting Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map(stat => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
