import { NextRequest, NextResponse } from 'next/server';
import { nseProvider } from '@/lib/providers/nse';
import { fmpProvider } from '@/lib/providers/fmp';
import { newsProvider } from '@/lib/providers/news';
import { yahooProvider } from '@/lib/providers/yahoo';

export async function GET(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const { symbol } = await params;
    
    // 1. Fetch data from primary sources
    const [nseQuote, fmpMetrics, fmpProfile] = await Promise.all([
      nseProvider.getStockQuote(symbol),
      fmpProvider.getCompanyMetrics(symbol),
      fmpProvider.getCompanyProfile(symbol)
    ]);

    if (!nseQuote) {
      throw new Error(`Symbol ${symbol} not found on NSE`);
    }

    const metadata = nseQuote.metadata || {};
    const industry = fmpProfile?.industry || metadata.industry || 'N/A';

    // 2. Fetch chart and news with fallbacks
    // First try FMP for chart, fallback to Yahoo
    let fmpChart = await fmpProvider.getStockChart(symbol, '1D');
    if (!fmpChart || fmpChart.length === 0) {
      fmpChart = await yahooProvider.getStockChart(symbol, '1D');
    }

    // Pass the industry to news for better fallbacks
    const stockNews = await newsProvider.getStockNews(symbol, industry);

    const priceInfo = nseQuote.priceInfo || {};
    const securityInfo = nseQuote.securityInfo || {};
    const tradeInfo = nseQuote.marketDeptOrderBook?.tradeInfo || {};

    const history = (fmpChart || []).map((point: any) => ({
      date: point.date,
      close: point.close || 0,
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
        industry: industry,
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
        intraday: history
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
        outstandingShares: (fmpProfile?.mktCap || 0) / (priceInfo.lastPrice || 1) / 10000000,
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
