import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('public', 'screenshots');

function createStaticServer(distDir, port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(distDir, req.url.split('?')[0]);
    if (filePath.endsWith(path.sep) || !path.extname(filePath)) {
      filePath = path.join(distDir, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        fs.readFile(path.join(distDir, 'index.html'), (err2, data2) => {
          if (err2) {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data2);
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
      }, 15000);

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
      this.ws.close();
    }
  }
}

async function captureState(cdp, filename) {
  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(screenshot.data, 'base64');
  const outPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved screenshot: ${filename} (${Math.round(buffer.length / 1024)} KB)`);
}

async function main() {
  const distDir = path.resolve('dist');
  const serverPort = 4198;
  const server = await createStaticServer(distDir, serverPort);

  const chromePort = 9249;
  const tempProfile = path.join(os.tmpdir(), `kmb-nav-chrome-${Date.now()}`);
  const chromeProc = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${chromePort}`,
      '--disable-gpu',
      '--no-sandbox',
      '--disable-extensions',
      '--remote-allow-origins=*',
      `--user-data-dir=${tempProfile}`,
    ],
    { stdio: 'ignore' }
  );

  try {
    let connected = false;
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      await sleep(200);
      try {
        const res = await fetch(`http://127.0.0.1:${chromePort}/json/list`);
        const targets = await res.json();
        const page = targets.find((t) => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          wsUrl = page.webSocketDebuggerUrl;
          connected = true;
          break;
        }
      } catch {
        // Retry
      }
    }

    const cdp = new CDPClient(wsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    // 1. Desktop Scenarios (1280x800)
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${serverPort}/` });
    await sleep(1000);

    // Scroll to 300px to collapse navbar
    await cdp.send('Runtime.evaluate', {
      expression: 'window.scrollTo(0, 300);',
    });
    await sleep(400);
    await captureState(cdp, 'navbar_collapsed_desktop.png');

    // Click compact button to expand navbar
    await cdp.send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('button[aria-label="Buka navigasi Nusantara Maju"]');
        if (btn) btn.click();
      `,
    });
    await sleep(400);
    await captureState(cdp, 'navbar_expanded_desktop.png');

    // 2. Mobile Scenarios (375x667)
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });

    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${serverPort}/` });
    await sleep(1000);

    // Scroll to 300px
    await cdp.send('Runtime.evaluate', {
      expression: 'window.scrollTo(0, 300);',
    });
    await sleep(400);
    await captureState(cdp, 'navbar_collapsed_mobile.png');

    // Click compact button to open mobile drawer
    await cdp.send('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('button[aria-label="Buka navigasi Nusantara Maju"]');
        if (btn) btn.click();
      `,
    });
    await sleep(500);
    await captureState(cdp, 'navbar_drawer_mobile.png');

    cdp.close();
  } finally {
    chromeProc.kill();
    server.close();
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
