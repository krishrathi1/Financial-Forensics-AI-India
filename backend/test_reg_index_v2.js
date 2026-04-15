const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'referer': 'https://www.nseindia.com/',
};

async function testApi(name, url, cookies) {
  try {
     const res = await fetch(url, { headers: { ...NSE_HEADERS, Cookie: cookies } });
     if (!res.ok) { console.log(name, 'Failed:', res.status); return; }
     const data = await res.json();
     console.log('---', name, '---');
     console.log(JSON.stringify(data, null, 2));
  } catch (e) {
     console.log(name, 'Error:', e.message);
  }
}

async function runTest(symbol) {
  try {
    const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
    const cookies = init.headers.get('set-cookie')?.split(';')[0];

    const u1 = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getRegDetails&symbol=' + symbol + '&series=EQ';
    const u2 = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getIndexList&symbol=' + symbol;

    await testApi('getRegDetails', u1, cookies);
    await testApi('getIndexList', u2, cookies);
  } catch (err) {
    console.log('Root error:', err.message);
  }
}

runTest('HDFCBANK');
