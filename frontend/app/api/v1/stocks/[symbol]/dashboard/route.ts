import { NextRequest, NextResponse } from 'next/server';
import { nseProvider } from '@/lib/providers/nse';
import { fmpProvider } from '@/lib/providers/fmp';
import { newsProvider } from '@/lib/providers/news';

export async function GET(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const { symbol } = await params;
    
    // 1. Fetch live quote and chart from NSE
    const [nseQuote, nseChart] = await Promise.all([
      nseProvider.getStockQuote(symbol),
      nseProvider.getStockChart(symbol, '1D')
    ]);
    
    // 2. Fetch fundamentals and news
    const [fmpMetrics, fmpProfile, stockNews] = await Promise.all([
      fmpProvider.getCompanyMetrics(symbol),
      fmpProvider.getCompanyProfile(symbol),
      newsProvider.getStockNews(symbol)
    ]);

    if (!nseQuote) {
      throw new Error(`Symbol ${symbol} not found on NSE`);
    }

    const priceInfo = nseQuote.priceInfo || {};
    const metadata = nseQuote.metadata || {};
    const securityInfo = nseQuote.securityInfo || {};
    const tradeInfo = nseQuote.marketDeptOrderBook?.tradeInfo || {};

    const graphData = nseChart?.grapthData || [];
    const history = graphData.map((point: any[]) => ({
      date: new Date(point[0]).toISOString(),
      close: Number(point[1]) || 0,
    }));

    // 3. Construct full real dashboard data
    const dashboardData = {
      symbol: symbol.toUpperCase(),
      companyName: metadata.companyName || symbol.toUpperCase(),
      exchange: 'NSE',
      sector: metadata.sector || 'N/A',
      profile: {
        description: fmpProfile?.description || metadata.pdSectorInd || 'N/A',
        website: fmpProfile?.website || 'N/A',
        ceo: fmpProfile?.ceo || 'N/A',
        chairman: 'N/A',
        employees: fmpProfile?.fullTimeEmployees || 'N/A',
        industry: fmpProfile?.industry || metadata.industry || 'N/A',
        incorporationYear: 'N/A',
        headquarters: fmpProfile?.city ? `${fmpProfile.city}, ${fmpProfile.country}` : 'N/A',
        previousName: 'N/A',
        marketCap: fmpProfile?.mktCap || 0,
      },
      price: {
        cmp: priceInfo.lastPrice || 0,
        change: priceInfo.change || 0,
        changePercent: priceInfo.pChange || 0,
        fiftyTwoWeekLow: tradeInfo.fiftyTwoWeekLow || 0,
        fiftyTwoWeekHigh: tradeInfo.fiftyTwoWeekHigh || 0,
        currency: 'INR',
        history: history,
        intraday: history // For 1D view
      },
      metrics: {
        marketCapCr: (fmpProfile?.mktCap || 0) / 10000000,
        peRatio: fmpMetrics?.peRatioTTM || 0,
        pegRatio: fmpMetrics?.pegRatioTTM || 0,
        roe: (fmpMetrics?.returnOnEquityTTM || 0) * 100,
        roce: (fmpMetrics?.returnOnCapitalEmployedTTM || 0) * 100,
        roa: (fmpMetrics?.returnOnAssetsTTM || 0) * 100,
        ebitdaMargin: (fmpMetrics?.ebitdaMarginTTM || 0) * 100,
        dividendYield: (fmpMetrics?.dividendYieldTTM || 0) * 100,
        eps: fmpMetrics?.netIncomePerShareTTM || 0,
        faceValue: securityInfo.faceValue || 10,
        bookValue: fmpMetrics?.bookValuePerShareTTM || 0,
        evToSales: fmpMetrics?.evToSalesTTM || 0,
        outstandingShares: (fmpProfile?.mktCap || 0) / (priceInfo.lastPrice || 1) / 10000000, // Est in Cr
      },
      financials: {
        marketCapCr: (fmpProfile?.mktCap || 0) / 10000000,
        peRatio: fmpMetrics?.peRatioTTM || 0,
        roe: (fmpMetrics?.returnOnEquityTTM || 0) * 100,
        roce: (fmpMetrics?.returnOnCapitalEmployedTTM || 0) * 100,
        dividendYield: (fmpMetrics?.dividendYieldTTM || 0) * 100,
      },
      news: stockNews,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      cached: false,
      data: dashboardData,
      updatedAt: dashboardData.updatedAt
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
