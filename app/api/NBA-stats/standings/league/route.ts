import { NextResponse } from "next/server";
import type { ApiResponse } from "../standings";

const BASE_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings";

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}?group=7`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch league standings: ${response.statusText}`);
    }

    const data = await response.json() as ApiResponse;

    return NextResponse.json({
      status: "success",
      response: data.response
    });
  } catch (error) {
    console.error("Error fetching league standings:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch league standings",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}