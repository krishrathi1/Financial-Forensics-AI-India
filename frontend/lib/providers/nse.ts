const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
  'accept': 'application/json, text/plain, */*',
  'referer': 'https://www.nseindia.com/',
  'x-requested-with': 'XMLHttpRequest',
};

export interface HeatmapRow {
  symbol: string;
  cmp: number;
  change: number;
  changePercent: number;
}

export class NSEProvider {
  private cookies: string | null = null;

  private async ensureCookies(): Promise<string> {
    if (this.cookies) return this.cookies;

    try {
      const response = await fetch('https://www.nseindia.com', {
        headers: NSE_HEADERS,
        next: { revalidate: 3600 } // Cache cookies for an hour
      });
      
      const setCookie = response.headers.get('set-cookie');
      this.cookies = setCookie || '';
      return this.cookies;
    } catch (error) {
      console.error('NSE Cookie fetch failed:', error);
      return '';
    }
  }

  async getIndexHeatmap(indexName: string): Promise<HeatmapRow[]> {
    const cookies = await this.ensureCookies();
    const url = `https://www.nseindia.com/api/equity-stockIndices?index=${encodeURIComponent(indexName)}`;

    try {
      const response = await fetch(url, {
        headers: {
          ...NSE_HEADERS,
          Cookie: cookies,
        },
        next: { revalidate: 60 } // Cache data for 60 seconds
      });

      if (!response.ok) {
        throw new Error(`NSE API returned status: ${response.status}`);
      }

      const payload = await response.json();
      const data = payload?.data || [];
      
      const rows: HeatmapRow[] = data
        .filter((item: any) => {
          const symbol = (item.symbol || '').trim().toUpperCase();
          return symbol && symbol !== indexName.toUpperCase();
        })
        .map((item: any) => ({
          symbol: item.symbol,
          cmp: parseFloat(item.lastPrice) || 0,
          change: parseFloat(item.change) || 0,
          changePercent: parseFloat(item.pChange) || 0,
        }))
        .filter((row: HeatmapRow) => row.cmp > 0);

      // Sort by percent change descending
      return rows.sort((a, b) => b.changePercent - a.changePercent);
    } catch (error) {
      console.error(`Failed to fetch NSE index ${indexName}:`, error);
      return [];
    }
  }

  async getAllIndices(): Promise<HeatmapRow[]> {
    const cookies = await this.ensureCookies();
    const url = 'https://www.nseindia.com/api/allIndices';

    try {
      const response = await fetch(url, {
        headers: {
          ...NSE_HEADERS,
          Cookie: cookies,
        },
        next: { revalidate: 60 }
      });

      if (!response.ok) return [];

      const payload = await response.json();
      const data = payload?.data || [];

      return data.map((item: any) => ({
        symbol: (item.index || '').trim(),
        cmp: parseFloat(item.last) || 0,
        change: parseFloat(item.variation) || 0,
        changePercent: parseFloat(item.percentChange) || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch all NSE indices:', error);
      return [];
    }
  }

  async getStockQuote(symbol: string): Promise<any> {
    const cookies = await this.ensureCookies();
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(symbol.toUpperCase())}`;

    try {
      const response = await fetch(url, {
        headers: {
          ...NSE_HEADERS,
          Cookie: cookies,
        },
        next: { revalidate: 300 } // 5 minutes cache
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch NSE quote for ${symbol}:`, error);
      return null;
    }
  }

  async getStockChart(symbol: string, timeframe: string = '1D'): Promise<any> {
    const cookies = await this.ensureCookies();
    
    // For stocks, we try the symbol directly, as identified in research.
    const url = `https://www.nseindia.com/api/chart-databyindex?index=${encodeURIComponent(symbol.toUpperCase())}&indices=false`;

    try {
      const response = await fetch(url, {
        headers: {
          ...NSE_HEADERS,
          Cookie: cookies,
        },
        next: { revalidate: 300 }
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch NSE chart for ${symbol}:`, error);
      return null;
    }
  }

  async getSymbolDataDeep(symbol: string): Promise<any> {
    const cookies = await this.ensureCookies();
    const url = `https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getSymbolData&marketType=N&series=EQ&symbol=${encodeURIComponent(symbol.toUpperCase())}`;

    try {
      const response = await fetch(url, {
        headers: {
          ...NSE_HEADERS,
          Cookie: cookies,
        },
        next: { revalidate: 300 }
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch deep symbol data for ${symbol}:`, error);
      return null;
    }
  }

  async getYearwisePerformance(symbol: string): Promise<any> {
    const cookies = await this.ensureCookies();
    // Use EQN suffix for yearwise data
    const url = `https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getYearwiseData&symbol=${encodeURIComponent(symbol.toUpperCase())}EQN`;

    try {
      const response = await fetch(url, {
        headers: {
          ...NSE_HEADERS,
          Cookie: cookies,
        },
        next: { revalidate: 3600 } // Performance doesn't change fast
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch yearwise performance for ${symbol}:`, error);
      return null;
    }
  }

  async getMetaData(symbol: string): Promise<any> {
    const cookies = await this.ensureCookies();
    const url = `https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getMetaData&symbol=${encodeURIComponent(symbol.toUpperCase())}`;

    try {
      const response = await fetch(url, {
        headers: {
          ...NSE_HEADERS,
          Cookie: cookies,
        },
        next: { revalidate: 3600 }
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch metadata for ${symbol}:`, error);
      return null;
    }
  }

  async getCorporateActions(symbol: string): Promise<any> {
    const cookies = await this.ensureCookies();
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(symbol.toUpperCase())}&section=corp_info`;

    try {
      const response = await fetch(url, {
        headers: {
          ...NSE_HEADERS,
          Cookie: cookies,
        },
        next: { revalidate: 3600 }
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch corporate actions for ${symbol}:`, error);
      return null;
    }
  }
}

export const nseProvider = new NSEProvider();
