import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LANDING_DIR = path.resolve('public', 'images', 'landing');
const PUBLIC_DIR = path.resolve('public', 'images', 'public');

// Map landing images to public webp destinations (each mapping unique & context-appropriate)
const IMAGE_MAPPINGS = [
  { src: 'hero-kmb.jpg', dest: '01-beranda-hero.webp' },
  { src: 'feature-wide.jpg', dest: '02-tentang-nusantara-maju.webp' },
  { src: 'about-field.jpg', dest: '03-simpanan.webp' },
  { src: 'about-soil.jpg', dest: '04-pinjaman.webp' },
  { src: 'service-inspection.jpg', dest: '05-cara-bergabung.webp' },
  { src: 'service-tablet.jpg', dest: '06-lacak-status.webp' },
  { src: 'faq-meeting.jpg', dest: '07-transparansi.webp' },
  { src: 'service-greenhouse.jpg', dest: '08-nilai-bersama.webp' },
  { src: 'cta-officer.jpg', dest: '09-kolaborasi-anggota.webp' },
  { src: 'feature-soil.jpg', dest: '10-tumbuh-bersama.webp' },
];

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
      }, 30000);

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

async function main() {
  const port = 9245;
  const tempProfile = path.join(os.tmpdir(), `kmb-img-chrome-${Date.now()}`);
  const chromeProc = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
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
        const res = await fetch(`http://127.0.0.1:${port}/json/list`);
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

    if (!connected || !wsUrl) {
      throw new Error('Failed to connect to Chrome CDP');
    }

    const cdp = new CDPClient(wsUrl);
    await cdp.connect();
    await cdp.send('Runtime.enable');

    console.log('Converting images to clean WebP format...');

    for (const mapping of IMAGE_MAPPINGS) {
      const srcPath = path.join(LANDING_DIR, mapping.src);
      const destPath = path.join(PUBLIC_DIR, mapping.dest);

      if (!fs.existsSync(srcPath)) {
        console.warn(`Source not found: ${srcPath}`);
        continue;
      }

      const imgBuffer = fs.readFileSync(srcPath);
      const base64Src = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;

      const evalScript = `
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL('image/webp', 0.88);
              resolve(dataUrl);
            } catch (err) {
              reject(err.message);
            }
          };
          img.onerror = () => reject('Failed to load image into canvas');
          img.src = ${JSON.stringify(base64Src)};
        })
      `;

      const result = await cdp.send('Runtime.evaluate', {
        expression: evalScript,
        awaitPromise: true,
        returnByValue: true,
      });

      if (result.exceptionDetails) {
        console.error(`Error converting ${mapping.src}:`, result.exceptionDetails);
        continue;
      }

      const webpDataUrl = result.result.value;
      const base64Data = webpDataUrl.replace(/^data:image\/webp;base64,/, '');
      const outBuffer = Buffer.from(base64Data, 'base64');

      fs.writeFileSync(destPath, outBuffer);
      console.log(`Converted: ${mapping.src} -> ${mapping.dest} (${Math.round(outBuffer.length / 1024)} KB)`);
    }

    cdp.close();
    console.log('All images converted successfully to WebP!');
  } finally {
    chromeProc.kill();
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  }
}

main().catch((err) => {
  console.error('Fatal conversion error:', err);
  process.exit(1);
});
