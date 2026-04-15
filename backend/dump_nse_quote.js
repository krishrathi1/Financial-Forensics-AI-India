const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
  'accept': 'application/json, text/plain, */*',
  'referer': 'https://www.nseindia.com/',
  'x-requested-with': 'XMLHttpRequest',
};

async function dumpQuote(symbol) {
  try {
     const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
     const cookies = init.headers.get('set-cookie')?.split(';')[0];
     
     const quoteUrl = 'https://www.nseindia.com/api/quote-equity?symbol=' + encodeURIComponent(symbol);
     const qRes = await fetch(quoteUrl, { headers: { ...NSE_HEADERS, Cookie: cookies } });
     const quote = await qRes.json();
     console.log('Keys:', Object.keys(quote));
     if (quote.priceInfo) console.log('PriceInfo Keys:', Object.keys(quote.priceInfo));
     if (quote.metadata) console.log('Metadata Info:', quote.metadata);
  } catch (e) {
     console.log('Error:', e.message);
  }
}

dumpQuote('RELIANCE');
