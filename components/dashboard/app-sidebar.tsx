import { WalletCards, PersonStanding, Percent, Trophy, Clock } from "lucide-react";
import React from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "My Picks",
    url: "/dashboard",
    icon: WalletCards,
  },
  {
    title: "Props",
    url: "/props",
    icon: PersonStanding,
  },
  {
    title: "Odds",
    url: "/odds",
    icon: Percent,
  },
  {
    title: "Historical Odds",
    url: "/historicalOdds",
    icon: Clock,
  },
  {
    title: "Results",
    url: "/results",
    icon: Trophy,
  }
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Parlayer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
} 