'use client';

import { useState } from 'react';

interface LeagueSelectorProps {
  leagues: string[];
  activeLeague: string;
  onLeagueChange: (league: string) => void;
}

export function LeagueSelector({ leagues, activeLeague, onLeagueChange }: LeagueSelectorProps) {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
      {leagues.map(league => (
        <button
          key={league}
          onClick={() => onLeagueChange(league)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            activeLeague === league
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {league}
        </button>
      ))}
    </div>
  );
}
