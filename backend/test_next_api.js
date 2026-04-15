const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
  'accept': 'application/json, text/plain, */*',
  'referer': 'https://www.nseindia.com/',
  'x-requested-with': 'XMLHttpRequest',
};

async function testNextApi(symbol) {
  try {
     const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
     const cookies = init.headers.get('set-cookie')?.split(';')[0];
     
     const endpoints = [
       { name: 'getSymbolData', url: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getSymbolData&marketType=N&series=EQ&symbol=' + symbol },
       { name: 'getMetaData', url: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getMetaData&symbol=' + symbol },
       { name: 'getSymbolChartData', url: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getSymbolChartData&symbol=' + symbol + 'EQN&days=1D' },
       { name: 'getYearwiseData', url: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getYearwiseData&symbol=' + symbol + 'EQN' },
       { name: 'getIndexList', url: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getIndexList&symbol=' + symbol },
       { name: 'getRegDetails', url: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getRegDetails&symbol=' + symbol + '&series=EQ' }
     ];

     for (const ep of endpoints) {
        console.log('--- Testing', ep.name, '---');
        const res = await fetch(ep.url, { headers: { ...NSE_HEADERS, Cookie: cookies } });
        try {
          const data = await res.json();
          // Print some keys to understand structure
          console.log('Keys:', Object.keys(data).slice(0, 10));
          if (Array.isArray(data)) {
            console.log('Sample item keys:', Object.keys(data[0] || {}).slice(0, 5));
          }
        } catch (e) {
          console.log('Fetch failed for', ep.name, ':', res.status);
        }
     }
  } catch (e) {
     console.log('Error:', e.message);
  }
}

testNextApi('HDFCBANK');
