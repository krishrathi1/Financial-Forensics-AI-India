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
    const cleanSymbol = symbol.toUpperCase();
    
    // 1. Fetch data from all sources (NSE NextApi + FMP)
    // We try to fetch FMP with SYMBOL.NS immediately for better Indian market coverage
    const [
      nseQuote, 
      fmpMetrics, 
      fmpProfileArr,
      yearwisePerf,
      deepData,
      metaData,
      corpInfo
    ] = await Promise.all([
      nseProvider.getStockQuote(cleanSymbol),
      fmpProvider.getCompanyMetrics(cleanSymbol),
      fmpProvider.getCompanyProfile(cleanSymbol), // Already handles SYMBOL.NS in fmp.ts but we'll check it
      nseProvider.getYearwisePerformance(cleanSymbol),
      nseProvider.getSymbolDataDeep(cleanSymbol),
      nseProvider.getMetaData(cleanSymbol),
      nseProvider.getCorporateActions(cleanSymbol)
    ]);

    if (!nseQuote) {
      throw new Error(`Symbol ${cleanSymbol} not found on NSE`);
    }

    const priceInfo = nseQuote.priceInfo || {};
    const metadata = nseQuote.metadata || metaData || {};
    const securityInfo = nseQuote.securityInfo || {};
    const tradeInfo = nseQuote.marketDeptOrderBook?.tradeInfo || {};
    const deliveryData = deepData?.equityResponse?.deliveryData || {};
    const perf = (yearwisePerf && yearwisePerf[0]) || {};
    
    // Extract first profile if it's an array (typical FMP response)
    const fmpProfile = Array.isArray(fmpProfileArr) ? fmpProfileArr[0] : fmpProfileArr;

    const industry = fmpProfile?.industry || metadata.industry || 'N/A';

    // 2. Fetch chart and news
    let fmpChart = await fmpProvider.getStockChart(cleanSymbol, '1D');
    if (!fmpChart || fmpChart.length === 0) {
      fmpChart = await yahooProvider.getStockChart(cleanSymbol, '1D');
    }
    const stockNews = await newsProvider.getStockNews(cleanSymbol, industry);

    const history = (fmpChart || []).map((point: any) => ({
      date: point.date,
      close: point.close || 0,
    }));

    // 3. Technicals (Calculate Pivot Points)
    const high = priceInfo.intraDayHighLow?.max || priceInfo.high || 0;
    const low = priceInfo.intraDayHighLow?.min || priceInfo.low || 0;
    const close = priceInfo.lastPrice || 0;
    
    const pivot = (high + low + close) / 3;
    const technicals = {
      pivots: {
        standard: {
          p: pivot,
          r1: (2 * pivot) - low,
          r2: pivot + (high - low),
          r3: high + 2 * (pivot - low),
          s1: (2 * pivot) - high,
          s2: pivot - (high - low),
          s3: low - 2 * (high - pivot)
        },
        fibonacci: {
          p: pivot,
          r1: pivot + (0.382 * (high - low)),
          r2: pivot + (0.618 * (high - low)),
          r3: pivot + (1.000 * (high - low)),
          s1: pivot - (0.382 * (high - low)),
          s2: pivot - (0.618 * (high - low)),
          s3: pivot - (1.000 * (high - low))
        }
      }
    };

    // 4. Smart Score & Risk Score Logic
    const profitability = Math.min(5, (fmpMetrics?.returnOnEquityTTM || 0) * 10 + (fmpMetrics?.ebitdaMarginTTM || 0) * 5);
    const growth = Math.min(5, (fmpMetrics?.revenueGrowthTTM || 0) * 5 + (fmpMetrics?.epsgrowthTTM || 0) * 5);
    const momentum = Math.min(5, (priceInfo.pChange || 0) > 0 ? 4 : 2);
    const health = Math.min(5, 5 - (fmpMetrics?.debtToEquityTTM || 1) / 2);
    const valuation = Math.min(5, 5 - (fmpMetrics?.peRatioTTM || 20) / 40);

    const smartScore = (profitability + growth + momentum + health + valuation) / 5;

    const financialRisk = Math.min(5, (fmpMetrics?.debtToEquityTTM || 0));
    const priceTrendRisk = Math.min(5, Math.abs(priceInfo.pChange || 0) / 2);
    const riskScore = (financialRisk + priceTrendRisk + 2) / 3;

    // 5. Construct full real dashboard data
    const dashboardData = {
      symbol: cleanSymbol,
      companyName: metaData?.companyName || metadata.companyName || cleanSymbol,
      exchange: 'NSE',
      sector: metadata.sector || 'N/A',
      profile: {
        description: fmpProfile?.description || metadata.pdSectorInd || 'N/A',
        website: fmpProfile?.website || 'N/A',
        ceo: fmpProfile?.ceo || 'N/A',
        chairman: fmpProfile?.ceo || 'N/A', // Fallback to CEO as FMP usually maps the leader here
        employees: parseInt(fmpProfile?.fullTimeEmployees || '0') || 'N/A',
        industry: industry,
        incorporationYear: metaData?.activeSeries?.[0] || fmpProfile?.ipoDate?.substring(0, 4) || 'N/A',
        headquarters: fmpProfile?.city ? `${fmpProfile.city}, ${fmpProfile.country}` : metadata.address || 'N/A',
        marketCap: fmpProfile?.mktCap || deepData?.equityResponse?.totalMarketCap || 0,
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
      returns: {
        '1W': perf.one_week_chng_per || 0,
        '1M': perf.one_month_chng_per || 0,
        '6M': perf.six_month_chng_per || 0,
        '1Y': perf.one_year_chng_per || 0,
        '3Y': perf.three_year_chng_per || 0,
        '5Y': perf.five_year_chng_per || 0,
        heatmap: yearwisePerf || []
      },
      metrics: {
        marketCapCr: (fmpProfile?.mktCap || deepData?.equityResponse?.totalMarketCap || 0) / 10000000,
        peRatio: fmpMetrics?.peRatioTTM || 0,
        roe: (fmpMetrics?.returnOnEquityTTM || 0) * 100,
        roce: (fmpMetrics?.returnOnCapitalEmployedTTM || 0) * 100,
        dividendYield: (fmpMetrics?.dividendYieldTTM || 0) * 100,
        eps: fmpMetrics?.netIncomePerShareTTM || 0,
        faceValue: securityInfo.faceValue || 10,
        outstandingShares: (fmpProfile?.mktCap || deepData?.equityResponse?.totalMarketCap || 0) / (priceInfo.lastPrice || 1) / 10000000,
        deliveryPercent: deliveryData.deliveryToTradedQuantity || 0,
      },
      technicals: technicals,
      scores: {
        smart: smartScore,
        risk: riskScore,
        profitability, growth, valuation, momentum, health
      },
      corporateActions: corpInfo || {},
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

