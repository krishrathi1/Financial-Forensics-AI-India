const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'referer': 'https://www.nseindia.com/',
};

async function testApi(name, url, cookies) {
  try {
     const res = await fetch(url, { headers: { ...NSE_HEADERS, Cookie: cookies } });
     if (!res.ok) { console.log(name, 'Failed with status', res.status); return; }
     const data = await res.json();
     console.log('---', name, '---');
     console.log(JSON.stringify(data, null, 2).substring(0, 500));
  } catch (e) {
     console.log(name, 'Fetch error:', e.message);
  }
}

async function runTest(symbol) {
  try {
    const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
    const cookies = init.headers.get('set-cookie')?.split(';')[0];

    const eps = [
      { n: 'getRegDetails', u: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getRegDetails&symbol=' + symbol + '&series=EQ' },
      { n: 'getIndexList', u: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getIndexList&symbol=' + symbol },
      { n: 'getGiftNifty', u: 'https://www.nseindia.com/api/NextApi/apiClient?functionName=getGiftNifty' },
      { n: 'getTopTenStock', u: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getTopTenStock' },
      { n: 'getPreOpenMarketStatus', u: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getPreOpenMarketStatus' }
    ];

    for (const ep of eps) {
      await testApi(ep.n, ep.u, cookies);
    }
  } catch (err) {
    console.log('Root error:', err.message);
  }
}

runTest('HDFCBANK');
