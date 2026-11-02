import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const PAGES = [
  { name: 'public_home', path: '/' },
  { name: 'public_daftar', path: '/daftar' },
];

const SCREENSHOT_DIR = path.resolve('docs/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Static HTTP Server for dist/ directory
function startStaticServer(port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
  };

  const distPath = path.resolve('dist');

  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    let filePath = path.join(distPath, reqUrl);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      filePath = path.join(distPath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

function runChromeScreenshot(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(CHROME_PATH, args, { stdio: 'ignore' });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Chrome exited with code ${code}`));
    });
    proc.on('error', reject);
  });
}

// CDP Client using Node native WebSocket
class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.pending = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { res, rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP command timed out: ${method}`));
        }
      }, 8000);

      this.pending.set(id, {
        res: (val) => {
          clearTimeout(timer);
          resolve(val);
        },
        rej: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
    }
  }
}

async function main() {
  const SERVER_PORT = 4185;
  console.log(`Starting static server on port ${SERVER_PORT}...`);
  const server = await startStaticServer(SERVER_PORT);

  // Debug session for DOM metrics
  const DEBUG_PORT = 9227;
  const tempMetricsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kmb-metrics-prof-'));
  console.log(`Starting headless Chrome for DOM analysis on port ${DEBUG_PORT}...`);
  const debugChrome = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${tempMetricsDir}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-sync',
      '--remote-allow-origins=*',
    ],
    { stdio: 'ignore' }
  );

  await new Promise((r) => setTimeout(r, 1500));

  let cdp = null;
  const results = [];

  try {
    const listRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const pages = await listRes.json();
    let wsUrl = pages[0]?.webSocketDebuggerUrl;
    if (!wsUrl) {
      const newRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' });
      const newPage = await newRes.json();
      wsUrl = newPage.webSocketDebuggerUrl;
    }

    cdp = new CDPClient(wsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');

    for (const page of PAGES) {
      for (const vp of VIEWPORTS) {
        console.log(`\nEvaluating ${page.name} (${page.path}) @ ${vp.width}x${vp.height}...`);

        // 1. Measure DOM metrics via CDP with exact viewport emulation
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: false,
        });

        await cdp.send('Page.navigate', {
          url: `http://127.0.0.1:${SERVER_PORT}${page.path}`,
        });

        // Allow rendering and state hydration
        await new Promise((r) => setTimeout(r, 600));

        const evalRes = await cdp.send('Runtime.evaluate', {
          expression: `
            (() => {
              const innerW = window.innerWidth;
              const clientW = document.documentElement.clientWidth;
              const docScrollW = document.documentElement.scrollWidth;
              const bodyScrollW = document.body.scrollWidth;

              // Check for raw markdown asterisks
              const bodyText = document.body.innerText || '';
              const rawMarkdownFound = bodyText.includes('**');

              // Find elements overflowing viewport width
              const overflowingElements = [];
              const clippedElements = [];

              document.querySelectorAll('*').forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  // Overflow viewport width
                  if (rect.right > innerW + 1.5) {
                    overflowingElements.push({
                      tag: el.tagName.toLowerCase(),
                      className: (el.className || '').toString().slice(0, 60),
                      right: Math.round(rect.right),
                      width: Math.round(rect.width)
                    });
                  }

                  // Accidental clipping by parent with overflow: hidden/clip
                  if (el.parentElement) {
                    const pRect = el.parentElement.getBoundingClientRect();
                    const pStyle = window.getComputedStyle(el.parentElement);
                    const isClippedOverflow = pStyle.overflowX === 'hidden' || pStyle.overflowX === 'clip';
                    if (isClippedOverflow && rect.right > pRect.right + 2 && el.tagName !== 'SVG' && !el.classList.contains('truncate')) {
                      clippedElements.push({
                        tag: el.tagName.toLowerCase(),
                        parentTag: el.parentElement.tagName.toLowerCase(),
                        className: (el.className || '').toString().slice(0, 60),
                        pRight: Math.round(pRect.right),
                        elRight: Math.round(rect.right)
                      });
                    }
                  }
                }
              });

              // Check visibility and usable size of buttons/inputs
              const buttons = Array.from(document.querySelectorAll('button, a[role="button"], input'))
                .filter(b => b.offsetWidth > 0 && b.offsetHeight > 0)
                .map(b => ({
                  tag: b.tagName.toLowerCase(),
                  text: (b.innerText || b.getAttribute('placeholder') || b.value || '').trim().slice(0, 25),
                  width: Math.round(b.getBoundingClientRect().width),
                  height: Math.round(b.getBoundingClientRect().height),
                  isUsable: b.getBoundingClientRect().width >= 20 && b.getBoundingClientRect().height >= 20
                }));

              const hasOverflow = docScrollW > clientW + 1 || bodyScrollW > clientW + 1 || overflowingElements.length > 0;

              return {
                innerWidth: innerW,
                clientWidth: clientW,
                docScrollWidth: docScrollW,
                bodyScrollWidth: bodyScrollW,
                hasOverflow,
                rawMarkdownFound,
                overflowingElements: overflowingElements.slice(0, 5),
                clippedElements: clippedElements.slice(0, 5),
                buttonsSample: buttons.slice(0, 4),
              };
            })()
          `,
          returnByValue: true,
        });

        const metrics = evalRes.result.value;

        // 2. Capture clean PNG screenshot using isolated Chrome instance
        const shotFilename = `${page.name}_${vp.width}.png`;
        const shotPath = path.join(SCREENSHOT_DIR, shotFilename);
        const tempShotDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kmb-shot-'));

        await runChromeScreenshot([
          '--headless=new',
          `--screenshot=${shotPath}`,
          `--window-size=${vp.width},${vp.height}`,
          `--user-data-dir=${tempShotDir}`,
          '--disable-gpu',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-background-networking',
          '--disable-sync',
          '--virtual-time-budget=2000',
          `http://127.0.0.1:${SERVER_PORT}${page.path}`,
        ]);

        try {
          fs.rmSync(tempShotDir, { recursive: true, force: true });
        } catch {
          // ignore
        }

        const fileSize = fs.statSync(shotPath).size;
        const isPassed = !metrics.hasOverflow && !metrics.rawMarkdownFound && metrics.clippedElements.length === 0;

        results.push({
          page: page.name,
          viewport: `${vp.width}x${vp.height}`,
          width: vp.width,
          height: vp.height,
          metrics,
          screenshot: shotFilename,
          fileSize,
          status: isPassed ? 'PASS' : 'FAIL',
        });
      }
    }

    // Save structured report to docs/screenshots/responsive-results.json
    const reportPath = path.join(SCREENSHOT_DIR, 'responsive-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\nStructured report saved to: ${reportPath}`);

    // Output formatted console table
    console.table(
      results.map((r) => ({
        Page: r.page,
        Viewport: r.viewport,
        'Inner Width': r.metrics.innerWidth,
        'Doc ScrollW': r.metrics.docScrollWidth,
        'Body ScrollW': r.metrics.bodyScrollWidth,
        Overflow: r.metrics.hasOverflow ? 'FAIL' : 'OK',
        'Raw Markdown': r.metrics.rawMarkdownFound ? 'FAIL' : 'OK',
        Clipping: r.metrics.clippedElements.length > 0 ? 'FAIL' : 'OK',
        'PNG Size': `${Math.round(r.fileSize / 1024)} KB`,
        Status: r.status,
      }))
    );

    const failCount = results.filter((r) => r.status === 'FAIL').length;
    if (failCount > 0) {
      console.error(`\nTEST FAILED: ${failCount} responsive cases failed!`);
      results
        .filter((r) => r.status === 'FAIL')
        .forEach((r) => {
          console.error(`\n[FAIL] ${r.page} at ${r.viewport}:`);
          console.error('Overflow elements:', r.metrics.overflowingElements);
          console.error('Clipped elements:', r.metrics.clippedElements);
        });
      process.exitCode = 1;
    } else {
      console.log(`\nALL 16 VIEWPORTS VERIFIED: 0 Horizontal Overflow, 0 Clipping, Clean Tagline!`);
      process.exitCode = 0;
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    if (cdp) cdp.close();
    debugChrome.kill();
    server.close();
    try {
      fs.rmSync(tempMetricsDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

main();
