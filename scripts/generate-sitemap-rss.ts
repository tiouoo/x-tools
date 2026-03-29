import type { Plugin } from 'vite';
import { pageItems } from '../src/views/.nav';

interface SiteConfig {
  siteUrl: string;
  siteName: string;
  siteDescription: string;
  author: string;
  language: string;
}

interface PageItem {
  title: string;
  path: string;
  description?: string;
}

const defaultConfig: SiteConfig = {
  siteUrl: 'https://huh.yik.at',
  siteName: 'Huh',
  siteDescription: 'Huh',
  author: 'Yik',
  language: 'zh-CN',
};

function generateSitemap(pages: PageItem[], config: SiteConfig): string {
  const now = new Date().toISOString();

  const urls = [
    {
      loc: config.siteUrl,
      lastmod: now,
      changefreq: 'weekly',
      priority: '1.0',
    },
    ...pages.map((page) => ({
      loc: `${config.siteUrl}${page.path}`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
}

function generateRSS(pages: PageItem[], config: SiteConfig): string {
  const now = new Date().toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.siteName)}</title>
    <link>${config.siteUrl}</link>
    <description>${escapeXml(config.siteDescription)}</description>
    <language>${config.language}</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${config.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${pages
  .map(
    (page) => `    <item>
      <title>${escapeXml(page.title)}</title>
      <link>${config.siteUrl}${page.path}</link>
      <description>${escapeXml(page.description || page.title)}</description>
      <guid isPermaLink="true">${config.siteUrl}${page.path}</guid>
      <pubDate>${now}</pubDate>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>`;
}

function generateRobotsTxt(config: SiteConfig): string {
  return `User-agent: *
Allow: /

Sitemap: ${config.siteUrl}/sitemap.xml
`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSitemapRssPlugin(userConfig?: Partial<SiteConfig>): Plugin {
  const config = { ...defaultConfig, ...userConfig };

  return {
    name: 'vite-plugin-generate-sitemap-rss',
    apply: 'build',
    generateBundle() {
      const pages: PageItem[] = pageItems;

      // 生成 sitemap.xml
      const sitemap = generateSitemap(pages, config);
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemap,
      });

      // 生成 rss.xml
      const rss = generateRSS(pages, config);
      this.emitFile({
        type: 'asset',
        fileName: 'rss.xml',
        source: rss,
      });

      // 生成 robots.txt
      const robotsTxt = generateRobotsTxt(config);
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt,
      });

      console.log('✓ Generated sitemap.xml, rss.xml, and robots.txt');
    },
  };
}
