export default async function GET() {
    const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://nba-api-free-data.p.rapidapi.com/nba-player-stats',
  params: {
    playerid: '4869342'
  },
  headers: {
    'x-rapidapi-key': '498668d019msh8d5c3dfa8440cd6p1a2b07jsn51e2b2f77ade',
    'x-rapidapi-host': 'nba-api-free-data.p.rapidapi.com'
  }
};

try {
	const response = await axios.request(options);
	console.log(response.data);
} catch (error) {
	console.error(error);
}
}