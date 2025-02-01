'use client';
import React from 'react';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Dashboard(){
    return (
        <SidebarProvider>
            <AppSidebar />
        <main>
        <SidebarTrigger />
            

        </main>
        </SidebarProvider>
    )
}