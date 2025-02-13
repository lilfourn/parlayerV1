import { NextResponse } from 'next/server';
import { type ProcessedProjection } from '@/app/types/props';

export async function GET() {
  try {
    // TODO: Implement logic to fetch top decisions
    // For now, return an empty array
    const projections: ProcessedProjection[] = [];
    
    return NextResponse.json({ projections });
  } catch (error) {
    console.error('Error fetching top decisions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top decisions' },
      { status: 500 }
    );
  }
}
