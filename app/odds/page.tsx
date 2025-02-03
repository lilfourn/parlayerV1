'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SportsDisplay } from '../props/components/sports-display';
import { OddsInsights } from './components/odds-insights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, BookOpen } from 'lucide-react';

export default function OddsPage() {
    const [selectedSport, setSelectedSport] = useState<string | null>(null);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 relative overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
                        <div className="flex items-center h-14 px-4">
                            <SidebarTrigger />
                            <div className="flex items-center gap-2 px-2">
                                <Trophy className="h-5 w-5 text-blue-500" />
                                <h1 className="text-xl font-semibold text-gray-900">Sports Odds</h1>
                            </div>
                        </div>
                    </div>

                    <div className="transition-all duration-200 ease-in-out">
                        <div className="container mx-auto p-4 lg:p-6 max-w-[1600px]">
                            <div className="grid gap-6">
                                <Card className="bg-white shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-blue-500" />
                                            <CardTitle className="text-lg font-semibold">Select Sport</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Choose a sport to view available events, odds comparisons, and betting insights
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <SportsDisplay 
                                            onSportSelect={setSelectedSport}
                                            selectedSport={selectedSport}
                                        />
                                    </CardContent>
                                </Card>

                                {selectedSport && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-6">
                                            <OddsInsights sportKey={selectedSport} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}