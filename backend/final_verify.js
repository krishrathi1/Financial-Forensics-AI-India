async function test() {
  const symbols = ['HDFCBANK', 'JKIPL'];
  for (const s of symbols) {
    const res = await fetch(`http://localhost:3000/api/v1/stocks/${s}/dashboard`);
    const data = await res.json();
    console.log(`--- Dashboard for ${s} ---`);
    console.log('Profile:', JSON.stringify(data.data.profile, null, 2));
    console.log('Returns:', JSON.stringify(data.data.returns['1Y'], null, 2));
    console.log('Technicals Sample (P):', data.data.technicals.pivots.standard.p);
  }
}
test();
