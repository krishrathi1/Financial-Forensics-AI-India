const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'referer': 'https://www.nseindia.com/',
};

async function testCorpInfo(symbol) {
  try {
     const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
     const cookies = init.headers.get('set-cookie')?.split(';')[0];
     
     // The corp_info section often has multiple nested parts
     const url = 'https://www.nseindia.com/api/quote-equity?symbol=' + encodeURIComponent(symbol) + '&section=corp_info';
     const res = await fetch(url, { headers: { ...NSE_HEADERS, Cookie: cookies } });
     const data = await res.json();
     console.log('--- NSE corp_info for', symbol, '---');
     console.log('Keys:', Object.keys(data));
     
     if (data.corporate) {
        console.log('Corporate Keys:', Object.keys(data.corporate));
        if (data.corporate.boardMeetings) console.log('Board Meetings Sample:', data.corporate.boardMeetings[0]);
     }
     
     // Try Company Directory endpoint if it exists
     const dirUrl = 'https://www.nseindia.com/api/company-directory?symbol=' + encodeURIComponent(symbol);
     const res2 = await fetch(dirUrl, { headers: { ...NSE_HEADERS, Cookie: cookies } });
     if (res2.ok) {
        const data2 = await res2.json();
        console.log('--- Company Directory found! ---');
        console.log(JSON.stringify(data2, null, 2).substring(0, 1000));
     } else {
        console.log('Company Directory not found for', symbol);
     }

  } catch (e) {
     console.log('Error:', e.message);
  }
}

async function run() {
  await testCorpInfo('HDFCBANK');
  await testCorpInfo('JKIPL');
}

run();
