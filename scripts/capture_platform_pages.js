import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('public', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PAGES_TO_CAPTURE = [
  { name: '1_public_landing', path: '/', role: 'public_visitor', viewport: { width: 1280, height: 800 } },
  { name: '2_public_about', path: '/tentang', role: 'public_visitor', viewport: { width: 1280, height: 800 } },
  { name: '3_public_savings', path: '/layanan/simpanan', role: 'public_visitor', viewport: { width: 1280, height: 800 } },
  { name: '4_public_loans', path: '/layanan/pinjaman', role: 'public_visitor', viewport: { width: 1280, height: 800 } },
  { name: '5_member_dashboard', path: '/portal', role: 'member', viewport: { width: 1280, height: 800 } },
  { name: '6_member_savings', path: '/portal/simpanan', role: 'member', viewport: { width: 1280, height: 800 } },
  { name: '7_admin_dashboard', path: '/admin', role: 'manager', viewport: { width: 1280, height: 800 } },
  { name: '8_admin_verification', path: '/admin/anggota/verifikasi', role: 'staff', viewport: { width: 1280, height: 800 } },
  { name: '9_mobile_landing', path: '/', role: 'public_visitor', viewport: { width: 375, height: 667 } },
  { name: '10_mobile_member', path: '/portal', role: 'member', viewport: { width: 375, height: 667 } },
];

function createStaticServer(distDir, port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
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

function launchHeadlessChrome(port) {
  const tempProfile = path.join(os.tmpdir(), `kmb-cap-chrome-${Math.random().toString(36).substring(2, 8)}`);
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-allow-origins=*',
    `--user-data-dir=${tempProfile}`
  ], { stdio: 'ignore' });

  return { chromeProc, tempProfile };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
      try {
        this.ws.close();
      } catch {}
    }
  }
}

async function run() {
  const port = 4192;
  const chromePort = 9235;
  const distDir = path.resolve('dist');

  console.log('Starting HTTP server on port ' + port + '...');
  const server = await createStaticServer(distDir, port);

  console.log('Launching headless Chrome on debug port ' + chromePort + '...');
  const { chromeProc, tempProfile } = launchHeadlessChrome(chromePort);

  await sleep(1500);

  try {
    const listRes = await fetch(`http://127.0.0.1:${chromePort}/json/list`);
    const targets = await listRes.json();
    let pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) {
      const newRes = await fetch(`http://127.0.0.1:${chromePort}/json/new?about:blank`, { method: 'PUT' });
      pageTarget = await newRes.json();
    }

    console.log(`Attached CDP to page target: ${pageTarget.title}`);
    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    for (const item of PAGES_TO_CAPTURE) {
      console.log(`Capturing: ${item.name} (${item.path}) @ ${item.viewport.width}x${item.viewport.height}`);

      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: item.viewport.width,
        height: item.viewport.height,
        deviceScaleFactor: 1,
        mobile: item.viewport.width < 600,
      });

      // Navigate first
      const fullUrl = `http://127.0.0.1:${port}${item.path}`;
      await cdp.send('Page.navigate', { url: fullUrl });
      await sleep(1000);

      // Set session role in page
      await cdp.send('Runtime.evaluate', {
        expression: `
          sessionStorage.setItem('kmb_demo_role', '${item.role}');
        `,
      });

      // Reload to apply role
      await cdp.send('Page.navigate', { url: fullUrl });
      await sleep(1200);

      // Capture screenshot
      const result = await cdp.send('Page.captureScreenshot', {
        format: 'png',
      });

      const filePath = path.join(OUTPUT_DIR, `${item.name}.png`);
      fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'));
      console.log(`Saved: ${filePath} (${Math.round(result.data.length * 0.75 / 1024)} KB)`);
    }

    cdp.close();
  } finally {
    chromeProc.kill('SIGKILL');
    server.close();
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch {}
  }

  console.log('All screenshots captured successfully in public/screenshots/');
}

run().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
