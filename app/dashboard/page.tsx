'use client';
import React from 'react';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { BetSlipsManager } from '@/components/dashboard/bet-slips-manager';
import { motion } from 'framer-motion';

export default function Dashboard(){
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
                                    <motion.div 
                                        className="flex items-center space-x-4"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <LayoutDashboard className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                                        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            Dashboard
                                        </h1>
                                    </motion.div>
                                </div>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>

                    <motion.div 
                        className="p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="max-w-7xl mx-auto space-y-6">
                            <StatsOverview />
                            <BetSlipsManager />
                        </div>
                    </motion.div>
                </main>
            </SidebarProvider>
        </div>
    )
}