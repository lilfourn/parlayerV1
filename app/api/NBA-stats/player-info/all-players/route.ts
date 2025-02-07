import { NextRequest, NextResponse } from "next/server";

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({
        status: "error",
        message: "Team ID is required"
      }, { status: 400 });
    }

    // ESPN API endpoint for team roster
    const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/roster`;
    console.log('Fetching roster from:', url);

    const response = await fetch(url);
    if (!response.ok) {
      console.error('ESPN API error:', response.status, response.statusText);
      throw new Error('Failed to fetch team roster');
    }

    const data = await response.json();
    console.log('Received roster data for team:', teamId);

    const athletes = data.athletes || [];
    console.log('Number of players found:', athletes.length);

    // Parse and format player data
    const players: Player[] = athletes.map((athlete: any) => ({
      id: athlete.id,
      name: `${athlete.firstName} ${athlete.lastName}`,
      position: athlete.position?.abbreviation || 'N/A',
      jersey_number: athlete.jersey || 'N/A'
    }));

    return NextResponse.json({
      status: "success",
      response: {
        PlayerList: players
      }
    });

  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({
      status: "error",
      message: "Failed to fetch players"
    }, { status: 500 });
  }
}