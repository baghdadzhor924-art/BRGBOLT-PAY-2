import axios from 'axios';
import cheerio from 'cheerio';

/**
 * Robust scraper that:
 * - Tries to fetch HTML via axios
 * - Parses open-graph tags, JSON-LD, title, meta description, images
 * - Optional Playwright fallback if heavy JS rendering required (controlled by env USE_PLAYWRIGHT)
 *
 * Exports: async function scrape(url: string): Promise<any>
 */

async function fetchHtml(url: string) {
  const resp = await axios.get(url, {
    headers: {
      'User-Agent': process.env.SCRAPER_USER_AGENT || 'Mozilla/5.0 (compatible; Bot/1.0)',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    timeout: 15000
  });
  return resp.data;
}

function safeText(el: any) {
  if (!el) return '';
  return (el.text && el.text().trim()) || String(el).trim() || '';
}

function extractOg($: cheerio.Root) {
  const og: any = {};
  $('meta').each((i, el) => {
    const name = ($(el).attr('property') || $(el).attr('name') || '').toLowerCase();
    const content = $(el).attr('content') || $(el).attr('value') || '';
    if (name.startsWith('og:') || name.startsWith('twitter:') || name === 'description') {
      og[name] = content;
    }
  });
  return og;
}

function extractJsonLd($: cheerio.Root) {
  const scripts = [];
  $('script[type="application/ld+json"]').each((i, el) => {
    const txt = $(el).html();
    try {
      const parsed = JSON.parse(txt || '{}');
      scripts.push(parsed);
    } catch (e) {
      // ignore parse errors
    }
  });
  return scripts;
}

export async function scrape(url: string) {
  // Try axios+cheerio first
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const title = $('head > title').text().trim() || $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    const og = extractOg($);
    const jsonLd = extractJsonLd($);

    // images: og:image, link rel=image_src, first large img
    const images: string[] = [];
    const ogImage = og['og:image'] || og['og:image:url'] || og['twitter:image'];
    if (ogImage) images.push(ogImage);
    const linkImage = $('link[rel="image_src"]').attr('href');
    if (linkImage) images.push(linkImage);

    // pick first few imgs that have width/height attributes or large src
    $('img').each((i, el) => {
      if (images.length >= 6) return;
      const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src') || '';
      if (!src) return;
      if (src.startsWith('data:')) return;
      images.push(src);
    });

    // canonical url
    const canonical = $('link[rel="canonical"]').attr('href') || url;

    // Try to extract product-like info from schema.org JSON-LD
    let product = null;
    for (const item of jsonLd) {
      if (!item) continue;
      if (item['@type'] && (String(item['@type']).toLowerCase().includes('product') || (Array.isArray(item['@type']) && item['@type'].some((t:any)=>String(t).toLowerCase().includes('product'))))) {
        product = item;
        break;
      }
    }

    return {
      success: true,
      url,
      canonical,
      title,
      description,
      images: [...new Set(images)].filter(Boolean),
      og,
      jsonLd,
      product
    };
  } catch (err) {
    // If configured, attempt Playwright fallback
    if (process.env.USE_PLAYWRIGHT === '1') {
      try {
        const { chromium } = await import('playwright');
        const browser = await chromium.launch({ args: ['--no-sandbox'], headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
        const html = await page.content();
        await browser.close();
        const $ = cheerio.load(html);
        const title = $('head > title').text().trim() || $('meta[property="og:title"]').attr('content') || '';
        const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
        const og = extractOg($);
        const jsonLd = extractJsonLd($);
        const images: string[] = [];
        const ogImage = og['og:image'] || og['og:image:url'] || og['twitter:image'];
        if (ogImage) images.push(ogImage);
        const linkImage = $('link[rel="image_src"]').attr('href');
        if (linkImage) images.push(linkImage);
        $('img').each((i, el) => {
          if (images.length >= 6) return;
          const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src') || '';
          if (!src) return;
          if (src.startsWith('data:')) return;
          images.push(src);
        });
        const canonical = $('link[rel="canonical"]').attr('href') || url;
        let product = null;
        for (const item of jsonLd) {
          if (!item) continue;
          if (item['@type'] && (String(item['@type']).toLowerCase().includes('product') || (Array.isArray(item['@type']) && item['@type'].some((t:any)=>String(t).toLowerCase().includes('product'))))) {
            product = item;
            break;
          }
        }
        return {
          success: true,
          url,
          canonical,
          title,
          description,
          images: [...new Set(images)].filter(Boolean),
          og,
          jsonLd,
          product,
          rendered: true
        };
      } catch (e) {
        // continue to error return below
      }
    }

    return { success: false, error: String(err) };
  }
}

// If running directly for quick tests (node -r ts-node/register scraper.ts "https://example.com")
if (require.main === module) {
  (async () => {
    const url = process.argv[2];
    if (!url) {
      console.error('Usage: node scraper.js <url>');
      process.exit(2);
    }
    const out = await scrape(url);
    console.log(JSON.stringify(out, null, 2));
  })();
}
