import { NextRequest, NextResponse } from 'next/server';
import { nseProvider } from '@/lib/providers/nse';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const requestedSymbols = searchParams.get('symbols')?.split(',').filter(Boolean) || [];
    
    let finalData: Array<{ symbol: string; cmp: number; change: number; changePercent: number }> = [];

    // If "all" or no specific symbols are requested, fetch the Nifty 500 (A-Z)
    if (requestedSymbols.length === 0 || requestedSymbols.includes('all')) {
      const nifty500 = await nseProvider.getIndexHeatmap('NIFTY 500');
      if (nifty500 && nifty500.length > 0) {
        // Sort A-Z by symbol
        finalData = nifty500.sort((a, b) => a.symbol.localeCompare(b.symbol));
      }
    }

    // Add indices (Nifty 50, Sensex) if specifically requested or as a standard header
    if (requestedSymbols.some(s => s.toUpperCase().includes('NIFTY') || s.toUpperCase().includes('SENSEX'))) {
      const realIndices = await nseProvider.getAllIndices();
      
      const nifty50 = realIndices.find(idx => idx.symbol.toUpperCase() === 'NIFTY 50');
      if (nifty50) {
        // Find if already in data, if not push
        if (!finalData.some(d => d.symbol === 'NIFTY 50')) {
          finalData.unshift({
            symbol: 'NIFTY 50',
            cmp: nifty50.cmp,
            change: nifty50.change,
            changePercent: nifty50.changePercent
          });
        }

        // Add Sensex (BSE)
        const sensex = realIndices.find(idx => idx.symbol.toUpperCase() === 'S&P BSE SENSEX' || idx.symbol.toUpperCase().includes('SENSEX'));
        if (sensex) {
          finalData.unshift({
            symbol: 'BSE SENSEX',
            cmp: sensex.cmp,
            change: sensex.change,
            changePercent: sensex.changePercent
          });
        }
      }
    }

    // Fallback/Mock if everything failed
    if (finalData.length === 0) {
      finalData = [
        { symbol: 'RELIANCE', cmp: 2850, change: 45.50, changePercent: 1.62 },
        { symbol: 'TCS', cmp: 3920, change: 62.40, changePercent: 1.62 },
        { symbol: 'HDFCBANK', cmp: 1920, change: -15.25, changePercent: -0.78 },
        { symbol: 'INFY', cmp: 1850, change: 28.75, changePercent: 1.58 },
        { symbol: 'SBIN', cmp: 680, change: 12.50, changePercent: 1.86 },
      ].sort((a, b) => a.symbol.localeCompare(b.symbol));
    }

    return NextResponse.json({
      data: finalData,
    });
  } catch (error) {
    console.error('Ticker error:', error);
    return NextResponse.json(
      { detail: 'Failed to fetch ticker data' },
      { status: 500 }
    );
  }
}
