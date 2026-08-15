import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pages = ['index.html','tools.html','workshop.html','notes.html','insights.html','services.html','playbooks.html','about.html','factory-journey.html','nis2-gap-assessment.html'];
for (const pg of pages) {
  const p = await b.newPage({ viewport: { width: 375, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:8224/' + pg, { waitUntil: 'domcontentloaded' });
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  const nav = await p.evaluate(() => Array.from(document.querySelectorAll('nav .nav-links a')).map(a => a.textContent.trim()).join('·'));
  console.log(pg.padEnd(28) + ' sw=' + sw + ' ovf=' + (sw>380) + ' err=' + errs.length + ' | ' + nav);
  await p.close();
}
const p2 = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p2.goto('http://127.0.0.1:8224/tools.html', { waitUntil: 'networkidle' });
await p2.screenshot({ path: '/tmp/claude-0/-home-user/94d02779-11dc-5070-a830-447e104f5e12/scratchpad/tools.png', fullPage: true });
await b.close();
