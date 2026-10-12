import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs';

const required = ['index.html', 'assets'];
for (const item of required) {
  if (!existsSync(item)) {
    throw new Error(`Missing required static site item: ${item}`);
  }
}

const htmlPages = ['index.html', 'about.html', 'services.html', 'library.html', 'uae-law.html', 'contact.html'];
const staticFiles = [...htmlPages, 'robots.txt', 'sitemap.xml', 'site.webmanifest', 'ads.txt', 'assets'];

mkdirSync('dist', { recursive: true });
for (const item of staticFiles) {
  if (existsSync(item)) {
    cpSync(item, `dist/${item}`, { recursive: true });
  }
}

// AdSense ownership verification: include Google's publisher script in the head of every public page.
const publisherId = 'ca-pub-1562512316677578';
const adsenseScript = `  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}" crossorigin="anonymous"></script>`;
for (const page of htmlPages) {
  const destination = `dist/${page}`;
  if (!existsSync(destination)) continue;
  let html = readFileSync(destination, 'utf8');
  if (!html.includes(`client=${publisherId}`)) {
    if (!/<\/head>/i.test(html)) {
      throw new Error(`AdSense verification injection failed: missing </head> in ${page}`);
    }
    html = html.replace(/<\/head>/i, `${adsenseScript}\n</head>`);
    writeFileSync(destination, html, 'utf8');
  }
}

console.log('Static legal website and AdSense verification copied to dist/');
