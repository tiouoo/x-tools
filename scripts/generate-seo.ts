import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { pageItems } from '../src/views/.nav.ts';

// 配置信息
const config = {
  siteUrl: 'https://x.tiouo.xyz',
  siteName: 'tiouo.x-tools',
  siteDescription: 'X 工具集是一个集合了颜色选取、随机数生成、Cloudflare DNS 管理、长链接生成、Whois 查询、网易我的世界随机名生成、GitHub 文件上传等多种实用在线工具的平台，为用户提供便捷的工具服务。',
  author: 'tiouo',
  language: 'zh-CN',
};

// 确保 dist 目录存在
const distDir = join(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// 生成 robots.txt
function generateRobots(): string {
  return `User-agent: *
Allow: /

Sitemap: ${config.siteUrl}/sitemap.xml
`;
}

// 生成 sitemap.xml
function generateSitemap(): string {
  const now = new Date().toISOString();

  const urls = [
    {
      loc: config.siteUrl,
      lastmod: now,
      changefreq: 'daily',
      priority: '1.0',
    },
    ...pageItems.map((item) => ({
      loc: `${config.siteUrl}${item.path}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.8',
    })),
  ];

  const urlEntries = urls
    .map(
      (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}

// 生成 RSS feed
function generateRSS(): string {
  const now = new Date();
  const pubDate = now.toUTCString();

  const items = pageItems
    .map(
      (item) => `    <item>
      <title>${item.title}</title>
      <link>${config.siteUrl}${item.path}</link>
      <description>${item.description}</description>
      <guid isPermaLink="true">${config.siteUrl}${item.path}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${config.siteName}</title>
    <link>${config.siteUrl}</link>
    <description>${config.siteDescription}</description>
    <language>${config.language}</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <atom:link href="${config.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

// 写入文件
function writeFiles() {
  try {
    writeFileSync(join(distDir, 'robots.txt'), generateRobots(), 'utf-8');
    console.log('✓ robots.txt 生成成功');

    writeFileSync(join(distDir, 'sitemap.xml'), generateSitemap(), 'utf-8');
    console.log('✓ sitemap.xml 生成成功');

    writeFileSync(join(distDir, 'rss.xml'), generateRSS(), 'utf-8');
    console.log('✓ rss.xml 生成成功');

    console.log('\n所有 SEO 文件生成完成！');
  } catch (error) {
    console.error('生成文件时出错:', error);
    process.exit(1);
  }
}

// 执行生成
writeFiles();
