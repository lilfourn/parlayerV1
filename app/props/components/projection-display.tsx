'use client';

import { memo } from 'react';
import { type ProjectionWithAttributes } from './projection-attributes';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ProjectionDisplayProps {
  projectionData: ProjectionWithAttributes[];
  showNext24Hours: boolean;
  onToggleTimeFilter: (checked: boolean) => void;
}

// Memoized row component to prevent unnecessary re-renders
const ProjectionRow = memo(({ item }: { item: ProjectionWithAttributes }) => {
  const { projection, player, stats } = item;
  if (!player) return null;

  return (
    <tr key={projection.id} className="border-b hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {player.attributes.image_url && (
            <img 
              src={player.attributes.image_url} 
              alt={player.attributes.display_name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div>
            <div className="font-medium">
              {player.attributes.display_name}
            </div>
            <div className="text-sm text-gray-600">
              {player.attributes.position}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">
          <div>{player.attributes.league}</div>
          {player.attributes.team && (
            <div className="text-gray-600">{player.attributes.team}</div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <div>{projection.attributes.stat_display_name}</div>
          {stats && (
            <div className="text-xs text-gray-600">
              Avg: {stats.attributes.average.toFixed(1)} | 
              Max: {stats.attributes.max_value} | 
              Games: {stats.attributes.count}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right font-medium">
        {projection.attributes.line_score}
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">
          <div>{projection.attributes.game_id}</div>
          <div className="text-gray-600 capitalize">
            {projection.attributes.status}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm">
        {new Date(projection.attributes.start_time).toLocaleString()}
      </td>
    </tr>
  );
});

ProjectionRow.displayName = 'ProjectionRow';

export const ProjectionDisplay = memo(function ProjectionDisplay({ 
  projectionData, 
  showNext24Hours, 
  onToggleTimeFilter 
}: ProjectionDisplayProps) {
  console.log('Rendering ProjectionDisplay with:', {
    dataLength: projectionData?.length,
    showNext24Hours
  });

  if (!projectionData || projectionData.length === 0) {
    console.log('No projection data to display');
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Switch
            id="next-24-hours"
            checked={showNext24Hours}
            onCheckedChange={onToggleTimeFilter}
          />
          <Label htmlFor="next-24-hours">Show only next 24 hours</Label>
        </div>
        <p className="text-gray-600">No projections found</p>
      </div>
    );
  }

  const validProjections = projectionData.filter(item => item.player !== null);
  console.log('Valid projections with players:', validProjections.length);

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="next-24-hours"
            checked={showNext24Hours}
            onCheckedChange={onToggleTimeFilter}
          />
          <Label htmlFor="next-24-hours">Show only next 24 hours</Label>
        </div>
        <div className="text-sm text-gray-600">
          Total Projections: {validProjections.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Player</th>
              <th className="px-4 py-2 text-left">League/Team</th>
              <th className="px-4 py-2 text-left">Stat</th>
              <th className="px-4 py-2 text-right">Line</th>
              <th className="px-4 py-2 text-left">Game Info</th>
              <th className="px-4 py-2 text-left">Start Time</th>
            </tr>
          </thead>
          <tbody>
            {validProjections.map((item) => (
              <ProjectionRow key={item.projection.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
