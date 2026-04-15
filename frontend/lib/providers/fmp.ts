export class FMPProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCompanyMetrics(symbol: string): Promise<any> {
    if (!this.apiKey) return null;

    // FMP uses symbol.NS for NSE stocks
    const fmpSymbol = `${symbol.toUpperCase()}.NS`;
    const url = `https://financialmodelingprep.com/api/v3/key-metrics-ttm/${fmpSymbol}?apikey=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        next: { revalidate: 3600 } // Fundamentals don't change often, 1 hour cache
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`Failed to fetch FMP metrics for ${symbol}:`, error);
      return null;
    }
  }

  async getCompanyProfile(symbol: string): Promise<any> {
    if (!this.apiKey) return null;

    const fmpSymbol = `${symbol.toUpperCase()}.NS`;
    const url = `https://financialmodelingprep.com/api/v3/profile/${fmpSymbol}?apikey=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        next: { revalidate: 86400 } // Profile info changes very rarely, 24 hour cache
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`Failed to fetch FMP profile for ${symbol}:`, error);
      return null;
    }
  }

  async getStockChart(symbol: string, timeframe: string): Promise<any[]> {
    if (!this.apiKey) return [];

    const fmpSymbol = `${symbol.toUpperCase()}.NS`;
    let url = "";
    
    // Select appropriate FMP endpoint based on timeframe
    if (timeframe === '1D') {
      url = `https://financialmodelingprep.com/api/v3/historical-chart/5min/${fmpSymbol}?apikey=${this.apiKey}`;
    } else {
      url = `https://financialmodelingprep.com/api/v3/historical-price-full/${fmpSymbol}?apikey=${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        next: { revalidate: 300 } // 5 minute cache
      });

      if (!response.ok) return [];
      const data = await response.json();
      
      let points = [];
      if (timeframe === '1D') {
        points = Array.isArray(data) ? data : [];
      } else {
        points = data.historical || [];
      }

      return points.map((p: any) => ({
        date: p.date,
        close: p.close || p.adjClose || 0,
      })).reverse(); // FMP returns newest first, we want oldest first for charts
    } catch (error) {
      console.error(`Failed to fetch FMP chart for ${symbol}:`, error);
      return [];
    }
  }
}

export const fmpProvider = new FMPProvider(process.env.FMP_API_KEY || '');
