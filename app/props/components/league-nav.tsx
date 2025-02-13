'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface League {
  id: string;
  name: string;
  icon: string;
}

interface LeagueNavProps {
  leagues: League[];
  selectedLeague: string;
  onLeagueSelect: (league: string) => void;
}

export const LeagueNav = memo(function LeagueNav({
  leagues,
  selectedLeague,
  onLeagueSelect,
}: LeagueNavProps) {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      {leagues.map((league) => (
        <button
          key={league.id}
          onClick={() => onLeagueSelect(league.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
            selectedLeague === league.id
              ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30"
              : "bg-background dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          )}
        >
          <span>{league.icon}</span>
          <span>{league.name}</span>
        </button>
      ))}
    </div>
  );
});
