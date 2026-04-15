const NEWS_API_KEY = 'afb02bd75fab48038f89f82830127389';

async function testNews(query) {
  try {
     const url = 'https://newsapi.org/v2/everything?q=' + encodeURIComponent(query) + '&sortBy=relevancy&language=en&pageSize=5&apiKey=' + NEWS_API_KEY;
     const response = await fetch(url);
     const data = await response.json();
     console.log('News search for', query, ':', data.totalResults || '0');
  } catch (e) {
     console.log('Error:', e.message);
  }
}

async function run() {
  await testNews('GALLANTT stock India');
  await testNews('GALLANTT ISPAT news');
  await testNews('GALLANTT India');
}

run();
