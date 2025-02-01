'use client';

import { useMemo } from 'react';
import { ApiResponse, Projection, NewPlayer, IncludedItem } from '@/types/props';

export interface ProcessedProjectionData {
  filteredProjections: Projection[];
  playerMap: Map<string, NewPlayer>;
  showNext24Hours: boolean;
  availableLeagues: string[];
}

export function useProjectionDataProcessor(
  apiResponse: ApiResponse, 
  showNext24Hours: boolean,
  activeLeague: string
): ProcessedProjectionData {
  const processedData = useMemo(() => {
    console.log('Processing data with:', {
      dataLength: apiResponse?.data?.length,
      includedLength: apiResponse?.included?.length,
      showNext24Hours,
      activeLeague
    });

    if (!apiResponse?.data || !Array.isArray(apiResponse.data)) {
      console.error('Invalid apiResponse:', apiResponse);
      return { 
        filteredProjections: [], 
        playerMap: new Map(), 
        showNext24Hours,
        availableLeagues: []
      };
    }

    // First, create a map of players and collect unique leagues
    const playerMap = new Map<string, NewPlayer>();
    const newPlayers = apiResponse.included.filter((item): item is NewPlayer => item.type === 'new_player');
    const leagueSet = new Set<string>();
    
    newPlayers.forEach(player => {
      playerMap.set(player.id, player);
      if (player.attributes.league) {
        leagueSet.add(player.attributes.league);
      }
    });

    const availableLeagues = Array.from(leagueSet).sort();

    // Filter projections by league and time
    const leagueFilteredProjections = apiResponse.data.filter((projection: Projection) => {
      const playerId = projection.relationships.new_player?.data?.id;
      const player = playerId ? playerMap.get(playerId) : null;
      return player?.attributes.league === activeLeague;
    });

    const filteredProjections = showNext24Hours 
      ? leagueFilteredProjections.filter((projection: Projection) => {
          const startTime = new Date(projection.attributes.start_time);
          const now = new Date();
          const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          return startTime >= now && startTime <= in24Hours;
        })
      : leagueFilteredProjections;

    console.log('Filtered projections:', {
      total: apiResponse.data.length,
      byLeague: leagueFilteredProjections.length,
      final: filteredProjections.length,
      league: activeLeague
    });

    return {
      filteredProjections,
      playerMap,
      showNext24Hours,
      availableLeagues
    };
  }, [apiResponse, showNext24Hours, activeLeague]);

  return processedData;
}
