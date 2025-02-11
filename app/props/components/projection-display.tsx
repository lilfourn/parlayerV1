'use client';

import { memo, useState, useMemo, useEffect, useCallback } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { type ProjectionWithAttributes } from '@/types/props';
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { PlayerAvatar } from './player-avatar';
import { LeagueNav } from './league-nav';
import { PlayerSearch } from './player-search';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// League configuration with icons and display names
const LEAGUE_CONFIG = [
  // Basketball
  { id: 'NBA', name: 'NBA', icon: '🏀' },
  { id: 'NBA2H', name: 'NBA 2H', icon: '🏀' },
  { id: 'NBA1H', name: 'NBA 1H', icon: '🏀' },
  { id: 'NBA1Q', name: 'NBA 1Q', icon: '🏀' },
  { id: 'NBA4Q', name: 'NBA 4Q', icon: '🏀' },
  { id: 'CBB', name: 'CBB', icon: '🏀' },
  { id: 'CBB1H', name: 'CBB 1H', icon: '🏀' },
  { id: 'AUSNBL', name: 'NBL', icon: '🏀' },

  // Football
  { id: 'NFL', name: 'NFL', icon: '🏈' },
  { id: 'NFL1H', name: 'NFL 1H', icon: '🏈' },
  { id: 'NFL1Q', name: 'NFL 1Q', icon: '🏈' },

  // Hockey
  { id: 'NHL', name: 'NHL', icon: '🏒' },

  // Soccer
  { id: 'SOCCER', name: 'SOCCER', icon: '⚽' },

  // Golf
  { id: 'PGA', name: 'PGA', icon: '⛳' },
  { id: 'TGL', name: 'TGL', icon: '⛳' },
  { id: 'EUROGOLF', name: 'EURO', icon: '⛳' },

  // Tennis
  { id: 'TENNIS', name: 'TENNIS', icon: '🎾' },

  // Baseball
  { id: 'MLBSZN', name: 'MLB', icon: '⚾' },

  // Esports
  { id: 'CS2', name: 'CS2', icon: '🎮' },
  { id: 'VAL', name: 'VALORANT', icon: '🎮' },
  { id: 'LoL', name: 'LoL', icon: '🎮' },
  { id: 'Dota2', name: 'DOTA 2', icon: '🎮' },
  { id: 'COD', name: 'COD', icon: '🎮' },
  { id: 'RL', name: 'RL', icon: '🎮' },
  { id: 'R6', name: 'R6', icon: '🎮' },

  // Combat Sports
  { id: 'BOXING', name: 'BOXING', icon: '🥊' },

  // Racing
  { id: 'APEX', name: 'APEX', icon: '🏎️' },

  // Special Events
  { id: 'SPECIALS', name: 'SPECIALS', icon: '🎯' }
];

interface ProjectionDisplayProps {
  projectionData: ProjectionWithAttributes[];
  onProjectionSelect?: (projection: ProjectionWithAttributes) => void;
  selectedProjectionId?: string;
}

// Helper function to sanitize player data
function sanitizePlayerData(player: ProjectionWithAttributes['player']) {
  if (!player) return null;
  
  return {
    ...player,
    attributes: {
      ...player.attributes,
      image_url: player.attributes.image_url || '/placeholder-avatar.png',
    },
  };
}

// Helper function to get stat types for a specific league
function getLeagueStatTypes(projections: ProjectionWithAttributes[], league: string) {
  const statTypes = new Set<string>();
  
  projections.forEach(({ projection, player }) => {
    if (!projection || !player) return;
    if (player.attributes.league !== league) return;
    statTypes.add(projection.attributes.stat_type);
  });
  
  return Array.from(statTypes).sort();
}

// Get a friendly display name for a stat type
function getStatTypeDisplayName(statType: string): string {
  const displayNames: Record<string, string> = {
    // Basketball
    'points': 'Points',
    'rebounds': 'Rebounds',
    'assists': 'Assists',
    'threes': '3-Pointers Made',
    'blocks': 'Blocks',
    'steals': 'Steals',
    'turnovers': 'Turnovers',
    'fantasy_points': 'Fantasy Points',
    // Football
    'passing_yards': 'Passing Yards',
    'rushing_yards': 'Rushing Yards',
    'receiving_yards': 'Receiving Yards',
    'touchdowns': 'Touchdowns',
    'receptions': 'Receptions',
    'interceptions': 'Interceptions',
    'completions': 'Completions',
    'attempts': 'Attempts',
    // Hockey
    'goals': 'Goals',
    'assists_hockey': 'Assists',
    'saves': 'Saves',
    'shots_on_goal': 'Shots on Goal',
    'points_hockey': 'Points',
    // Golf
    'birdies': 'Birdies',
    'bogeys': 'Bogeys',
    'pars': 'Pars',
    'score': 'Score',
  };
  
  return displayNames[statType] || statType;
}

export const ProjectionDisplay = memo(function ProjectionDisplay({ 
  projectionData,
  onProjectionSelect,
  selectedProjectionId,
}: ProjectionDisplayProps) {
  const [selectedLeague, setSelectedLeague] = useState<string>('NBA');
  const [selectedStatType, setSelectedStatType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to check if any projections have analysis data
  const hasAnalysisData = useCallback((data: ProjectionWithAttributes[]) => {
    return data.some(item => {
      const stats = item.stats;
      const projection = item.projection;
      return stats?.attributes?.average && projection?.attributes?.line_score;
    });
  }, []);

  // Get all stat types for the selected league
  const statTypes = useMemo(() => {
    return getLeagueStatTypes(projectionData, selectedLeague);
  }, [projectionData, selectedLeague]);

  // Split filtering into search results and league/stat type filters
  const searchResults = useMemo(() => {
    if (!searchTerm) return projectionData;

    const searchLower = searchTerm.toLowerCase();
    return projectionData.filter(item => {
      if (!item.player) return false;

      // Search in player name, team, position, and league
      const playerMatches = 
        item.player.attributes.name.toLowerCase().includes(searchLower) ||
        (item.player.attributes.team?.toLowerCase() || '').includes(searchLower) ||
        (item.player.attributes.position?.toLowerCase() || '').includes(searchLower) ||
        item.player.attributes.league.toLowerCase().includes(searchLower);

      // Search in stat type and description
      const statMatches = 
        item.projection.attributes.stat_type.toLowerCase().includes(searchLower) ||
        item.projection.attributes.description.toLowerCase().includes(searchLower);

      // Search in line score
      const lineScoreMatches = 
        item.projection.attributes.line_score.toString().includes(searchTerm);

      return playerMatches || statMatches || lineScoreMatches;
    });
  }, [projectionData, searchTerm]);

  // Apply league and stat type filters only if there's no search term
  const filteredData = useMemo(() => {
    if (searchTerm) return searchResults;

    return searchResults.filter(item => {
      const matchesLeague = item.player?.attributes.league === selectedLeague;
      const matchesStatType = !selectedStatType || item.projection.attributes.stat_type === selectedStatType;
      return matchesLeague && matchesStatType;
    });
  }, [searchResults, selectedLeague, selectedStatType, searchTerm]);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'projection.attributes.start_time',
      desc: false
    }
  ]);

  // Update sorting when analysis data changes
  useEffect(() => {
    const hasAnalysis = hasAnalysisData(filteredData);
    
    // If we're currently sorting by 'average' but there's no analysis data,
    // switch to sorting by start time
    if (!hasAnalysis && sorting.some(sort => sort.id === 'average')) {
      setSorting([
        {
          id: 'projection.attributes.start_time',
          desc: false
        }
      ]);
    }
    // If we have analysis data and we're using the default start_time sort,
    // switch to sorting by average
    else if (hasAnalysis && sorting.length === 1 && sorting[0].id === 'projection.attributes.start_time') {
      setSorting([
        {
          id: 'average',
          desc: true
        }
      ]);
    }
  }, [filteredData, hasAnalysisData, sorting]);

  // Set initial stat type when league changes
  useEffect(() => {
    const types = getLeagueStatTypes(projectionData, selectedLeague);
    if (types.length > 0 && !types.includes(selectedStatType)) {
      setSelectedStatType(types[0]);
    }
  }, [selectedLeague, projectionData, selectedStatType]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Define columns based on whether analysis data exists
  const columns = useMemo<ColumnDef<ProjectionWithAttributes>[]>(() => {
    const baseColumns: ColumnDef<ProjectionWithAttributes>[] = [
      {
        accessorKey: 'player',
        header: 'Player',
        cell: ({ row }) => {
          const player = row.original.player;
          if (!player) return null;

          return (
            <div className="flex items-center gap-2 min-w-[180px]">
              <PlayerAvatar 
                name={player.attributes.name}
                imageUrl={player.attributes.image_url ?? undefined}
                size={28}
              />
              <div className="flex flex-col min-w-0">
                <div className="font-medium text-sm truncate">
                  {player.attributes.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {player.attributes.team} • {row.original.projection.attributes.description}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'projection.attributes.stat_type',
        header: 'Stat',
        cell: ({ row }) => {
          return (
            <div className="min-w-[80px] font-medium text-sm">
              {row.original.projection.attributes.stat_type}
            </div>
          );
        },
      },
      {
        accessorKey: 'projection.attributes.line_score',
        header: 'Line',
        cell: ({ row }) => {
          return (
            <div className="min-w-[60px] font-medium text-sm">
              {row.original.projection.attributes.line_score}
            </div>
          );
        },
      },
      {
        id: 'projection.attributes.start_time',
        accessorFn: (row) => row.projection.attributes.start_time,
        header: 'Start',
        cell: ({ row }) => {
          const startTime = new Date(row.original.projection.attributes.start_time);
          return (
            <div className="min-w-[90px]">
              <div className="text-sm font-medium">{format(startTime, 'h:mm a')}</div>
              <div className="text-[10px] text-gray-500 tracking-tight">{format(startTime, 'MMM d')}</div>
            </div>
          );
        },
        sortingFn: 'datetime',
      },
      {
        accessorKey: 'projection.attributes.updated_at',
        header: 'Updated',
        cell: ({ row }) => {
          const updatedAt = row.original.projection.attributes.updated_at;
          if (!updatedAt) return null;
          
          const date = new Date(updatedAt);
          return (
            <div className="flex flex-col min-w-[100px]">
              <span className="text-sm font-medium">{format(date, 'h:mm a')}</span>
              <span className="text-[10px] text-gray-500 tracking-tight">
                {formatDistanceToNow(date, { addSuffix: true })}
              </span>
            </div>
          );
        },
        sortingFn: 'datetime',
      },
      {
        accessorKey: 'projection.attributes.status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.projection?.attributes.status;
          return (
            <div className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${status === 'pre_game' ? 'bg-green-100 text-green-800' :
                status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                status === 'final' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'}
            `}>
              {status === 'pre_game' ? 'Upcoming' :
               status === 'in_progress' ? 'Live' :
               status === 'final' ? 'Final' :
               status}
            </div>
          );
        },
      },
    ];

    // Only add analysis column if there's analysis data
    if (hasAnalysisData(filteredData)) {
      baseColumns.splice(3, 0, {
        id: 'average',
        header: 'Analysis',
        cell: ({ row }) => {
          const stats = row.original.stats;
          const projection = row.original.projection;
          
          if (!stats || !projection) return null;
          
          const avgValue = stats.attributes.average;
          const lineScore = projection.attributes.line_score;
          
          if (!avgValue || !lineScore) return null;
          
          // Calculate percentage difference
          const diff = ((lineScore - avgValue) / avgValue) * 100;
          const absDiff = Math.abs(diff);
          
          // Calculate color intensity based on absolute difference
          // Max intensity at 30% difference
          const intensity = Math.min(absDiff / 30, 1);
          
          // Always use green, more intense for bigger absolute differences
          const backgroundColor = `rgba(34, 197, 94, ${intensity * 0.3})`;
          
          return (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-600 min-w-[45px]">
                {avgValue.toFixed(1)}
              </span>
              <div
                className="px-2 py-1 rounded text-sm font-medium flex-1 text-center"
                style={{ backgroundColor }}
              >
                {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
              </div>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const getPercentageDiff = (row: any) => {
            const stats = row.original.stats;
            const projection = row.original.projection;
            if (!stats?.attributes?.average) return 0;
            
            const diff = (projection.attributes.line_score - stats.attributes.average) / stats.attributes.average * 100;
            return Math.abs(diff);
          };

          return getPercentageDiff(rowB) - getPercentageDiff(rowA);
        },
      });
    }

    return baseColumns;
  }, [filteredData, hasAnalysisData]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <PlayerSearch 
        projections={projectionData}
        onSearch={handleSearch}
      />

      {/* League Navigation - Hide when searching */}
      {!searchTerm && (
        <>
          <LeagueNav
            leagues={LEAGUE_CONFIG}
            selectedLeague={selectedLeague}
            onLeagueSelect={setSelectedLeague}
          />

          {/* Stat Type Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Label>Stat Type:</Label>
            <select
              value={selectedStatType}
              onChange={(e) => setSelectedStatType(e.target.value)}
              className="p-2 border rounded-md"
            >
              {Array.from(statTypes).map((type) => (
                <option key={type} value={type}>
                  {getStatTypeDisplayName(type)}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600 mb-2">
        Showing {filteredData.length} {filteredData.length === 1 ? 'projection' : 'projections'}
        {searchTerm && (
          <>
            {' '}matching "{searchTerm}"
            {filteredData.length > 0 && (
              <button
                onClick={() => setSearchTerm('')}
                className="ml-2 text-primary hover:text-primary/80 underline"
              >
                Clear search
              </button>
            )}
          </>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className="whitespace-nowrap"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getIsSorted() === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    selectedProjectionId === row.original.projection.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => onProjectionSelect?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No projections found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

ProjectionDisplay.displayName = 'ProjectionDisplay';
