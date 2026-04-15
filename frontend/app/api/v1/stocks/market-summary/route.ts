import { NextRequest, NextResponse } from 'next/server';
import { nseProvider } from '@/lib/providers/nse';

export async function GET(request: NextRequest) {
  try {
    // 1. Fetch NIFTY 500 (covers most of the market)
    const data = await nseProvider.getIndexHeatmap('NIFTY 500');
    
    if (!data || data.length === 0) {
      throw new Error('Failed to fetch NIFTY 500 index');
    }

    // 2. Sort to find Gainers and Losers
    const validData = data.filter(d => d.cmp > 0);
    const sortedByPerformance = [...validData].sort((a, b) => b.changePercent - a.changePercent);
    
    const gainers = sortedByPerformance.slice(0, 5);
    const losers = sortedByPerformance.slice().reverse().slice(0, 5);

    // 3. Calculate Market Mood (Breath + Momentum)
    // Breadth: Advance count vs Decline count
    const advanceCount = validData.filter(d => d.change > 0).length;
    const breadthScore = (advanceCount / validData.length) * 100;

    // Momentum: Average change percent (normalized to 100)
    const avgChangePercent = validData.reduce((sum, d) => sum + d.changePercent, 0) / validData.length;
    const momentumScore = Math.max(0, Math.min(100, 50 + avgChangePercent * 15));

    // Combine for MMI (Market Mood Index)
    const moodValue = Math.round(breadthScore * 0.6 + momentumScore * 0.4);

    return NextResponse.json({
      mood: moodValue,
      gainers,
      losers,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Market summary error:', error);
    return NextResponse.json(
      { detail: 'Failed to fetch market summary' },
      { status: 500 }
    );
  }
}
