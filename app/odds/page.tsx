'use client';
import React, { Suspense, useEffect } from 'react';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SportsFilter } from './components/sports/sports-filter';
import { EventsList } from './components/events/events-list';
import { useRouter, useSearchParams } from 'next/navigation';
import { DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

function EventsListFallback() {
  return (
    <Card className="p-8">
      <Skeleton className="h-[200px] w-full" />
    </Card>
  );
}

export default function Odds() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedSport = searchParams.get('sport');

    // Add effect to set default sport
    useEffect(() => {
        if (!selectedSport) {
            const params = new URLSearchParams(searchParams);
            params.set('sport', 'basketball_nba');
            router.push(`/odds?${params.toString()}`);
        }
    }, [selectedSport, searchParams, router]);

    const handleSportSelect = (sport: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('sport', sport);
        router.push(`/odds?${params.toString()}`);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 relative overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
                        <div className="flex items-center h-14 px-4">
                            <SidebarTrigger />
                            <div className="ml-4 flex items-center space-x-4">
                                <DollarSign className="h-5 w-5 text-blue-500" />
                                <h1 className="text-lg font-semibold">Sports Odds</h1>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        <SportsFilter 
                            onSportSelect={handleSportSelect}
                            selectedSport={selectedSport ?? undefined}
                        />
                        <Suspense fallback={<EventsListFallback />}>
                            <EventsList selectedSport={selectedSport ?? undefined} />
                        </Suspense>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}