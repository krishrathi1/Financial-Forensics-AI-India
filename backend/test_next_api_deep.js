const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
  'accept': 'application/json, text/plain, */*',
  'referer': 'https://www.nseindia.com/',
  'x-requested-with': 'XMLHttpRequest',
};

async function fetchWithRetry(url, cookies) {
    for (let i = 0; i < 3; i++) {
        const res = await fetch(url, { headers: { ...NSE_HEADERS, Cookie: cookies } });
        if (res.ok) return await res.json();
    }
    return null;
}

async function testNextApi(symbol) {
  try {
     const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
     const cookies = init.headers.get('set-cookie')?.split(';')[0];
     
     const endpoints = [
       { name: 'getSymbolData', url: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getSymbolData&marketType=N&series=EQ&symbol=' + symbol },
       { name: 'getYearwiseData', url: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getYearwiseData&symbol=' + symbol + 'EQN' }
     ];

     for (const ep of endpoints) {
        console.log('--- Testing', ep.name, '---');
        const data = await fetchWithRetry(ep.url, cookies);
        if (data) {
           console.log(JSON.stringify(data, null, 2).substring(0, 2000));
        } else {
           console.log('Failed to fetch', ep.name);
        }
     }
  } catch (e) {
     console.log('Error:', e.message);
  }
}

testNextApi('HDFCBANK');
