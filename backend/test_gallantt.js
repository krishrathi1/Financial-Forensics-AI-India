const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
  'accept': 'application/json, text/plain, */*',
  'referer': 'https://www.nseindia.com/',
  'x-requested-with': 'XMLHttpRequest',
};

async function testChart(symbol) {
  try {
     const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
     const cookies = init.headers.get('set-cookie')?.split(';')[0];
     
     const variants = [symbol, symbol + 'EQ', symbol + 'EQN'];
     for (const v of variants) {
        const url = 'https://www.nseindia.com/api/chart-databyindex?index=' + v + '&indices=false';
        const res = await fetch(url, { headers: { ...NSE_HEADERS, Cookie: cookies } });
        const data = await res.json();
        console.log('Variant', v, 'Points:', data.grapthData?.length || '0');
     }
  } catch (e) {
     console.log('Error:', e.message);
  }
}

testChart('GALLANTT');
