const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'referer': 'https://www.nseindia.com/',
  'accept': 'application/json, text/plain, */*',
  'x-requested-with': 'XMLHttpRequest',
};

async function deepInspect(symbol) {
  try {
     const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
     const cookies = init.headers.get('set-cookie')?.split(';')[0];
     
     const url = 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?functionName=getSymbolData&marketType=N&series=EQ&symbol=' + symbol;
     const res = await fetch(url, { headers: { ...NSE_HEADERS, Cookie: cookies } });
     const data = await res.json();
     
     // I will use a recursive function to find keys matching my search terms
     function findKeys(obj, target, path = '') {
        if (!obj || typeof obj !== 'object') return;
        
        for (const key in obj) {
           const currentPath = path ? `${path}.${key}` : key;
           if (key.toLowerCase().includes(target.toLowerCase())) {
              console.log(`MATCH [${target}]: ${currentPath} = ${JSON.stringify(obj[key]).substring(0, 100)}`);
           }
           if (typeof obj[key] === 'object') {
              findKeys(obj[key], target, currentPath);
           }
        }
     }

     const searchTerms = ['CEO', 'Incorporation', 'Headquarters', 'Employees', 'Chairman', 'Website', 'Address'];
     searchTerms.forEach(term => findKeys(data, term));
     
  } catch (e) { console.log('Error:', e.message); }
}

deepInspect('HDFCBANK');
