import type { ApiResponse } from '@/app/types/props';

export interface TransformedProjection {
  id: string;
  gameInfo: {
    gameId: string;
    startTime: string;
    status: string;
    tvChannel: string | null;
  };
  player: {
    id: string;
    name: string;
    team: string;
    position: string;
    imageUrl: string;
    league: string;
  } | null;
  league: {
    id: string;
    name: string;
  };
  projection: {
    description: string;
    status: string;
    lineScore: number;
    startTime: string;
    statType: string;
    statDisplayName: string;
    gameId: string;
    lineMovement?: {
      original: number;
      current: number;
      direction: 'up' | 'down';
      difference: number;
    };
  };
  stats: {
    id: string;
    average?: number;
    count?: number;
  } | null;
}

export function transformProjections(apiResponse: ApiResponse): TransformedProjection[] {
  if (!apiResponse?.data) return [];

  const playerMap = new Map();
  const statsMap = new Map();

  // Create maps for included data
  apiResponse.included?.forEach((item) => {
    if (item.type === 'new_player') {
      playerMap.set(item.id, item);
    } else if (item.type === 'stat_average') {
      statsMap.set(item.id, item);
    }
  });

  return apiResponse.data.map((projection): TransformedProjection => {
    const playerId = projection.relationships.new_player?.data?.id;
    const playerData = playerId ? playerMap.get(playerId) : null;
    const statsId = projection.relationships.stat_average?.data?.id;
    const statsData = statsId ? statsMap.get(statsId) : null;

    return {
      id: projection.id,
      gameInfo: {
        gameId: projection.attributes.game_id,
        startTime: projection.attributes.start_time,
        status: projection.attributes.status,
        tvChannel: projection.attributes.tv_channel,
      },
      player: playerData ? {
        id: playerData.id,
        name: playerData.attributes.display_name,
        team: playerData.attributes.team || '',
        position: playerData.attributes.position || '',
        imageUrl: playerData.attributes.image_url || '',
        league: playerData.attributes.league,
      } : null,
      league: {
        id: playerData?.attributes.league || 'UNKNOWN',
        name: playerData?.attributes.league || 'Unknown League',
      },
      projection: {
        description: projection.attributes.description,
        status: projection.attributes.status,
        lineScore: projection.attributes.line_score,
        startTime: projection.attributes.start_time,
        statType: projection.attributes.stat_type,
        statDisplayName: projection.attributes.stat_display_name,
        gameId: projection.attributes.game_id,
        ...(projection.attributes.line_movement && {
          lineMovement: {
            original: projection.attributes.line_movement.original,
            current: projection.attributes.line_movement.current,
            direction: projection.attributes.line_movement.direction,
            difference: projection.attributes.line_movement.difference,
          },
        }),
      },
      stats: statsData ? {
        id: statsData.id,
        average: statsData.attributes.average,
        count: statsData.attributes.count,
      } : null,
    };
  });
}

// Example usage:
// const apiResponse = await fetch('...');
// const data = await apiResponse.json();
// const transformedProjections = transformProjections(data);
