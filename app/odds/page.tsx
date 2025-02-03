'use client';
import React, { useState } from 'react';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SportsDisplay } from '../props/components/sports-display';
import { EventsDisplay } from './components/events-display';

export default function OddsPage() {
    const [selectedSport, setSelectedSport] = useState<string | null>(null);

    return (
        <div className="flex h-screen overflow-hidden">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 relative overflow-y-auto">
                    <SidebarTrigger />
                    <div className="p-4 space-y-8">
                        <SportsDisplay 
                            onSportSelect={setSelectedSport}
                            selectedSport={selectedSport}
                        />
                        <EventsDisplay sportKey={selectedSport} />
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}