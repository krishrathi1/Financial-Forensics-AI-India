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
     console.log(JSON.stringify(data, null, 2).substring(0, 1000));
  } catch (e) {
     console.log(name, 'Fetch error:', e.message);
  }
}

async function runTest(symbol) {
  const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
  const cookies = init.headers.get('set-cookie')?.split(';')[0];

  await testApi('getRegDetails', https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getRegDetails&symbol=&series=EQ, cookies);
  await testApi('getIndexList', https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getIndexList&symbol=, cookies);
  await testApi('getGiftNifty', 'https://www.nseindia.com/api/NextApi/apiClient?functionName=getGiftNifty', cookies);
  await testApi('getTopTenStock', 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getTopTenStock', cookies);
}

runTest('HDFCBANK');
