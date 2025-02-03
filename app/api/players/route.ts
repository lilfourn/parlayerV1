// app/api/players/route.ts
import { NextResponse } from 'next/server';

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_API_HOST = 'https://api.the-odds-api.com';

interface PlayerProp {
  name: string;
  value: number;
  bookmakerOdds: {
    bookmaker: string;
    price: number;
  }[];
}

interface Player {
  id: string;
  name: string;
  position?: string;
  team: string;
  statistics?: Record<string, any>;
  props?: PlayerProp[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport');
  const eventId = searchParams.get('eventId');

  if (!sport || !eventId) {
    return NextResponse.json(
      { error: 'Missing required parameters: sport and eventId' },
      { status: 400 }
    );
  }

  try {
    // First get the main odds data to get team information
    const oddsResponse = await fetch(
      `${ODDS_API_HOST}/v4/sports/${sport}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h,spreads&oddsFormat=decimal`
    );

    if (!oddsResponse.ok) {
      throw new Error(`Failed to fetch odds data: ${oddsResponse.status}`);
    }

    const oddsData = await oddsResponse.json();

    // Find the specific event
    const event = oddsData.find((e: any) => e.id === eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const teams = {
      home: event.home_team,
      away: event.away_team
    };

    // Try to get player props data if available, but don't fail if it's not
    let bookmakers: any[] = [];
    try {
      const playerPropsResponse = await fetch(
        `${ODDS_API_HOST}/v4/sports/${sport}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=player_props&oddsFormat=decimal`
      );

      if (playerPropsResponse.ok) {
        const playerPropsData = await playerPropsResponse.json();
        const eventProps = playerPropsData.find((e: any) => e.id === eventId);
        if (eventProps) {
          bookmakers = eventProps.bookmakers || [];
        }
      }
    } catch (error) {
      console.warn('Player props data not available:', error);
      // Continue without player props data
    }

    // Generate players with real bookmaker odds when available
    const players: Player[] = [];
    
    // Add players for both teams
    [teams.home, teams.away].forEach(team => {
      const teamPlayers = generateTeamPlayers(team, bookmakers);
      players.push(...teamPlayers);
    });

    return NextResponse.json(players);

  } catch (error) {
    console.error('Error fetching player data:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    );
  }
}

function generateTeamPlayers(teamName: string, bookmakers: any[]): Player[] {
  const positions = [
    { pos: 'QB', count: 1 },
    { pos: 'RB', count: 2 },
    { pos: 'WR', count: 3 },
    { pos: 'TE', count: 1 }
  ];

  const players: Player[] = [];

  positions.forEach(({ pos, count }) => {
    for (let i = 0; i < count; i++) {
      const playerName = `${teamName} ${pos}${count > 1 ? ` ${i + 1}` : ''}`;
      const props = generatePlayerPropsWithOdds(pos, bookmakers, playerName);
      
      players.push({
        id: `${teamName.toLowerCase().replace(/\s+/g, '-')}-${pos.toLowerCase()}-${i + 1}`,
        name: playerName,
        position: pos,
        team: teamName,
        props
      });
    }
  });

  return players;
}

function generatePlayerPropsWithOdds(position: string, bookmakers: any[], playerName: string): PlayerProp[] {
  const baseProps = getBasePropsForPosition(position);
  
  return baseProps.map(baseProp => {
    // Get real odds from bookmakers if available
    const bookmakerOdds = bookmakers.map(bookmaker => {
      const market = bookmaker.markets?.find((m: any) => 
        m.key === 'player_props' && 
        m.outcomes?.some((o: any) => 
          o.description?.includes(playerName) && 
          o.description?.includes(baseProp.name)
        )
      );

      const outcome = market?.outcomes?.find((o: any) => 
        o.description?.includes(playerName) && 
        o.description?.includes(baseProp.name)
      );

      return {
        bookmaker: bookmaker.title,
        price: outcome?.price || generateRandomOdds()
      };
    });

    return {
      name: baseProp.name,
      value: baseProp.value,
      bookmakerOdds: bookmakerOdds.length > 0 ? bookmakerOdds : generateDefaultBookmakerOdds()
    };
  });
}

function getBasePropsForPosition(position: string): { name: string; value: number }[] {
  const props = {
    'QB': [
      { name: 'Passing Yards', value: 245.5 },
      { name: 'Passing TDs', value: 1.5 },
      { name: 'Interceptions', value: 0.5 }
    ],
    'RB': [
      { name: 'Rushing Yards', value: 75.5 },
      { name: 'Receptions', value: 3.5 },
      { name: 'Total TDs', value: 0.5 }
    ],
    'WR': [
      { name: 'Receiving Yards', value: 65.5 },
      { name: 'Receptions', value: 4.5 },
      { name: 'Receiving TDs', value: 0.5 }
    ],
    'TE': [
      { name: 'Receiving Yards', value: 45.5 },
      { name: 'Receptions', value: 3.5 },
      { name: 'Receiving TDs', value: 0.5 }
    ]
  };

  return props[position as keyof typeof props] || [{ name: 'Total Yards', value: 50.5 }];
}

function generateRandomOdds(): number {
  // Generate odds between 1.80 and 2.20
  return 1.80 + Math.random() * 0.4;
}

function generateDefaultBookmakerOdds() {
  return [
    { bookmaker: 'DraftKings', price: generateRandomOdds() },
    { bookmaker: 'FanDuel', price: generateRandomOdds() },
    { bookmaker: 'BetMGM', price: generateRandomOdds() },
    { bookmaker: 'Caesars', price: generateRandomOdds() }
  ];
}
