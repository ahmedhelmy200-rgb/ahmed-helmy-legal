import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs';

const publicPages = [
  'index.html', 'about.html', 'services.html', 'library.html',
  'uae-law.html', 'contact.html', 'privacy.html', 'terms.html',
  'guides/debt-evidence.html', 'guides/contract-dispute.html'
];
for (const path of ['index.html', 'assets', 'ads.txt']) {
  if (!existsSync(path)) throw new Error(`Missing required static site item: ${path}`);
}
const staticPaths = [
  ...publicPages.slice(0, 8),
  'guides', 'robots.txt', 'sitemap.xml', 'site.webmanifest', 'ads.txt',
  'googleaf55dd9893af2a58.html', 'assets'
];
mkdirSync('dist', { recursive: true });
for (const path of staticPaths) {
  if (existsSync(path)) cpSync(path, `dist/${path}`, { recursive: true });
}

const publisherId = 'ca-pub-1562512316677578';
const adEligiblePages = new Set([
  'index.html', 'library.html', 'uae-law.html',
  'guides/debt-evidence.html', 'guides/contract-dispute.html'
]);
const adScript = `  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}" crossorigin="anonymous"></script>`;

for (const page of publicPages) {
  const destination = `dist/${page}`;
  if (!existsSync(destination)) throw new Error(`Missing public page: ${page}`);
  let html = readFileSync(destination, 'utf8');
  if (!/<\/head>/i.test(html) || !/<\/body>/i.test(html)) {
    throw new Error(`Invalid HTML structure: ${page}`);
  }
  if (adEligiblePages.has(page) && !html.includes(`client=${publisherId}`)) {
    html = html.replace(/<\/head>/i, `${adScript}\n</head>`);
  }
  const cleanPath = page === 'index.html' ? '' : page;
  if (!/<link\s+rel="canonical"/i.test(html)) {
    const link = `<link rel="canonical" href="https://ahmed-helmy-legal.vercel.app/${cleanPath}">`;
    html = html.replace(/<\/head>/i, `  ${link}\n</head>`);
  }
  // Link essential visitor information across the legacy static pages.
  if (!page.includes('guides/') && !['privacy.html','terms.html'].includes(page) && !html.includes('href="privacy.html"')) {
    const utilityNav = '<nav aria-label="معلومات الموقع" style="display:flex;flex-wrap:wrap;gap:14px;margin:12px 0;font-size:.85rem"><a href="privacy.html">سياسة الخصوصية</a><a href="terms.html">شروط الاستخدام</a><a href="library.html">المكتبة القانونية</a></nav>';
    if (!/<\/footer>/i.test(html)) throw new Error(`Missing footer: ${page}`);
    html = html.replace(/<\/footer>/i, `${utilityNav}</footer>`);
  }
  writeFileSync(destination, html, 'utf8');
}
console.log('Legal site built: AdSense on editorial content pages, ads.txt, privacy, terms and guides published.');
