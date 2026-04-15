import { NextRequest, NextResponse } from 'next/server';
import { fmpProvider } from '@/lib/providers/fmp';
import { yahooProvider } from '@/lib/providers/yahoo';
import { nseProvider } from '@/lib/providers/nse';

export async function GET(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const { symbol } = await params;
    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days') || '1D';

    // Hierarchy 1: Try FMP (Most detailed for Global/US, good for some IN)
    let history = await fmpProvider.getStockChart(symbol, days);
    
    // Hierarchy 2: Try Yahoo Finance (Best robust fallback for IN midcaps)
    if (!history || history.length === 0) {
      console.log(`[ChartAPI] FMP failed for ${symbol}, trying Yahoo...`);
      history = await yahooProvider.getStockChart(symbol, days);
    }

    // Hierarchy 3: Try NSE (Last resort for intraday if others fail)
    if (!history || history.length === 0) {
      console.log(`[ChartAPI] Yahoo failed for ${symbol}, trying NSE...`);
      const nseData = await nseProvider.getStockChart(symbol, days);
      if (nseData && nseData.grapthData) {
        history = nseData.grapthData.map((p: any[]) => ({
          date: new Date(p[0]).toISOString(),
          close: Number(p[1]) || 0,
        }));
      }
    }
    
    if (!history || history.length === 0) {
      // Return empty successful response rather than 500 to keep UI stable
      return NextResponse.json({
        identifier: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        history: [],
        timestamp: new Date().toISOString(),
        error: "No chart data available"
      });
    }

    return NextResponse.json({
      identifier: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      history: history,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chart data error:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
