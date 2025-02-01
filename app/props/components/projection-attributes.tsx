'use client';

import { useMemo } from 'react';
import { Projection, NewPlayer, StatAverage, IncludedItem, ProjectionWithAttributes } from '@/types/props';
import { resolveRelationship } from '@/utils/props';

export type { ProjectionWithAttributes };

export function useProjectionAttributes(
    projections: Projection[],
    playerMap: Map<string, NewPlayer>,
    included: IncludedItem[]
): ProjectionWithAttributes[] {
  return useMemo(() => {
    console.log('Collecting attributes for projections:', {
      projectionsCount: projections.length,
      playerMapSize: playerMap.size,
      includedItemsCount: included.length
    });

    const attributes = projections.map(projection => {
      const playerId = projection.relationships.new_player?.data?.id;
      const player: NewPlayer | null = playerId ? playerMap.get(playerId) ?? null : null;

      if (!player && playerId) {
        console.log('Missing player data for projection:', {
          projectionId: projection.id,
          playerId,
          playerMapSize: playerMap.size
        });
      }

      const stats = projection.relationships.stat_average?.data
        ? resolveRelationship<StatAverage>(included, {
            data: {
              type: 'stat_average',
              id: projection.relationships.stat_average.data.id
            }
          })
        : null;

      return {
        projection,
        player,
        stats
      };
    });

    console.log('Collected attributes:', {
      total: attributes.length,
      withPlayers: attributes.filter(a => a.player !== null).length,
      withStats: attributes.filter(a => a.stats !== null).length
    });

    return attributes;
  }, [projections, playerMap, included]);
}
