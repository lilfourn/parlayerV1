'use client';
import React from 'react';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { BarChart3 } from 'lucide-react';

export default function Results() {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 relative overflow-y-auto">
                    <div className="sticky top-0 z-10 m-4">
                        <div className="rounded-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50">
                            <div className="flex items-center justify-between h-14 px-4">
                                <div className="flex items-center space-x-4">
                                    <SidebarTrigger />
                                    <div className="flex items-center space-x-4">
                                        <BarChart3 className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                                        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            Results
                                        </h1>
                                    </div>
                                </div>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="max-w-7xl mx-auto space-y-6">
                            {/* Add your results content here */}
                        </div>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    );
}