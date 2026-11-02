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
  {
    name: 'public_home',
    path: '/',
    expectedTitleSnippet: 'Koperasi',
    domReadyCondition: `Boolean(
      document.querySelector('h1') &&
      document.querySelector('h1').innerText.includes('Koperasi') &&
      Array.from(document.querySelectorAll('button, a[role="button"]')).some(b => 
        (b.innerText || '').includes('Daftar') && b.offsetWidth > 0
      )
    )`,
    validateDom: `(() => {
      const h1 = document.querySelector('h1');
      const h1Rect = h1 ? h1.getBoundingClientRect() : null;
      const h1Valid = Boolean(h1 && h1Rect.width > 0 && h1Rect.height > 0);

      const visibleButtons = Array.from(document.querySelectorAll('button, a[role="button"]'))
        .filter(b => b.offsetWidth > 0 && b.offsetHeight > 0);

      const hasCta = visibleButtons.some(b => (b.innerText || '').includes('Daftar'));
      const bodyLen = (document.body.innerText || '').trim().length;

      return {
        isValid: h1Valid && visibleButtons.length >= 2 && hasCta && bodyLen > 300,
        h1Text: h1 ? h1.innerText.trim() : '',
        h1Size: h1Rect ? { w: Math.round(h1Rect.width), h: Math.round(h1Rect.height) } : null,
        visibleButtonCount: visibleButtons.length,
        bodyTextLength: bodyLen,
        reason: !h1Valid ? 'H1 element missing or zero size'
          : visibleButtons.length < 2 ? 'Fewer than 2 visible buttons found'
          : !hasCta ? 'Primary CTA button missing'
          : bodyLen <= 300 ? 'Body text unexpectedly short or blank'
          : 'OK'
      };
    })()`
  },
  {
    name: 'public_daftar',
    path: '/daftar',
    expectedTitleSnippet: 'Permohonan Menjadi Anggota',
    domReadyCondition: `Boolean(
      document.querySelector('h1') &&
      document.querySelector('form') &&
      document.querySelectorAll('input').length >= 2 &&
      Array.from(document.querySelectorAll('button')).some(b => 
        (b.innerText || '').includes('Selanjutnya') && b.offsetWidth > 0
      )
    )`,
    validateDom: `(() => {
      const h1 = document.querySelector('h1');
      const h1Rect = h1 ? h1.getBoundingClientRect() : null;
      const h1Valid = Boolean(h1 && h1Rect.width > 0 && h1Rect.height > 0);

      const form = document.querySelector('form');
      const formValid = Boolean(form && form.offsetWidth > 0);

      const visibleInputs = Array.from(document.querySelectorAll('input'))
        .filter(i => i.offsetWidth > 0 && i.offsetHeight > 0);

      const visibleButtons = Array.from(document.querySelectorAll('button'))
        .filter(b => b.offsetWidth > 0 && b.offsetHeight > 0);

      const hasNextBtn = visibleButtons.some(b => (b.innerText || '').includes('Selanjutnya'));
      const bodyLen = (document.body.innerText || '').trim().length;

      return {
        isValid: h1Valid && formValid && visibleInputs.length >= 2 && visibleButtons.length >= 1 && hasNextBtn && bodyLen > 200,
        h1Text: h1 ? h1.innerText.trim() : '',
        h1Size: h1Rect ? { w: Math.round(h1Rect.width), h: Math.round(h1Rect.height) } : null,
        visibleInputCount: visibleInputs.length,
        visibleButtonCount: visibleButtons.length,
        bodyTextLength: bodyLen,
        reason: !h1Valid ? 'Registration H1 title missing or zero size'
          : !formValid ? 'Registration form missing or zero size'
          : visibleInputs.length < 2 ? 'Expected at least 2 visible inputs in step 1'
          : visibleButtons.length < 1 ? 'No visible buttons on registration wizard'
          : !hasNextBtn ? 'Next navigation button missing'
          : bodyLen <= 200 ? 'Body text unexpectedly short or blank'
          : 'OK'
      };
    })()`
  },
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
      }, 10000);

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

// Wait for a condition in browser with polling
async function waitForCondition(cdp, expression, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await cdp.send('Runtime.evaluate', {
        expression,
        returnByValue: true,
      });
      if (res?.result?.value === true) {
        return true;
      }
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

async function main() {
  const SERVER_PORT = 4188;
  console.log(`Starting static HTTP server on port ${SERVER_PORT}...`);
  const server = await startStaticServer(SERVER_PORT);

  // Chrome isolated profile directory
  const tempProfileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kmb-isolated-chrome-'));
  const DEBUG_PORT = 9229;
  console.log(`Starting headless Chrome (port ${DEBUG_PORT}) with profile: ${tempProfileDir}...`);

  const chromeProc = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${tempProfileDir}`,
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
    const targets = await listRes.json();
    console.log(`Discovered ${targets.length} Chrome targets.`);

    // Find the real page tab
    let pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) {
      const newRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' });
      pageTarget = await newRes.json();
    }

    console.log(`Attached CDP to page target: ${pageTarget.title} (${pageTarget.webSocketDebuggerUrl})`);
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    for (const page of PAGES) {
      for (const vp of VIEWPORTS) {
        const shotFilename = `${page.name}_${vp.width}.png`;
        const shotPath = path.join(SCREENSHOT_DIR, shotFilename);
        console.log(`\n------------------------------------------------------------`);
        console.log(`TESTING: ${page.name} (${page.path}) @ ${vp.width}x${vp.height}`);

        // 1. Set explicit viewport metrics (mobile: false ensures exact CSS pixel innerWidth)
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: false,
        });

        // 2. Navigate
        const targetUrl = `http://127.0.0.1:${SERVER_PORT}${page.path}`;
        await cdp.send('Page.navigate', { url: targetUrl });

        // 3. Robust Synchronization: Wait for specific DOM condition and React mount
        const isDomReady = await waitForCondition(cdp, page.domReadyCondition, 8000);
        if (!isDomReady) {
          console.error(`[TIMEOUT] DOM ready condition failed on ${page.name} at ${vp.width}x${vp.height}`);
        }

        // Additional settling frame for layout stability
        await new Promise((r) => setTimeout(r, 200));

        // 4. Validate DOM Completeness
        const domValidationRes = await cdp.send('Runtime.evaluate', {
          expression: page.validateDom,
          returnByValue: true,
        });
        const domValidation = domValidationRes.result.value || { isValid: false, reason: 'Evaluation failed' };

        // 5. In-depth DOM Measurements & Overflow/Clipping Detection
        const evalRes = await cdp.send('Runtime.evaluate', {
          expression: `
            (() => {
              const innerW = window.innerWidth;
              const clientW = document.documentElement.clientWidth;
              const docScrollW = document.documentElement.scrollWidth;
              const bodyScrollW = document.body.scrollWidth;

              // Check for raw markdown asterisks anywhere in rendered text
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

              // Sample all visible interactive controls
              const buttons = Array.from(document.querySelectorAll('button, a[role="button"], input'))
                .filter(b => b.offsetWidth > 0 && b.offsetHeight > 0)
                .map(b => ({
                  tag: b.tagName.toLowerCase(),
                  text: (b.innerText || b.getAttribute('placeholder') || b.value || '').trim().slice(0, 30),
                  width: Math.round(b.getBoundingClientRect().width),
                  height: Math.round(b.getBoundingClientRect().height),
                  isUsable: b.getBoundingClientRect().width >= 20 && b.getBoundingClientRect().height >= 20
                }));

              const hasOverflow = docScrollW > innerW + 1 || bodyScrollW > innerW + 1 || overflowingElements.length > 0;

              return {
                innerWidth: innerW,
                clientWidth: clientW,
                docScrollWidth: docScrollW,
                bodyScrollWidth: bodyScrollW,
                hasOverflow,
                rawMarkdownFound,
                overflowingElements: overflowingElements.slice(0, 5),
                clippedElements: clippedElements.slice(0, 5),
                buttonsSample: buttons.slice(0, 6),
              };
            })()
          `,
          returnByValue: true,
        });

        const metrics = evalRes.result.value;

        // 6. Capture Screenshot directly from the authenticated, fully rendered page
        const shotRes = await cdp.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(shotPath, Buffer.from(shotRes.data, 'base64'));
        const fileSize = fs.statSync(shotPath).size;

        // Validation Rules:
        // - DOM must be ready
        // - DOM completeness validation must pass
        // - docScrollWidth === innerWidth (or <= innerWidth)
        // - bodyScrollWidth <= innerWidth
        // - No overflow
        // - No raw markdown **
        // - No clipping
        // - buttonsSample must NOT be empty
        // - Screenshot file must be valid and non-empty (> 10 KB)
        const isPassed =
          isDomReady &&
          domValidation.isValid &&
          !metrics.hasOverflow &&
          !metrics.rawMarkdownFound &&
          metrics.clippedElements.length === 0 &&
          metrics.buttonsSample.length > 0 &&
          fileSize > 10000;

        console.log(`DOM Ready: ${isDomReady} | DOM Valid: ${domValidation.isValid} (${domValidation.reason})`);
        console.log(`Buttons sample (${metrics.buttonsSample.length}):`, metrics.buttonsSample.map(b => `${b.tag}[${b.text}:${b.width}x${b.height}]`).join(', '));
        console.log(`InnerWidth: ${metrics.innerWidth} | ScrollWidth: ${metrics.docScrollWidth} | BodyScrollW: ${metrics.bodyScrollWidth}`);
        console.log(`Screenshot: ${shotFilename} (${Math.round(fileSize / 1024)} KB) -> STATUS: ${isPassed ? 'PASS' : 'FAIL'}`);

        results.push({
          page: page.name,
          viewport: `${vp.width}x${vp.height}`,
          width: vp.width,
          height: vp.height,
          domReady: isDomReady,
          domValidation,
          metrics,
          screenshot: shotFilename,
          fileSize,
          status: isPassed ? 'PASS' : 'FAIL',
        });
      }
    }

    // Save structured report
    const reportPath = path.join(SCREENSHOT_DIR, 'responsive-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n============================================================`);
    console.log(`Structured verification report saved to: ${reportPath}`);

    // Print summary table
    console.table(
      results.map((r) => ({
        Page: r.page,
        Viewport: r.viewport,
        'Inner Width': r.metrics.innerWidth,
        'Doc ScrollW': r.metrics.docScrollWidth,
        'DOM Valid': r.domValidation.isValid ? 'YES' : 'FAIL',
        Overflow: r.metrics.hasOverflow ? 'FAIL' : 'OK',
        'Raw Markdown': r.metrics.rawMarkdownFound ? 'FAIL' : 'OK',
        Clipping: r.metrics.clippedElements.length > 0 ? 'FAIL' : 'OK',
        'Buttons Found': r.metrics.buttonsSample.length,
        'PNG Size': `${Math.round(r.fileSize / 1024)} KB`,
        Status: r.status,
      }))
    );

    const failCount = results.filter((r) => r.status === 'FAIL').length;
    if (failCount > 0) {
      console.error(`\nAUTOMATED AUDIT FAILED: ${failCount} scenarios failed!`);
      results
        .filter((r) => r.status === 'FAIL')
        .forEach((r) => {
          console.error(`\n[FAIL DETAILS] ${r.page} at ${r.viewport}:`);
          console.error('DOM Validation:', r.domValidation);
          console.error('Overflow elements:', r.metrics.overflowingElements);
          console.error('Clipped elements:', r.metrics.clippedElements);
        });
      process.exitCode = 1;
    } else {
      console.log(`\nALL 16 SCENARIOS PASSED STRICT DOM COMPLETENESS & 0 OVERFLOW/CLIPPING CHECKS!`);
      process.exitCode = 0;
    }
  } catch (err) {
    console.error('Execution error:', err);
    process.exitCode = 1;
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill();
    server.close();
    try {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

main();
