'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SportsFilter } from './components/sports/sports-filter';
import { EventsList } from './components/events/events-list';
import { useRouter, useSearchParams } from 'next/navigation';
import { DollarSign } from 'lucide-react';
import { LoadingScreen } from '@/components/ui/spinner';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function EventsListFallback() {
  return <LoadingScreen />;
}

export default function Odds() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedSport = searchParams.get('sport');
    const [isLoading, setIsLoading] = useState(true);

    // Add effect to set default sport
    useEffect(() => {
        if (!selectedSport) {
            const params = new URLSearchParams(searchParams);
            params.set('sport', 'basketball_nba');
            router.push(`/odds?${params.toString()}`);
        }
    }, [selectedSport, searchParams, router]);

    const handleSportSelect = (sport: string) => {
        setIsLoading(true);
        const params = new URLSearchParams(searchParams);
        params.set('sport', sport);
        router.push(`/odds?${params.toString()}`);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 relative overflow-y-auto">
                    <div className="sticky top-0 z-10 m-4">
                        <div className="rounded-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50">
                            <div className="flex items-center justify-between h-14 px-4">
                                <div className="flex items-center space-x-4">
                                    <SidebarTrigger />
                                    <div className="flex items-center space-x-4">
                                        <DollarSign className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                                        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            Odds
                                        </h1>
                                    </div>
                                </div>
                                <ThemeToggle />
                            </div>
                            <div className="px-4 py-4">
                                {!isLoading && (
                                    <SportsFilter 
                                        onSportSelect={handleSportSelect}
                                        selectedSport={selectedSport ?? undefined}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <Suspense fallback={<EventsListFallback />}>
                            <EventsList 
                                selectedSport={selectedSport ?? undefined} 
                                onLoadingChange={setIsLoading}
                            />
                        </Suspense>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}
