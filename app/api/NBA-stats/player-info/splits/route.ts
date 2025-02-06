import { NextResponse } from "next/server";
import type { SplitsApiResponse } from "../player-info";

const BASE_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/athletes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");
    const season = searchParams.get("season") || "2025";
    const category = searchParams.get("category") || "perGame";

    if (!playerId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Player ID is required"
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BASE_URL}/${playerId}/splits/_/season/${season}/category/${category}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch player splits: ${response.statusText}`);
    }

    const data = await response.json() as SplitsApiResponse;

    return NextResponse.json({
      status: "success",
      response: data.response
    });
  } catch (error) {
    console.error("Error fetching player splits:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch player splits",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}