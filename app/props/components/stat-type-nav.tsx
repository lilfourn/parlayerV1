'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { type ProjectionWithAttributes } from '@/types/props';

interface StatTypeNavProps {
  projectionData: ProjectionWithAttributes[];
  selectedStatType: string;
  onStatTypeChange: (statType: string) => void;
}

// Helper function to get all unique stat types
function getAllStatTypes(projections: ProjectionWithAttributes[]) {
  const statTypes = new Set<string>();
  
  projections.forEach(({ projection }) => {
    if (!projection) return;
    statTypes.add(projection.attributes.stat_type);
  });
  
  return Array.from(statTypes).sort();
}

// Helper function to get unique stat types by league
function getStatTypesByLeague(projections: ProjectionWithAttributes[]) {
  const statTypesByLeague = new Map<string, Set<string>>();
  
  projections.forEach(({ projection }) => {
    if (!projection) return;
    
    const league = projection.relationships.league?.data.id;
    if (!league) return; // Skip if no league data
    
    const statType = projection.attributes.stat_type;
    
    if (!statTypesByLeague.has(league)) {
      statTypesByLeague.set(league, new Set());
    }
    
    statTypesByLeague.get(league)?.add(statType);
  });
  
  return statTypesByLeague;
}

// Get a friendly display name for a stat type
function getStatTypeDisplayName(statType: string): string {
  const displayNames: Record<string, string> = {
    'points': 'Points',
    'assists': 'Assists',
    'rebounds': 'Rebounds',
    'blocks': 'Blocks',
    'steals': 'Steals',
    'turnovers': 'Turnovers',
    'three_pointers_made': '3-Pointers Made',
    'field_goals_made': 'Field Goals Made',
    'free_throws_made': 'Free Throws Made',
    'passing_touchdowns': 'Passing TDs',
    'passing_yards': 'Passing Yards',
    'rushing_yards': 'Rushing Yards',
    'rushing_touchdowns': 'Rushing TDs',
    'receptions': 'Receptions',
    'receiving_yards': 'Receiving Yards',
    'receiving_touchdowns': 'Receiving TDs',
    'shots_on_goal': 'Shots on Goal',
    'birdies': 'Birdies',
    'bogeys': 'Bogeys',
    'pars': 'Pars',
  };
  
  return displayNames[statType] || statType;
}

export const StatTypeNav = memo(function StatTypeNav({
  projectionData,
  selectedStatType,
  onStatTypeChange,
}: StatTypeNavProps) {
  const allStatTypes = getAllStatTypes(projectionData);
  
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <button
        onClick={() => onStatTypeChange("")}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
          selectedStatType === ""
            ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30"
            : "bg-background dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
        )}
      >
        All Stat Types
      </button>
      {allStatTypes.map(statType => (
        <button
          key={statType}
          onClick={() => onStatTypeChange(statType)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
            selectedStatType === statType
              ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30"
              : "bg-background dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          )}
        >
          {getStatTypeDisplayName(statType)}
        </button>
      ))}
    </div>
  );
});

StatTypeNav.displayName = 'StatTypeNav';
