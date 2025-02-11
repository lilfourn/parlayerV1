'use client';
import React from 'react';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SelectedProjections } from '@/components/dashboard/selected-projections';
import { LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Dashboard(){
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 relative overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                        <div className="flex items-center justify-between h-14 px-4">
                            <div className="flex items-center space-x-4">
                                <SidebarTrigger />
                                <div className="flex items-center space-x-4">
                                    <LayoutDashboard className="h-5 w-5 text-primary" />
                                    <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="max-w-7xl mx-auto space-y-6">
                            <SelectedProjections />
                        </div>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    )
}