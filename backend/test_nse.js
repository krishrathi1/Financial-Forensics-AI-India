const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
  'accept': 'application/json, text/plain, */*',
  'referer': 'https://www.nseindia.com/',
  'x-requested-with': 'XMLHttpRequest',
};

async function testIndex(index) {
  try {
     const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
     const cookies = init.headers.get('set-cookie');
     const url = 'https://www.nseindia.com/api/equity-stockIndices?index=' + encodeURIComponent(index);
     const response = await fetch(url, {
       headers: { ...NSE_HEADERS, Cookie: cookies }
     });
     const data = await response.json();
     console.log('Index:', index, 'Count:', data.data?.length || 0);
  } catch (e) {
     console.log('Error for', index, ':', e.message);
  }
}

testIndex('NIFTY 500');
