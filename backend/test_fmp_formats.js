const FMP_API_KEY = "f7kfILhVCH29cqa7VApmPiyc6fXrneX9";

async function test(symbol) {
  const formats = [symbol, symbol + ".NS", symbol + ".BO", "HDB"];
  for (const f of formats) {
    const url = `https://financialmodelingprep.com/api/v3/profile/${f}?apikey=${FMP_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Format [${f}]:`, data && data.length > 0 ? "FOUND - " + data[0].ceo : "NOT FOUND");
  }
}
test("HDFCBANK");
