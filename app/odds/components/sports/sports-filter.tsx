'use client';

import { Card } from '@/components/ui/card';
import { memo, useCallback, useEffect, useState } from 'react';

interface Sport {
  key: string;
  title: string;
  description: string;
  group: string;
  has_outrights: boolean;
  active: boolean;
}

// Map sports to emojis
const sportEmojis: Record<string, string> = {
  'americanfootball_ncaaf': '🏈',
  'americanfootball_nfl': '🏈',
  'basketball_nba': '🏀',
  'basketball_ncaab': '🏀',
  'basketball_wncaab': '🏀',
  'baseball_mlb': '⚾',
  'icehockey_nhl': '🏒',
  'soccer_epl': '⚽',
  'soccer_uefa_champs_league': '⚽',
  'soccer_spain_la_liga': '⚽',
  'soccer_germany_bundesliga': '⚽',
  'soccer_italy_serie_a': '⚽',
  'soccer_france_ligue_one': '⚽',
  'mma_mixed_martial_arts': '🥊',
  'soccer_uefa_europa_league': '⚽',
  'soccer_fa_cup': '⚽',
  'soccer_mexico_ligamx': '⚽'
};

export const SportsFilter = memo(function SportsFilter({
  onSportSelect,
  selectedSport
}: {
  onSportSelect: (sport: string) => void;
  selectedSport?: string;
}) {
  const [sports, setSports] = useState<Sport[]>([]);

  const fetchSports = useCallback(async () => {
    try {
      const response = await fetch('/api/sports');
      if (!response.ok) throw new Error('Failed to fetch sports');
      const data = await response.json();
      
      const sortedSports = data.sort((a: Sport, b: Sport) => 
        a.title.localeCompare(b.title)
      );

      setSports(sortedSports.map((sport: Sport) => ({
        ...sport,
        active: sport.key === selectedSport
      })));
    } catch (error) {
      console.error('Error fetching sports:', error);
    }
  }, [selectedSport]);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  return (
    <Card className="bg-gray-50 dark:bg-gray-800/50">
      <div className="flex flex-wrap gap-2 p-2 rounded-lg">
        {sports.map((sport) => (
          <button
            key={sport.key}
            onClick={() => onSportSelect(sport.key)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
              transition-colors duration-200
              ${
                selectedSport === sport.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }
            `}
          >
            <span className="text-base">{sportEmojis[sport.key] || '🎮'}</span>
            <span>{sport.title}</span>
          </button>
        ))}
      </div>
    </Card>
  );
});
