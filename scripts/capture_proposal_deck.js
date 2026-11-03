import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('docs', 'screenshots', 'Proposal deck');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const DECK_PAGES = [
  {
    name: '01_Landing_Page_Hero_Desktop',
    path: '/',
    role: 'public_visitor',
    viewport: { width: 1440, height: 900 },
    description: 'Halaman Utama Public Landing Page Koperasi Digital KMB',
  },
  {
    name: '02_Profil_Kelembagaan_Tata_Kelola',
    path: '/tentang',
    role: 'public_visitor',
    viewport: { width: 1440, height: 900 },
    description: 'Profil Legalitas, Visi Misi, Nilai Gotong Royong & Susunan Pengurus',
  },
  {
    name: '03_Katalog_Produk_Simpanan',
    path: '/layanan/simpanan',
    role: 'public_visitor',
    viewport: { width: 1440, height: 900 },
    description: 'Produk Simpanan Pokok, Wajib, Sukarela & Matriks Perbandingan',
  },
  {
    name: '04_Kalkulator_Simulasi_Pinjaman',
    path: '/layanan/pinjaman',
    role: 'public_visitor',
    viewport: { width: 1440, height: 900 },
    description: 'Katalog Pembiayaan & Kalkulator Simulasi Angsuran Pinjaman',
  },
  {
    name: '05_Dashboard_Portal_Anggota',
    path: '/portal',
    role: 'member',
    viewport: { width: 1440, height: 900 },
    description: 'Dashboard Anggota: Ringkasan Saldo, Tagihan Angsuran & Rekening Aktif',
  },
  {
    name: '06_Portofolio_Simpanan_Anggota',
    path: '/portal/simpanan',
    role: 'member',
    viewport: { width: 1440, height: 900 },
    description: 'Portal Simpanan Anggota: Riwayat Mutasi & Form Penarikan/Setoran',
  },
  {
    name: '07_Portofolio_Pinjaman_Anggota',
    path: '/portal/pinjaman',
    role: 'member',
    viewport: { width: 1440, height: 900 },
    description: 'Portal Pinjaman Anggota: Jadwal Angsuran & Pengajuan Baru',
  },
  {
    name: '08_Dashboard_Eksekutif_Administrasi',
    path: '/admin',
    role: 'manager',
    viewport: { width: 1440, height: 900 },
    description: 'Dashboard Eksekutif Admin dengan Grafik Recharts Tren Arus Finansial',
  },
  {
    name: '09_Verifikasi_Pendaftaran_Anggota',
    path: '/admin/anggota/verifikasi',
    role: 'staff',
    viewport: { width: 1440, height: 900 },
    description: 'Ruang Kerja Staf Operasional: Verifikasi Berkas & Pemeriksaan Dokumen',
  },
  {
    name: '10_Pengaturan_Platform_Modular',
    path: '/admin/pengaturan',
    role: 'super_admin',
    viewport: { width: 1440, height: 900 },
    description: 'Pengaturan Platform: Arsitektur 7 Core & 9 Modul Bisnis',
  },
  {
    name: '11_Mobile_Public_Landing',
    path: '/',
    role: 'public_visitor',
    viewport: { width: 390, height: 844 },
    description: 'Pengalaman Mobile Responsif Halaman Beranda Publik',
  },
  {
    name: '12_Mobile_Member_Portal',
    path: '/portal',
    role: 'member',
    viewport: { width: 390, height: 844 },
    description: 'Pengalaman Mobile Responsif Portal Anggota',
  },
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
  const tempProfile = path.join(os.tmpdir(), `kmb-deck-chrome-${Math.random().toString(36).substring(2, 8)}`);
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
  const port = 4198;
  const chromePort = 9248;
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

    console.log(`\nCapturing ${DECK_PAGES.length} screenshots for Proposal Deck...\n`);

    for (let i = 0; i < DECK_PAGES.length; i++) {
      const item = DECK_PAGES[i];
      const isMobile = item.viewport.width < 600;

      console.log(`[${i + 1}/${DECK_PAGES.length}] Capturing: ${item.name} (${item.path}) @ ${item.viewport.width}x${item.viewport.height}`);

      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: item.viewport.width,
        height: item.viewport.height,
        deviceScaleFactor: 2, // High resolution (Retina 2x) for crisp proposal presentation!
        mobile: isMobile,
      });

      const fullUrl = `http://127.0.0.1:${port}${item.path}`;
      await cdp.send('Page.navigate', { url: fullUrl });
      await sleep(1000);

      // Set active session role
      await cdp.send('Runtime.evaluate', {
        expression: `
          sessionStorage.setItem('kmb_demo_role', '${item.role}');
        `,
      });

      // Reload to apply role
      await cdp.send('Page.navigate', { url: fullUrl });
      await sleep(1500);

      // Scroll slightly or trigger render if needed
      await cdp.send('Runtime.evaluate', {
        expression: `window.scrollTo(0, 0);`,
      });
      await sleep(500);

      // Capture screenshot
      const result = await cdp.send('Page.captureScreenshot', {
        format: 'png',
      });

      const filePath = path.join(OUTPUT_DIR, `${item.name}.png`);
      fs.writeFileSync(filePath, Buffer.from(result.data, 'base64'));
      console.log(`  -> Saved: ${filePath} (${Math.round(result.data.length * 0.75 / 1024)} KB)`);
    }

    cdp.close();
  } finally {
    chromeProc.kill('SIGKILL');
    server.close();
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch {}
  }

  console.log('\nAll Proposal Deck screenshots captured successfully in docs/screenshots/Proposal deck/');
}

run().catch((err) => {
  console.error('Error capturing proposal deck screenshots:', err);
  process.exit(1);
});
