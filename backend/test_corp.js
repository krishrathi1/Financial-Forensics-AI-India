const NSE_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'referer': 'https://www.nseindia.com/',
};

async function testApi(url) {
  try {
     const init = await fetch('https://www.nseindia.com', { headers: NSE_HEADERS });
     const cookies = init.headers.get('set-cookie')?.split(';')[0];
     const res = await fetch(url, { headers: { ...NSE_HEADERS, Cookie: cookies } });
     const data = await res.json();
     console.log('Keys for', url, ':', Object.keys(data).slice(0, 10));
     if (Array.isArray(data)) console.log('Sample item:', data[0]);
     else if (data.data) console.log('Sample data item:', data.data?.[0]);
  } catch (e) {
     console.log('Failed:', url, e.message);
  }
}

testApi('https://www.nseindia.com/api/NextApi/cmsHandler?functionName=getNotificationList');
testApi('https://www.nseindia.com/api/quote-equity?symbol=HDFCBANK&section=corp_info');
