import type { Projection, StatAverage } from '@/app/props/types';

interface StatAverageMap {
  [key: string]: StatAverage;
}

/**
 * Creates a map of stat averages by their IDs
 */
export function createStatAverageMap(statAverages: StatAverage[]): StatAverageMap {
  return statAverages.reduce((map, stat) => {
    map[stat.id] = stat;
    return map;
  }, {} as StatAverageMap);
}

/**
 * Gets the stat average for a projection if it exists
 */
export function getStatAverageForProjection(
  projection: Projection,
  statAverageMap: StatAverageMap
): StatAverage | null {
  const statAverageId = projection.relationships.stat_average?.data?.id;
  if (!statAverageId) return null;
  
  return statAverageMap[statAverageId] || null;
}

/**
 * Connects projections with their stat averages
 */
export function connectProjectionsWithStatAverages(
  projections: Projection[],
  statAverages: StatAverage[]
): Array<{ projection: Projection; statAverage: StatAverage | null }> {
  const statAverageMap = createStatAverageMap(statAverages);
  
  return projections.map(projection => ({
    projection,
    statAverage: getStatAverageForProjection(projection, statAverageMap)
  }));
}

/**
 * Filters included items to get only stat averages
 */
export function filterStatAverages(included: any[]): StatAverage[] {
  return included.filter(item => item.type === 'stat_average') as StatAverage[];
}