const FMP_API_KEY = 'f7kfILhVCH29cqa7VApmPiyc6fXrneX9';

async function testFMP(symbol) {
  try {
     const variants = [symbol.toUpperCase() + '.NS', symbol.toUpperCase()];
     for (const v of variants) {
        const url = 'https://financialmodelingprep.com/api/v3/historical-price-full/' + v + '?apikey=' + FMP_API_KEY;
        const res = await fetch(url);
        const data = await res.json();
        console.log('FMP Variant', v, 'Points:', data.historical?.length || '0');
     }
  } catch (e) {
     console.log('Error:', e.message);
  }
}

testFMP('GALLANTT');
