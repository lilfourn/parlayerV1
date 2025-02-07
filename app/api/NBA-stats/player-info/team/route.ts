import { NextResponse } from "next/server";

const NBA_TEAMS = [
  // Eastern Conference
  { id: "1", name: "Atlanta Hawks", abbreviation: "ATL", conference: "Eastern", division: "Southeast" },
  { id: "2", name: "Boston Celtics", abbreviation: "BOS", conference: "Eastern", division: "Atlantic" },
  { id: "3", name: "Brooklyn Nets", abbreviation: "BKN", conference: "Eastern", division: "Atlantic" },
  { id: "4", name: "Charlotte Hornets", abbreviation: "CHA", conference: "Eastern", division: "Southeast" },
  { id: "5", name: "Chicago Bulls", abbreviation: "CHI", conference: "Eastern", division: "Central" },
  { id: "6", name: "Cleveland Cavaliers", abbreviation: "CLE", conference: "Eastern", division: "Central" },
  { id: "7", name: "Detroit Pistons", abbreviation: "DET", conference: "Eastern", division: "Central" },
  { id: "8", name: "Indiana Pacers", abbreviation: "IND", conference: "Eastern", division: "Central" },
  { id: "9", name: "Miami Heat", abbreviation: "MIA", conference: "Eastern", division: "Southeast" },
  { id: "10", name: "Milwaukee Bucks", abbreviation: "MIL", conference: "Eastern", division: "Central" },
  { id: "11", name: "New York Knicks", abbreviation: "NYK", conference: "Eastern", division: "Atlantic" },
  { id: "12", name: "Orlando Magic", abbreviation: "ORL", conference: "Eastern", division: "Southeast" },
  { id: "13", name: "Philadelphia 76ers", abbreviation: "PHI", conference: "Eastern", division: "Atlantic" },
  { id: "14", name: "Toronto Raptors", abbreviation: "TOR", conference: "Eastern", division: "Atlantic" },
  { id: "15", name: "Washington Wizards", abbreviation: "WAS", conference: "Eastern", division: "Southeast" },
  
  // Western Conference
  { id: "16", name: "Dallas Mavericks", abbreviation: "DAL", conference: "Western", division: "Southwest" },
  { id: "17", name: "Denver Nuggets", abbreviation: "DEN", conference: "Western", division: "Northwest" },
  { id: "18", name: "Golden State Warriors", abbreviation: "GSW", conference: "Western", division: "Pacific" },
  { id: "19", name: "Houston Rockets", abbreviation: "HOU", conference: "Western", division: "Southwest" },
  { id: "20", name: "Los Angeles Clippers", abbreviation: "LAC", conference: "Western", division: "Pacific" },
  { id: "21", name: "Los Angeles Lakers", abbreviation: "LAL", conference: "Western", division: "Pacific" },
  { id: "22", name: "Memphis Grizzlies", abbreviation: "MEM", conference: "Western", division: "Southwest" },
  { id: "23", name: "Minnesota Timberwolves", abbreviation: "MIN", conference: "Western", division: "Northwest" },
  { id: "24", name: "New Orleans Pelicans", abbreviation: "NOP", conference: "Western", division: "Southwest" },
  { id: "25", name: "Oklahoma City Thunder", abbreviation: "OKC", conference: "Western", division: "Northwest" },
  { id: "26", name: "Phoenix Suns", abbreviation: "PHX", conference: "Western", division: "Pacific" },
  { id: "27", name: "Portland Trail Blazers", abbreviation: "POR", conference: "Western", division: "Northwest" },
  { id: "28", name: "Sacramento Kings", abbreviation: "SAC", conference: "Western", division: "Pacific" },
  { id: "29", name: "San Antonio Spurs", abbreviation: "SAS", conference: "Western", division: "Southwest" },
  { id: "30", name: "Utah Jazz", abbreviation: "UTA", conference: "Western", division: "Northwest" },
];

export async function GET() {
  return NextResponse.json({
    status: "success",
    teams: NBA_TEAMS
  });
}