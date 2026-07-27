async function test() {
  const query = 'pc sp 2013';
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent('edital concurso ' + query)}`;
  const ddgRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }});
  const html = await ddgRes.text();
  const titleRegex = /<h2 class="result__title">\s*<a[^>]+uddg=([^"&]+)[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/g;
  const snippetRegex = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/g;
  let tMatch;
  let sMatch;
  const results = [];
  while ((tMatch = titleRegex.exec(html)) !== null && results.length < 5) {
      sMatch = snippetRegex.exec(html);
      results.push({
          url: decodeURIComponent(tMatch[1]),
          title: tMatch[2].replace(/<[^>]+>/g, '').trim(),
          snippet: sMatch ? sMatch[1].replace(/<[^>]+>/g, '').trim() : ''
      });
  }
  console.log('Extracted:', results);
}
test();
