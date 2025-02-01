import { NextResponse } from 'next/server'

export async function GET() {
  const API_URL = 'https://partner-api.prizepicks.com/projections?per_page=1000&include=new_player,stat_average,league'
  
  try {
    const response = await fetch(API_URL)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('API Response Data:', JSON.stringify(data, null, 2))

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Data fetched successfully'
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })

  } catch (error: unknown) {
    console.error('Fetch Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to fetch projections data'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
  }
}
