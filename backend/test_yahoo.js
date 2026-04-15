async function testYahoo(symbol) {
  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + symbol + '.NS?range=5y&interval=1d';
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await res.json();
    console.log('Yahoo points for', symbol, ':', data.chart?.result?.[0]?.timestamp?.length || '0');
  } catch (e) {
    console.log('Yahoo Error:', e.message);
  }
}

testYahoo('GALLANTT');
