import { type Projection, type StatAverage } from '@/app/props/types';

async function testProjections() {
  try {
    console.log('Fetching projections...');
    const response = await fetch('http://localhost:3000/api/projections');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`API error: ${data.message}`);
    }
    
    // Log stats about the connections
    console.log('\nConnection Stats:');
    console.log('----------------');
    console.log(`Total Stat Averages: ${data.stats?.totalStatAverages ?? 'N/A'}`);
    console.log(`Total Connections: ${data.stats?.totalConnections ?? 'N/A'}`);
    
    // Log a sample connection
    if (data.stats?.connectedData?.[0]) {
      const sample = data.stats.connectedData[0];
      console.log('\nSample Connection:');
      console.log('----------------');
      console.log('Projection ID:', sample.projection.id);
      console.log('Stat Average:', sample.statAverage ? {
        id: sample.statAverage.id,
        average: sample.statAverage.attributes.average,
        count: sample.statAverage.attributes.count
      } : 'No stat average connected');
    }
    
  } catch (error) {
    console.error('Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testProjections();
