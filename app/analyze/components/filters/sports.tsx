'use client';

import { Card } from '@/components/ui/card';
import { memo } from 'react';

// Map sports to emojis
const sportEmojis: Record<string, string> = {
  'basketball_nba': '🏀',
  'basketball_ncaab': '🏀',
  'basketball_wncaab': '🏀',
  'baseball_mlb': '⚾',
  'americanfootball_nfl': '🏈',
  'americanfootball_ncaaf': '🏈',
  'icehockey_nhl': '🏒',
  'soccer_epl': '⚽',
  'soccer_uefa_champs_league': '⚽',
  'soccer_spain_la_liga': '⚽',
  'soccer_germany_bundesliga': '⚽',
  'soccer_italy_serie_a': '⚽',
  'soccer_france_ligue_one': '⚽',
  'mma_mixed_martial_arts': '🥊'
};

// Static sports data
const sports = [
  { key: 'basketball_nba', title: 'NBA' },
  { key: 'basketball_ncaab', title: 'NCAAB' },
  { key: 'basketball_wncaab', title: 'WNCAAB' },
  { key: 'baseball_mlb', title: 'MLB' },
  { key: 'americanfootball_nfl', title: 'NFL' },
  { key: 'americanfootball_ncaaf', title: 'NCAAF' },
  { key: 'icehockey_nhl', title: 'NHL' },
  { key: 'soccer_epl', title: 'Premier League' },
  { key: 'soccer_uefa_champs_league', title: 'Champions League' },
  { key: 'soccer_spain_la_liga', title: 'La Liga' },
  { key: 'soccer_germany_bundesliga', title: 'Bundesliga' },
  { key: 'soccer_italy_serie_a', title: 'Serie A' },
  { key: 'soccer_france_ligue_one', title: 'Ligue 1' },
  { key: 'mma_mixed_martial_arts', title: 'MMA' }
].sort((a, b) => a.title.localeCompare(b.title));

export interface SportsFilterProps {
  onSportSelect: (sport: string) => void;
  selectedSport?: string;
}

export const SportsFilter = memo(function SportsFilter({
  onSportSelect,
  selectedSport
}: SportsFilterProps) {
  return (
    <Card>
      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
        {sports.map((sport) => (
          <button
            key={sport.key}
            onClick={() => onSportSelect(sport.key)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
              transition-colors duration-200
              ${
                selectedSport === sport.key
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-background hover:bg-gray-100 hover:text-blue-600'
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