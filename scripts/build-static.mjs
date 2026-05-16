import { existsSync, mkdirSync, cpSync } from 'node:fs';

const required = ['index.html', 'assets'];
for (const item of required) {
  if (!existsSync(item)) {
    throw new Error(`Missing required static site item: ${item}`);
  }
}

mkdirSync('dist', { recursive: true });
for (const item of ['index.html','about.html','services.html','library.html','uae-law.html','contact.html','robots.txt','sitemap.xml','site.webmanifest','assets']) {
  if (existsSync(item)) {
    cpSync(item, `dist/${item}`, { recursive: true });
  }
}

console.log('Static legal website copied to dist/');
