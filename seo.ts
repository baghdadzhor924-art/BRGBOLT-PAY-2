export async function analyzeCompetitors(keywords: string[]) {
  const results = await Promise.all(keywords.map(async keyword => {
    const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&api_key=${process.env.NEXT_PUBLIC_SERP_API_KEY}`);
    const data = await response.json();
    return data.organic_results?.slice(0, 3) || [];
  }));
  return results.flat();
}