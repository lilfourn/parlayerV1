'use client';
import React, { Suspense, useCallback } from 'react';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LineChart } from 'lucide-react';
import { SportsFilter } from './components/filters/sports';
import { SearchBar } from './components/filters/searchbar';
import { TeamList } from './components/filters/team-list';
import { PlayerList } from './components/filters/player-list';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

function TeamListFallback() {
  return (
    <div className="h-full p-4">
      <div className="space-y-2">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedSport = searchParams.get('sport');
    const searchQuery = searchParams.get('q');
    const selectedTeam = searchParams.get('team');

    const handleSportSelect = useCallback((sport: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('sport', sport);
        router.push(`/analyze?${params.toString()}`);
    }, [searchParams, router]);

    const handleSearch = useCallback((query: string) => {
        const params = new URLSearchParams(searchParams);
        if (query) {
            params.set('q', query);
        } else {
            params.delete('q');
        }
        router.push(`/analyze?${params.toString()}`);
    }, [searchParams, router]);

    const handleTeamSelect = useCallback((teamId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('team', teamId);
        router.push(`/analyze?${params.toString()}`);
    }, [searchParams, router]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 relative overflow-hidden flex flex-col">
                    <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
                        <div className="flex items-center h-14 px-4">
                            <SidebarTrigger />
                            <div className="ml-4 flex items-center space-x-4">
                                <LineChart className="h-5 w-5 text-blue-500" />
                                <h1 className="text-lg font-semibold">Stats</h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Main Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4 space-y-4">
                                <SportsFilter 
                                    onSportSelect={handleSportSelect}
                                    selectedSport={selectedSport ?? undefined}
                                />
                                <SearchBar 
                                    onSearch={handleSearch}
                                    value={searchQuery ?? ''}
                                    placeholder="Search players..."
                                />
                                {selectedTeam && (
                                    <PlayerList selectedTeamId={selectedTeam} />
                                )}
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-64 border-l border-gray-200 bg-white/50 h-screen overflow-hidden">
                            <Suspense fallback={<TeamListFallback />}>
                                <TeamList 
                                    onTeamSelect={handleTeamSelect}
                                    selectedTeamId={selectedTeam ?? undefined}
                                    selectedSport={selectedSport ?? undefined}
                                />
                            </Suspense>
                        </div>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}