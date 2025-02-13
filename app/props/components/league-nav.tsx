'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  const handleLeagueClick = (league: string) => {
    onLeagueSelect(league);
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
      {leagues.map((league) => (
        <Button
          key={league.id}
          variant={selectedLeague === league.id ? "default" : "ghost"}
          size="sm"
          onClick={() => handleLeagueClick(league.id)}
          className={cn(
            "transition-colors font-medium",
            selectedLeague === league.id 
              ? "bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400" 
              : "hover:bg-white/75 dark:hover:bg-gray-900/75"
          )}
        >
          <span>{league.icon}</span>
          <span>{league.name}</span>
        </Button>
      ))}
    </div>
  );
});
