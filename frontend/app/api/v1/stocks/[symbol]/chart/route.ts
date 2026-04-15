import { NextRequest, NextResponse } from 'next/server';
import { nseProvider } from '@/lib/providers/nse';

export async function GET(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const { symbol } = await params;
    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days') || '1D';

    const data = await nseProvider.getStockChart(symbol, days);
    
    if (!data || !data.grapthData) {
      // Try with EQ suffix if direct symbol failed (common for some NSE stocks in this specific endpoint)
      const dataFallback = await nseProvider.getStockChart(symbol + 'EQ', days);
      if (dataFallback && dataFallback.grapthData) {
        return handleChartData(dataFallback, symbol);
      }
      throw new Error(`Chart data not found for ${symbol}`);
    }

    return handleChartData(data, symbol);
  } catch (error) {
    console.error('Chart data error:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}

function handleChartData(data: any, symbol: string) {
  const graphData = data.grapthData || [];
  
  // Transform NSE graph data to PriceChart format
  // NSE format: [timestamp, price]
  const transformedHistory = graphData.map((point: any[]) => {
    return {
      date: new Date(point[0]).toISOString(),
      close: Number(point[1]) || 0,
    };
  });

  return NextResponse.json({
    identifier: symbol,
    name: symbol.toUpperCase(),
    graphData: graphData,
    history: transformedHistory,
    closePrice: data.closePrice || null,
    timestamp: new Date().toISOString(),
  });
}
