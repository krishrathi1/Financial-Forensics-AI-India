const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'referer': 'https://www.nseindia.com/',
};

async function testNSE(symbol) {
  try {
     const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
     const cookies = init.headers.get('set-cookie')?.split(';')[0];
     
     // Test standard quote-equity
     const url = 'https://www.nseindia.com/api/quote-equity?symbol=' + encodeURIComponent(symbol);
     const res = await fetch(url, { headers: { ...NSE_HEADERS, Cookie: cookies } });
     const data = await res.json();
     console.log('--- NSE quote-equity for', symbol, '---');
     // Check for profile-like keys
     const keys = Object.keys(data);
     console.log('Top keys:', keys);
     if (data.info) console.log('Info:', data.info);
     if (data.metadata) console.log('Metadata:', data.metadata);
  } catch (e) {
     console.log('NSE error:', e.message);
  }
}

async function testFMP(symbol) {
  const FMP_API_KEY = 'f7kfILhVCH29cqa7VApmPiyc6fXrneX9';
  try {
    const url = https://financialmodelingprep.com/api/v3/profile/.NS?apikey=;
    const res = await fetch(url);
    const data = await res.json();
    console.log('--- FMP Profile for', symbol, '---');
    if (data && data[0]) {
      console.log('CEO:', data[0].ceo);
      console.log('Employees:', data[0].fullTimeEmployees);
      console.log('Website:', data[0].website);
      console.log('HQ:', data[0].city, data[0].country);
    } else {
      console.log('FMP Profile empty');
    }
  } catch (e) {
    console.log('FMP error:', e.message);
  }
}

async function run() {
  await testNSE('HDFCBANK');
  await testFMP('HDFCBANK');
  console.log('\n--- Testing for JINKUSHAL ---');
  await testNSE('JKIPL'); // Jinkushal IS JKIPL
  await testFMP('JKIPL');
}

run();
