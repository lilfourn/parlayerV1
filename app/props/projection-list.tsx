'use client';

import React from 'react';
import { ApiResponse, Projection, NewPlayer } from '@/types/props';

export function ProjectionList({ apiResponse }: { apiResponse: ApiResponse }) {
    // Basic error checking
    if (!apiResponse?.data) {
        console.error('No data in apiResponse');
        return <div>No data available</div>;
    }

    // Create player map
    const playerMap = new Map<string, NewPlayer>();
    apiResponse.included
        .filter((item): item is NewPlayer => item.type === 'new_player')
        .forEach(player => playerMap.set(player.id, player));

    console.log('Processing projections:', {
        totalProjections: apiResponse.data.length,
        playerMapSize: playerMap.size
    });

    // Take first 10 projections for testing
    const projections = apiResponse.data.slice(0, 10);

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-4">Projections ({projections.length} shown)</h1>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {projections.map(projection => {
                    const playerId = projection.relationships.new_player?.data?.id;
                    const player = playerId ? playerMap.get(playerId) : undefined;

                    return (
                        <div key={projection.id} className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                {player?.attributes.image_url && (
                                    <img 
                                        src={player.attributes.image_url} 
                                        alt={player.attributes.display_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                )}
                                <div>
                                    <div className="font-medium text-lg">
                                        {player ? player.attributes.display_name : 'Unknown Player'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {player?.attributes.position} • {player?.attributes.team}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">League:</span>
                                    <span className="font-medium">{player?.attributes.league}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Stat:</span>
                                    <span className="font-medium">{projection.attributes.stat_display_name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Line:</span>
                                    <span className="font-medium">{projection.attributes.line_score}</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-2">
                                    {new Date(projection.attributes.start_time).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
