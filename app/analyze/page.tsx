'use client';

import React, { useState, useEffect } from 'react';
import { ApiResponse } from '@/app/types/props';
import { DifferenceAnalysis } from './components/difference-analysis';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

async function getProjections(): Promise<ApiResponse> {
  const response = await fetch('/api/projections', {
    cache: 'no-store', // This ensures we get fresh data on each server render
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projections');
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch projections');
  }

  return result.data as ApiResponse;
}

export default function AnalyzePage() {
  const [initialData, setInitialData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjections() {
      try {
        setIsLoading(true);
        const data = await getProjections();
        setInitialData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjections();
  }, []);

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 relative">
            <SidebarTrigger />
            <div className="p-6">
              <h1 className="text-2xl font-bold text-red-600">Error Loading Projections</h1>
              <p className="mt-2 text-gray-600">{error}</p>
            </div>
          </main>
        </SidebarProvider>
      </div>
    );
  }

  if (isLoading || !initialData) {
    return (
      <div className="flex h-screen overflow-hidden">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 relative">
            <SidebarTrigger />
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </main>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 relative overflow-y-auto">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
            <div className="flex items-center h-14 px-4">
              <SidebarTrigger />
              <div className="ml-4 flex items-center space-x-4">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h1 className="text-lg font-semibold">Value Analysis</h1>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {error ? (
              <Card className="p-6">
                <div className="text-red-600 font-medium">{error}</div>
              </Card>
            ) : !initialData && isLoading ? (
              <Card className="p-6">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : initialData ? (
              <DifferenceAnalysis initialData={initialData} />
            ) : null}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}