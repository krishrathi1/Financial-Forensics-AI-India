export interface YahooChartPoint {
  date: string;
  close: number;
}

export class YahooProvider {
  async getStockChart(symbol: string, timeframe: string): Promise<YahooChartPoint[]> {
    const yahooSymbol = `${symbol.toUpperCase()}.NS`;
    
    let range = '1d';
    let interval = '5m';

    // Map timeframe to Yahoo parameters
    switch (timeframe) {
      case '1D': range = '1d'; interval = '5m'; break;
      case '1W': range = '5d'; interval = '15m'; break;
      case '1M': range = '1mo'; interval = '1d'; break;
      case '1Y': range = '1y'; interval = '1d'; break;
      case '5Y': range = '5y'; interval = '1wk'; break;
      default: range = '1d'; interval = '5m'; break;
    }

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${range}&interval=${interval}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        next: { revalidate: 300 }
      });

      if (!response.ok) return [];

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result || !result.timestamp) return [];

      const timestamps = result.timestamp;
      const quotes = result.indicators?.quote?.[0]?.close || [];

      return timestamps.map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString(),
        close: quotes[i] || 0,
      })).filter((p: YahooChartPoint) => p.close > 0);
    } catch (error) {
      console.error(`Failed to fetch Yahoo chart for ${symbol}:`, error);
      return [];
    }
  }
}

export const yahooProvider = new YahooProvider();
