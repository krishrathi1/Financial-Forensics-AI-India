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
}

export const fmpProvider = new FMPProvider(process.env.FMP_API_KEY || '');
