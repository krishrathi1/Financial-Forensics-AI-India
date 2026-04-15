const FMP_API_KEY = "f7kfILhVCH29cqa7VApmPiyc6fXrneX9";
async function check() {
  const url = `https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=${FMP_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("AAPL Profile:", data && data.length > 0 ? "FOUND" : "NOT FOUND (Key issue?)");
  if (data && data.Error) console.log("ERROR:", data.Error);
}
check();
