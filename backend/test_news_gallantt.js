const NEWS_API_KEY = 'afb02bd75fab48038f89f82830127389';

async function testNews(query) {
  try {
     const url = https://newsapi.org/v2/everything?q=&sortBy=relevancy&language=en&pageSize=5&apiKey=;
     const response = await fetch(url);
     const data = await response.json();
     console.log('News search for', query, ':', data.totalResults || '0');
  } catch (e) {
     console.log('Error:', e.message);
  }
}

testNews('GALLANTT stock India');
testNews('GALLANTT ISPAT news');
testNews('GALLANTT');
