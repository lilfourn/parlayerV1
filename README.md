# ParLayer - Sports Odds and Player Props Platform

A modern, responsive web application built with Next.js 14 that provides real-time sports odds and player props data across multiple sports leagues.

## Features

- 🏃‍♂️ Real-time sports odds and player props
- 📊 Advanced statistical analysis and tracking
- 🎯 Top player props highlighting
- 🏈 Multi-sport support (NFL, NBA, MLB, NHL, Soccer)
- 📱 Responsive design for all devices
- ⚡ Server-side rendering for optimal performance

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: 
  - Shadcn UI
  - Radix UI Primitives
- **State Management**: React Hooks
- **Data Fetching**: Server Components + API Routes

## Prerequisites

- Node.js 18.17 or later
- Yarn package manager
- [The Odds API](https://the-odds-api.com) account and API key

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/parlayer.git
   cd parlayer

2. Install dependencies:
    yarn install

3. Set up environement variables:
    cp .env.example .env.local

4. Run developement server:
    yarn dev

5. Open https://localhost:3000 in your browser

    parlayer/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── odds/              # Odds-related pages and components
│   ├── props/             # Player props components
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
├── lib/                   # Utility functions and helpers
├── public/               # Static assets
└── types/                # TypeScript type definitions

