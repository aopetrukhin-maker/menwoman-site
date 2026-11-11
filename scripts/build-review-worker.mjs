import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';

const root = resolve(process.argv[2] || '.');
const manifestFile = join(root, '.openai/hosting.json');
const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
if (!manifest.project_id) throw new Error('A separate review Site identity is required.');
delete manifest.static;
manifest.d1 = 'DB'; manifest.r2 = null;
await writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
const assets = {};
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.json':'application/json', '.txt':'text/plain; charset=utf-8', '.svg':'image/svg+xml', '.webp':'image/webp', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.woff2':'font/woff2', '.ico':'image/x-icon' };
async function walk(directory, prefix = '') {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const relative = `${prefix}/${item.name}`;
    if (item.isDirectory()) await walk(join(directory, item.name), relative);
    else {
      const data = await readFile(join(directory, item.name));
      assets[relative] = { type: types[extname(item.name)] || 'application/octet-stream', data: data.toString('base64') };
    }
  }
}
await walk(join(root, 'out'));
const server = (await readFile(join(root, 'server/admissions.mjs'), 'utf8')).replace(/^export \{.*\};?\n?/gm, '').replace(/^export /gm, '');
const admin = (await readFile(join(root, 'server/admissions-admin.mjs'), 'utf8')).replace(/^export /gm, '');
const source = `const ASSETS=${JSON.stringify(assets)};\n${server}\n${admin}\nexport default {async fetch(request,env){const u=new URL(request.url);if(u.pathname.startsWith('/api/admissions/'))return admissions(request,env);if(u.pathname==='/review-applications'){if(!isAdmin(request,env))return new Response('Доступ только у модератора.',{status:403});return new Response(adminPage,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}})}if(u.pathname==='/robots.txt')return new Response('User-agent: *\\nDisallow: /\\n',{headers:{'Content-Type':'text/plain'}});if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});const path=u.pathname==='/'?'/index.html':u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname;const asset=ASSETS[path]||ASSETS[path+'/index.html'];if(!asset)return new Response('Не найдено',{status:404});return new Response(request.method==='HEAD'?null:Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0)),{headers:{'Content-Type':asset.type,'Cache-Control':asset.type.startsWith('text/html')?'no-store':'public,max-age=3600','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}})}};\n`;
await mkdir(join(root, 'dist/server'), { recursive: true });
await mkdir(join(root, 'dist/.openai'), { recursive: true });
await writeFile(join(root, 'dist/server/index.js'), source);
await writeFile(join(root, 'dist/.openai/hosting.json'), JSON.stringify(manifest, null, 2));
console.log(`Review Worker built with ${Object.keys(assets).length} local assets.`);
