import { NextResponse } from "next/server";
import type { DetailedApiResponse } from "../player-info";

const BASE_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/athletes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");

    if (!playerId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Player ID is required"
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/${playerId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch player info: ${response.statusText}`);
    }

    const data = await response.json() as DetailedApiResponse;

    return NextResponse.json({
      status: "success",
      response: data.response
    });
  } catch (error) {
    console.error("Error fetching player info:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch player info",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}