const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'referer': 'https://www.nseindia.com/',
  'accept': 'application/json, text/plain, */*',
  'x-requested-with': 'XMLHttpRequest',
};

async function deepTest(symbol) {
  try {
     const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
     const cookies = init.headers.get('set-cookie')?.split(';')[0];
     
     const endpoints = [
       { name: 'getMetaData', url: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getMetaData&symbol=' + symbol },
       { name: 'getSymbolData', url: 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getSymbolData&marketType=N&series=EQ&symbol=' + symbol }
     ];

     for (const ep of endpoints) {
        console.log('--- Checking', ep.name, '---');
        const res = await fetch(ep.url, { headers: { ...NSE_HEADERS, Cookie: cookies } });
        const text = await res.text();
        
        const searchTerms = ['CEO', 'Incorporation', 'Headquarters', 'Employees', 'Chairman', 'Website'];
        searchTerms.forEach(term => {
           if (text.toLowerCase().includes(term.toLowerCase())) {
              console.log(`FOUND term "${term}" in ${ep.name}`);
           }
        });
        
        // Log the first 500 chars of a pretty-printed version if it contains anything
        try {
          const data = JSON.parse(text);
          // console.log(JSON.stringify(data, null, 2).substring(0, 1000));
        } catch (e) {}
     }
  } catch (e) { console.log('Error:', e.message); }
}

deepTest('HDFCBANK');
