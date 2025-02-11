'use client';

import React, { useState, useEffect } from 'react';
import { ApiResponse } from '@/app/types/props';
import { DifferenceAnalysis } from './components/difference-analysis';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { LoadingScreen } from "@/components/ui/spinner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
              <div className="w-full max-w-lg mx-auto">
                <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 sm:p-8 transition-all duration-200 ease-in-out hover:shadow-md">
                  <div className="text-center space-y-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-red-600">Error Loading Projections</h2>
                    <p className="text-base sm:text-lg text-foreground">{error}</p>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Please wait a moment and try refreshing the page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (isLoading || !initialData) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <LoadingScreen />
      </SidebarProvider>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 relative overflow-y-auto">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
            <div className="flex items-center justify-between h-14 px-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div className="flex items-center space-x-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h1 className="text-lg font-semibold text-foreground">Value Analysis</h1>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {error ? (
              <Card className="p-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h2>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              </Card>
            ) : (
              <DifferenceAnalysis initialData={initialData} />
            )}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
