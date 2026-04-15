const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
  'accept': 'application/json, text/plain, */*',
  'referer': 'https://www.nseindia.com/',
  'x-requested-with': 'XMLHttpRequest',
};

async function testMovers(type) {
  try {
     const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
     const cookies = init.headers.get('set-cookie');
     // live-analysis-variations is a common endpoint for gainers/losers
     const url = 'https://www.nseindia.com/api/live-analysis-variations?index=' + type;
     const response = await fetch(url, {
       headers: { ...NSE_HEADERS, Cookie: cookies }
     });
     const data = await response.json();
     console.log('Type:', type, 'Count:', data.data?.length || 0, 'First:', data.data?.[0]?.symbol);
  } catch (e) {
     console.log('Error for', type, ':', e.message);
  }
}

testMovers('gainers');
testMovers('losers');
