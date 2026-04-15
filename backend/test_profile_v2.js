const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'referer': 'https://www.nseindia.com/',
};

async function testNSE(symbol) {
  try {
     const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
     const cookies = init.headers.get('set-cookie')?.split(';')[0];
     
     const url = 'https://www.nseindia.com/api/quote-equity?symbol=' + encodeURIComponent(symbol);
     const res = await fetch(url, { headers: { ...NSE_HEADERS, Cookie: cookies } });
     if (!res.ok) { console.log('NSE Failed:', res.status); return; }
     const data = await res.json();
     console.log('--- NSE quote-equity for', symbol, '---');
     if (data.info) {
        console.log('Company Name:', data.info.companyName);
        console.log('Industry:', data.info.industry);
     }
     if (data.metadata) {
        console.log('Industry (metadata):', data.metadata.industry);
        console.log('Sector (metadata):', data.metadata.sector);
     }
  } catch (e) {
     console.log('NSE error:', e.message);
  }
}

async function testFMP(symbol) {
  const FMP_API_KEY = 'f7kfILhVCH29cqa7VApmPiyc6fXrneX9';
  try {
    const url = 'https://financialmodelingprep.com/api/v3/profile/' + symbol + '.NS?apikey=' + FMP_API_KEY;
    const res = await fetch(url);
    const data = await res.json();
    console.log('--- FMP Profile for', symbol, '---');
    if (data && data[0]) {
      console.log('CEO:', data[0].ceo);
      console.log('Employees:', data[0].fullTimeEmployees);
      console.log('Website:', data[0].website);
      console.log('Location:', data[0].city, data[0].state, data[0].country);
      console.log('Description Header:', data[0].description ? data[0].description.substring(0, 100) : 'None');
    } else {
      console.log('FMP Profile empty for', symbol);
    }
  } catch (e) {
     console.log('FMP error:', e.message);
  }
}

async function run() {
  await testNSE('HDFCBANK');
  await testFMP('HDFCBANK');
  console.log('\n--- Testing for JINKUSHAL ---');
  await testNSE('JKIPL'); 
  await testFMP('JKIPL');
}

run();
