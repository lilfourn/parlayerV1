import { NextResponse } from "next/server";

interface NBATeam {
  id: string;
  name: string;
  shortName: string;
  abbrev: string;
  logo: string;
  logoDark: string;
  conference: string;
  division: string;
}

const NBA_TEAMS: NBATeam[] = [
  // Atlantic Division
  {
    id: "2",
    name: "Boston Celtics",
    shortName: "Celtics",
    abbrev: "bos",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/bos.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/bos.png",
    conference: "Eastern",
    division: "Atlantic"
  },
  {
    id: "17",
    name: "Brooklyn Nets",
    shortName: "Nets",
    abbrev: "bkn",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/bkn.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/bkn.png",
    conference: "Eastern",
    division: "Atlantic"
  },
  {
    id: "18",
    name: "New York Knicks",
    shortName: "Knicks",
    abbrev: "ny",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/ny.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/ny.png",
    conference: "Eastern",
    division: "Atlantic"
  },
  {
    id: "20",
    name: "Philadelphia 76ers",
    shortName: "76ers",
    abbrev: "phi",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/phi.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/phi.png",
    conference: "Eastern",
    division: "Atlantic"
  },
  {
    id: "28",
    name: "Toronto Raptors",
    shortName: "Raptors",
    abbrev: "tor",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/tor.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/tor.png",
    conference: "Eastern",
    division: "Atlantic"
  },

  // Central Division
  {
    id: "4",
    name: "Chicago Bulls",
    shortName: "Bulls",
    abbrev: "chi",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/chi.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/chi.png",
    conference: "Eastern",
    division: "Central"
  },
  {
    id: "5",
    name: "Cleveland Cavaliers",
    shortName: "Cavaliers",
    abbrev: "cle",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/cle.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/cle.png",
    conference: "Eastern",
    division: "Central"
  },
  {
    id: "8",
    name: "Detroit Pistons",
    shortName: "Pistons",
    abbrev: "det",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/det.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/det.png",
    conference: "Eastern",
    division: "Central"
  },
  {
    id: "11",
    name: "Indiana Pacers",
    shortName: "Pacers",
    abbrev: "ind",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/ind.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/ind.png",
    conference: "Eastern",
    division: "Central"
  },
  {
    id: "15",
    name: "Milwaukee Bucks",
    shortName: "Bucks",
    abbrev: "mil",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/mil.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/mil.png",
    conference: "Eastern",
    division: "Central"
  },

  // Southeast Division
  {
    id: "1",
    name: "Atlanta Hawks",
    shortName: "Hawks",
    abbrev: "atl",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/atl.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/atl.png",
    conference: "Eastern",
    division: "Southeast"
  },
  {
    id: "30",
    name: "Charlotte Hornets",
    shortName: "Hornets",
    abbrev: "cha",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/cha.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/cha.png",
    conference: "Eastern",
    division: "Southeast"
  },
  {
    id: "14",
    name: "Miami Heat",
    shortName: "Heat",
    abbrev: "mia",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/mia.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/mia.png",
    conference: "Eastern",
    division: "Southeast"
  },
  {
    id: "19",
    name: "Orlando Magic",
    shortName: "Magic",
    abbrev: "orl",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/orl.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/orl.png",
    conference: "Eastern",
    division: "Southeast"
  },
  {
    id: "27",
    name: "Washington Wizards",
    shortName: "Wizards",
    abbrev: "wsh",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/wsh.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/wsh.png",
    conference: "Eastern",
    division: "Southeast"
  },

  // Pacific Division
  {
    id: "9",
    name: "Golden State Warriors",
    shortName: "Warriors",
    abbrev: "gs",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/gs.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/gs.png",
    conference: "Western",
    division: "Pacific"
  },
  {
    id: "12",
    name: "LA Clippers",
    shortName: "Clippers",
    abbrev: "lac",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/lac.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/lac.png",
    conference: "Western",
    division: "Pacific"
  },
  {
    id: "13",
    name: "Los Angeles Lakers",
    shortName: "Lakers",
    abbrev: "lal",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/lal.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/lal.png",
    conference: "Western",
    division: "Pacific"
  },
  {
    id: "21",
    name: "Phoenix Suns",
    shortName: "Suns",
    abbrev: "phx",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/phx.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/phx.png",
    conference: "Western",
    division: "Pacific"
  },
  {
    id: "23",
    name: "Sacramento Kings",
    shortName: "Kings",
    abbrev: "sac",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/sac.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/sac.png",
    conference: "Western",
    division: "Pacific"
  },

  // Northwest Division
  {
    id: "7",
    name: "Denver Nuggets",
    shortName: "Nuggets",
    abbrev: "den",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/den.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/den.png",
    conference: "Western",
    division: "Northwest"
  },
  {
    id: "16",
    name: "Minnesota Timberwolves",
    shortName: "Timberwolves",
    abbrev: "min",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/min.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/min.png",
    conference: "Western",
    division: "Northwest"
  },
  {
    id: "25",
    name: "Oklahoma City Thunder",
    shortName: "Thunder",
    abbrev: "okc",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/okc.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/okc.png",
    conference: "Western",
    division: "Northwest"
  },
  {
    id: "22",
    name: "Portland Trail Blazers",
    shortName: "Trail Blazers",
    abbrev: "por",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/por.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/por.png",
    conference: "Western",
    division: "Northwest"
  },
  {
    id: "26",
    name: "Utah Jazz",
    shortName: "Jazz",
    abbrev: "utah",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/utah.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/utah.png",
    conference: "Western",
    division: "Northwest"
  },

  // Southwest Division
  {
    id: "6",
    name: "Dallas Mavericks",
    shortName: "Mavericks",
    abbrev: "dal",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/dal.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/dal.png",
    conference: "Western",
    division: "Southwest"
  },
  {
    id: "10",
    name: "Houston Rockets",
    shortName: "Rockets",
    abbrev: "hou",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/hou.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/hou.png",
    conference: "Western",
    division: "Southwest"
  },
  {
    id: "29",
    name: "Memphis Grizzlies",
    shortName: "Grizzlies",
    abbrev: "mem",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/mem.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/mem.png",
    conference: "Western",
    division: "Southwest"
  },
  {
    id: "3",
    name: "New Orleans Pelicans",
    shortName: "Pelicans",
    abbrev: "no",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/no.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/no.png",
    conference: "Western",
    division: "Southwest"
  },
  {
    id: "24",
    name: "San Antonio Spurs",
    shortName: "Spurs",
    abbrev: "sa",
    logo: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/sa.png",
    logoDark: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500-dark/sa.png",
    conference: "Western",
    division: "Southwest"
  }
];

export async function GET() {
  try {
    console.log('Fetching NBA teams...');
    return NextResponse.json({
      status: "success",
      response: {
        teamList: NBA_TEAMS
      }
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({
      status: "error",
      message: "Failed to fetch teams"
    }, { status: 500 });
  }
}