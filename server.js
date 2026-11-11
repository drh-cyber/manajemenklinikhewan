/**
 * Server Backend VPS — Sistem Manajemen Klinik Hewan
 * Berjalan mandiri di VPS menggunakan Node.js (Tanpa Google Spreadsheet & Tanpa Dependensi Eksternal)
 *
 * Cara Menjalankan di VPS:
 *   1. Pastikan file `server.js` dan `Index.html` berada di dalam satu folder yang sama.
 *   2. Jalankan perintah: node server.js   (atau menggunakan PM2: pm2 start server.js --name klinik-hewan)
 *   3. Buka di browser: http://IP_VPS_ANDA:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Pastikan folder penyimpanan data, backup, dan foto klinis tersedia di VPS
[DATA_DIR, BACKUP_DIR, UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Data awal (otomatis dibuat jika database.json belum ada di VPS)
const INITIAL_DB = {
  version: 38,
  users: [
    { u: 'admin', p: 'admin12345', n: 'Admin', r: 'admin' },
    { u: 'kasir', p: 'kasir', n: 'Kasir', r: 'kasir' },
    { u: 'dokter', p: 'dokter', n: 'Dokter', r: 'dokter' },
    { u: 'dokter2', p: 'dokter2', n: 'Dokter 2', r: 'dokter' },
    { u: 'demo', p: 'demo', n: 'Demo', r: 'admin' }
  ],
  cl: [
    { n: 'Cireng', j: 'Kucing', o: 'DC Vet', wa: '081999831337', dob: '2023-10-01', jk: 'Jantan', st: 'Sudah', sf: '', wr: 'red' },
    { n: 'Chiki', j: 'Kucing', o: 'DC Vet', wa: '081999831337', dob: '2024-03-01', jk: 'Betina', st: 'Sudah', sf: '', wr: 'putih' },
    { n: 'Nato', j: 'Kucing', o: 'DC Vet', wa: '081999831337', dob: '2020-09-01', jk: 'Jantan', st: 'Sudah', sf: '', wr: 'Blue' }
  ],
  ap: [
    {
      c: 1, dt: '2026-11-06', j: '09:12', k: 'Tidak mau makan', s: 'Selesai', d: 'Dokter 2',
      it: [
        { rx: '', cmAmt: 35000, cmDt: '2026-11-08', h: 50000, ni: 'Periksa dan Konsultasi', cmPaid: true, q: 1, cmRef: 'COM-1794125135563-heft', n: 'Periksa dan Konsultasi', cmDoc: 'Dokter 2', cIdx: 12 },
        { h: 15000, rx: '', q: 1, cIdx: 6, ni: 'Infus set dewasa', n: 'Infus set dewasa' },
        { h: 5000, rx: '', q: 1, ni: '3 way stop', cIdx: 7, n: '3 way stop' },
        { h: 15000, rx: '', q: 1, ni: 'Abocath 24G', cIdx: 5, n: 'Abocath 24G' },
        { h: 75000, rx: 'Rawat Inap 2 hari', q: 2, ni: 'Rawat Inap', cIdx: 0, n: 'Rawat Inap', cmPaid: true, cmRef: 'COM-1794125135563-heft', cmDt: '2026-11-08', cmAmt: 20000, cmDoc: 'Dokter 2' }
      ],
      no: 266, vt: [{ dt: '2026-11-07', s: 41.2, b: 2 }],
      nt: [{ tx: 'Tidak mau makan\nLemas\nPemasangan infus\nDisuapin makan tidak mau\nDehidrasi 7%', photos: [] }],
      m: 'Tunai', rp: [], pDt: '2026-11-06', docs: [],
      payments: [
        { method: 'Tunai', amount: 500000, id: 'PAY-1794017756671-my4r4e', date: '2026-11-07' },
        { id: 'RFD-1794046574805-iqr89v', method: 'Refund (Tunai)', date: '2026-11-07', amount: -243500 }
      ]
    },
    {
      c: 2, dt: '2026-11-06', j: '09:11', k: 'Vaksin', s: 'Selesai', d: 'Dokter 2',
      it: [{ rx: 'Dosis Flat: 1 Vial/ekor (1x/hr, 1 hr). Total: 1', cmAmt: 15000, cmDt: '2026-11-08', q: 1, h: 75000, ni: 'Vaksin Kucing', cmPaid: true, cmRef: 'COM-1794125135563-heft', n: 'Nobivac Tricat', cmDoc: 'Dokter 2', cIdx: 4 }],
      no: 265, vt: [{ dt: '2026-11-07', s: 38.9, b: 5.1 }], nt: [], m: 'QRIS / E-Wallet', rp: [], pDt: '2026-11-06', docs: [],
      payments: [{ id: 'PAY-1794017740223-f6syoy', date: '2026-11-07', method: 'QRIS / E-Wallet', amount: 75000 }]
    },
    {
      c: 0, dt: '2026-11-06', j: '07:14', k: 'Tidak mau makan', s: 'Selesai', d: 'Dokter',
      it: [
        { cmPaid: true, ni: 'Periksa dan Konsultasi', cIdx: 12, n: 'Periksa dan Konsultasi', cmDoc: 'Dokter', cmRef: 'COM-1794010818855-9w84', rx: '', q: 1, h: 50000, cmDt: '2026-11-07', cmAmt: 35000 },
        { q: 3, cIdx: 8, ni: 'Antihistamin', h: 5000, n: 'Cetirizine', rx: 'Dosis Flat: 0.5 tablet/ekor (1x/hr, 5 hr). Total: 2.5' }
      ],
      no: 264, vt: [{ b: 3, dt: '2026-11-07', s: 39.5 }], nt: [], m: 'QRIS / E-Wallet', rp: [], pDt: '2026-11-06', docs: [],
      payments: [{ date: '2026-11-07', amount: 65000, method: 'QRIS / E-Wallet', id: 'PAY-1794010597215-cvolvc' }]
    }
  ],
  sl: [
    { dt: '2026-11-04', t: 500000, m: 'Tunai', ref: 'PAY-1793754731370-p0p198' },
    { dt: '2026-11-04', t: 75000, m: 'Kartu Debit/Kredit', ref: 'PAY-1793782440254-jifww4' },
    { dt: '2026-11-06', t: 85000, m: 'Kartu Debit/Kredit', ref: 'PAY-1793929829337-a67v3v' },
    { dt: '2026-11-07', t: 65000, m: 'QRIS / E-Wallet', ref: 'PAY-1794010597215-cvolvc' },
    { dt: '2026-11-07', t: 75000, m: 'QRIS / E-Wallet', ref: 'PAY-1794017740223-f6syoy' },
    { dt: '2026-11-07', t: 500000, m: 'Tunai', ref: 'PAY-1794017756671-my4r4e' }
  ],
  ex: [
    { dt: '2026-11-08', k: 'Komisi Dokter', ket: 'Komisi Dokter Dokter 2: Periksa dan Konsultasi x1, Rawat Inap x2, Nobivac Tricat x1 (cash)', j: 70000, r: 'admin', ref: 'COM-1794125135563-heft' },
    { dt: '2026-11-08', k: 'Komisi Dokter', ket: 'Komisi Dokter Dokter: Nobivac Tricat x1 (tunai)', j: 15000, r: 'admin', ref: 'COM-1794125120928-er11' },
    { dt: '2026-11-07', k: 'Refund', ket: 'Kembalikan Kelebihan Bayar: Chiki', j: 243500, r: 'admin', ref: 'RFD-1794046574805-iqr89v' },
    { dt: '2026-11-07', k: 'Komisi Dokter', ket: 'Komisi Dokter Dokter: Periksa dan Konsultasi x3, Rawat Inap x1 (Tunai)', j: 115000, r: 'admin', ref: 'COM-1794010818855-9w84' },
    { dt: '2026-11-04', k: 'Refund', ket: 'Kembalikan Kelebihan Bayar: Chiki', j: 373500, r: 'admin', ref: 'RFD-1793754806481-wjo40x' }
  ],
  ct: [
    { t: 's', n: 'Rawat Inap', ni: 'Rawat Inap', h: 75000, mgkg_min: '', mgkg_max: '', d_ekor: '', mgper: '', unit: '', freq: '', dur: '', stk: '', doses: [{ _isComm: true, defType: 'Rp', defVal: 0, docs: { dokter2: { t: 'Rp', v: 5000 }, dokter: { v: 10000, t: 'Rp' } } }] },
    { t: 'p', n: 'Channa albumin', ni: 'Albumin', h: 30000, mgkg_min: 0, mgkg_max: 0, d_ekor: 0, mgper: 500, unit: 'Kapsul', freq: 2, dur: 10, stk: 0, doses: [] },
    { t: 'p', n: 'DHPPL', ni: 'Vaksin Anjing', h: 185000, mgkg_min: 0, mgkg_max: 0, d_ekor: 1, mgper: 0, unit: 'vial', freq: 1, dur: 1, stk: 0, doses: [] },
    { t: 'p', n: 'Amox injeksi', ni: 'Antibiotik injeksi', h: 1500, mgkg_min: 1, mgkg_max: 1, d_ekor: 0, mgper: 10, unit: 'Injeksi', freq: 1, dur: 1, stk: 94, doses: [{ unit: 'mg/kg', title: 'Dog & Cat', min: 1, max: 1 }] },
    { t: 'p', n: 'Nobivac Tricat', ni: 'Vaksin Kucing', h: 75000, mgkg_min: 0, mgkg_max: 0, d_ekor: 1, mgper: 0, unit: 'Vial', freq: 1, dur: 1, stk: 1, doses: [] },
    { t: 'p', n: 'Abocath 24G', ni: 'Abocath 24G', h: 15000, mgkg_min: 0, mgkg_max: 0, d_ekor: 0, mgper: 0, unit: 'PCS', freq: 2, dur: 5, stk: 24, doses: [] },
    { t: 'p', n: 'Infus set dewasa', ni: 'Infus set dewasa', h: 15000, mgkg_min: 0, mgkg_max: 0, d_ekor: 1, mgper: 0, unit: 'PCS', freq: 1, dur: 1, stk: 27, doses: [] },
    { t: 'p', n: '3 way stop', ni: '3 way stop', h: 5000, mgkg_min: 0, mgkg_max: 0, d_ekor: 0, mgper: 0, unit: 'PCS', freq: 1, dur: 1, stk: 7, doses: [] },
    { t: 'p', n: 'Cetirizine', ni: 'Antihistamin', h: 5000, mgkg_min: 1, mgkg_max: 1, d_ekor: 0.5, mgper: 10, unit: 'tablet', freq: 1, dur: 5, stk: 22, doses: [{ min: 1, unit: 'Mg/kg', max: 1, title: 'Dog q12h' }] },
    { t: 'p', n: 'Meloxicam Injeksi', ni: 'NSAID Injeksi', h: 35000, mgkg_min: 0.04, mgkg_max: 0.04, d_ekor: 0, mgper: 1, unit: 'Injeksi', freq: 1, dur: 1, stk: 0, doses: [{ title: 'Dog q24h', max: 0.04, min: 0.04, unit: 'mg/kg' }, { title: 'Cat q24h', unit: 'mg/kg', max: 0.059, min: 0.059 }] },
    { t: 'p', n: 'Molnupiravir 200 mg', ni: 'Obat Virus', h: 45000, mgkg_min: 5, mgkg_max: 10, d_ekor: 0, mgper: 200, unit: 'tablet', freq: 2, dur: 5, stk: 0, doses: [{ max: 10, unit: 'mg/kg', min: 5, title: 'FIP / Panleukopenis & Parvo Virus' }] },
    { t: 'p', n: 'Imidox', ni: 'Obat Parasit darah', h: 35000, mgkg_min: 0.02, mgkg_max: 0.02, d_ekor: 0, mgper: 1, unit: 'Injeksi', freq: 1, dur: 1, stk: 0, doses: [{ title: 'Dog & Cat Piroplasmosis', max: 0.02, min: 0.02, unit: 'mg/kg' }, { max: 0.05, min: 0.05, title: 'Dog ehrlichiosis spp, hepatozoonosis, babesiosis q14day', unit: 'mg/kg' }, { unit: 'mg/kg', min: 0.02, title: 'cat Cytauxzoonosis spp. q3-7days', max: 0.02 }] },
    { t: 's', n: 'Periksa dan Konsultasi', ni: 'Periksa dan Konsultasi', h: 50000, mgkg_min: '', mgkg_max: '', d_ekor: '', mgper: '', unit: '', freq: '', dur: '', stk: '', doses: [{ _isComm: true, defType: 'Rp', defVal: 35000, docs: { dokter: { t: 'Rp', v: 35000 }, dokter2: { t: 'Rp', v: 35000 } } }] },
    { t: 'p', n: 'Caniverm', ni: 'Caniverm', h: 35000, mgkg_min: 1, mgkg_max: 1, d_ekor: 0, mgper: 1, unit: 'tablet', freq: 2, dur: 5, stk: 0, doses: [{ unit: 'mg/kg', min: 1, max: 1, title: 'Dog & Cat' }] },
    { t: 'p', n: 'Methylprednisolon 8 mg', ni: 'Antiinflamasi Steroid', h: 5000, mgkg_min: 0.2, mgkg_max: 0.5, d_ekor: 0, mgper: 8, unit: 'tablet', freq: 2, dur: 5, stk: 0, doses: [{ min: 0.2, title: 'Dog q12h', unit: 'mg/kg', max: 0.5 }, { min: 1, unit: 'mg/kg', title: 'Cat q24h', max: 1 }] }
  ],
  md: [
    { dt: '2026-11-07', m: 200000 }
  ],
  lt: [
    { title: 'Pulang Paksa', content: 'Saya {nama_pemilik} yang bertanda tangan dibawah ini :\n\nSudah mendengarkan penjelasan {nama_dokter} serta diberikan kesempatan untuk bertanya hal yang belum dimengerti dan kesempatan berdiskusi atas hewan milik saya. Dengan ini membawa hewan saya untuk melanjutkan Pelayanan Medik Veteriner dirumah\n\nSaya memahami konsekuensi yang terjadi setelah membawa pulang hewan saya, oleh sebab itu saya tidak akan mengajukan keberatan ataupun tuntutan di kemudian hari atas konsekuensi dari tindakan pembatalan tersebut.\n\nDemikian pernyataan saya buat dengan penuh kesadaran dan tanpa keterpaksaan dari pihak manapun.' },
    { title: 'Penolakan Tindakan Medis', content: 'Saya {nama_pemilik} yang bertanda tangan dibawah ini :\n\nSudah mendengarkan penjelasan {nama_dokter} serta diberikan kesempatan untuk bertanya hal yang belum dimengerti dan kesempatan berdiskusi atas hewan milik saya. Dengan ini memberikan PENOLAKAN Untuk melanjutkan Pelayanan Medik Veteriner tersebut.\n\nSaya memahami konsekuensi yang akan terjadi setelah pembatalan tindakan medis yang akan diberikan kepada hewan saya, oleh sebab itu saya tidak akan mengajukan keberatan ataupun tuntutan di kemudian hari atas konsekuensi dari tindakan pembatalan tersebut.\n\nDemikian pernyataan saya buat dengan penuh kesadaran dan tanpa keterpaksaan dari pihak manapun.' }
  ],
  pos: [],
  set: [
    { k: 'nm', v: 'Manajemen Klinik Hewan' },
    { k: 'wt', v: JSON.stringify([
      { n: 'Pasca Vaksinasi', t: 'Halo Kak {pemilik},\nTerimakasih sudah mempercayakan {pasien} kepada kami, berikut {invoice}\n\nSemoga selalu sehat\n{klinik}' },
      { n: 'Pengiriman Invoice', t: 'Halo Kak {pemilik}, \n\nTerimakasih sudah mempercayakan perawatan {pasien} kepada kami, berikut kami sampaikan tagihan {invoice}\n\nSemoga sehat kembali\n{klinik}' },
      { n: 'Kontrol', t: 'Selamat pagi\nBagaimana kondisi {pasien} hari ini?\nMengingatkan bila hari ini waktunya kontrol\n\nTerimakasih\n{klinik}' }
    ]) },
    { k: 'dc', v: JSON.stringify([{ n: 'Rawat Inap', t: '%', v: 10 }, { n: 'vaksinasi', t: 'Rp', v: 10000 }]) },
    { k: 'cm', v: JSON.stringify({
      'Rawat Inap': { _isComm: true, defType: 'Rp', defVal: 0, docs: { dokter: { t: 'Rp', v: 10000 }, dokter2: { t: 'Rp', v: 5000 } } },
      'Periksa dan Konsultasi': { _isComm: true, defType: 'Rp', defVal: 35000, docs: { dokter: { t: 'Rp', v: 35000 }, dokter2: { t: 'Rp', v: 35000 } } }
    }) },
    { k: 'seq', v: '267' },
    { k: 'version', v: '38' }
  ]
};

// Membaca database dari disk (atau menginisialisasi jika belum ada)
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDB(INITIAL_DB);
      return JSON.parse(JSON.stringify(INITIAL_DB));
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB Read Error]:', err);
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }
}

// Menyimpan database ke disk secara atomik (aman dari kerusakan file jika listrik/VPS mati mendadak)
function writeDB(dbObj) {
  const tmpFile = DB_FILE + '.tmp';
  const jsonStr = JSON.stringify(dbObj, null, 2);
  fs.writeFileSync(tmpFile, jsonStr, 'utf8');
  fs.renameSync(tmpFile, DB_FILE);

  // Buat cadangan otomatis harian (1 file per tanggal)
  try {
    const today = new Date().toISOString().slice(0, 10);
    const backupFile = path.join(BACKUP_DIR, `db-backup-${today}.json`);
    if (!fs.existsSync(backupFile)) {
      fs.writeFileSync(backupFile, jsonStr, 'utf8');
    }
  } catch (e) {}
}

// Helper membaca body JSON dari request HTTP POST (mendukung ukuran hingga 25 MB untuk foto/tanda tangan)
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Ukuran data melebihi batas 25 MB'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(payload);
}

const SHEET_KEYS = ['users', 'cl', 'ap', 'sl', 'ex', 'ct', 'md', 'lt', 'pos'];

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // 1. Layani Foto Klinis dari folder ./uploads/
    if (req.method === 'GET' && pathname.startsWith('/uploads/')) {
      const safeName = path.basename(pathname);
      const imgPath = path.join(UPLOADS_DIR, safeName);
      if (fs.existsSync(imgPath)) {
        const ext = path.extname(safeName).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
        res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=31536000' });
        fs.createReadStream(imgPath).pipe(res);
        return;
      }
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    // 2. Endpoint GET /api/loadData
    if (pathname === '/api/loadData' && req.method === 'GET') {
      const db = readDB();
      const ver = parseInt(db.version, 10) || 0;
      const dataObj = {
        users: db.users || [],
        cl: db.cl || [],
        ap: db.ap || [],
        sl: db.sl || [],
        ex: db.ex || [],
        ct: db.ct || [],
        md: db.md || [],
        lt: db.lt || [],
        pos: db.pos || [],
        set: db.set || []
      };
      return sendJson(res, 200, {
        status: 'success',
        version: ver,
        dataStr: JSON.stringify(dataObj)
      });
    }

    // 3. Endpoint POST /api/saveData
    if (pathname === '/api/saveData' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const payload = body.payload || body || {};
      const db = readDB();
      const currentVer = parseInt(db.version, 10) || 0;
      const clientVer = body.clientVersion !== undefined ? parseInt(body.clientVersion, 10) : (parseInt(payload.version, 10) || currentVer);

      if (payload.base && clientVer !== currentVer) {
        return sendJson(res, 200, {
          status: 'conflict',
          version: currentVer,
          serverVersion: currentVer,
          message: 'Data telah diperbarui oleh pengguna lain.'
        });
      }

      const newVer = currentVer + 1;
      db.version = newVer;

      SHEET_KEYS.forEach((k) => {
        if (payload[k] !== undefined) {
          db[k] = payload[k] || [];
        }
      });

      if (payload.set && Array.isArray(payload.set)) {
        const setArr = payload.set;
        let hasVer = false;
        for (let i = 0; i < setArr.length; i++) {
          if (setArr[i].k === 'version') {
            setArr[i].v = String(newVer);
            hasVer = true;
            break;
          }
        }
        if (!hasVer) {
          setArr.push({ k: 'version', v: String(newVer) });
        }
        db.set = setArr;
      }

      writeDB(db);
      return sendJson(res, 200, { status: 'success', version: newVer });
    }

    // 4. Endpoint POST /api/uploadPhoto
    if (pathname === '/api/uploadPhoto' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const rawUrl = String(body.dataUrl || '');
      const photoId = 'PHOTO_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const fileName = `${photoId}.jpg`;
      const filePath = path.join(UPLOADS_DIR, fileName);

      let base64Data = rawUrl;
      if (base64Data.includes('base64,')) {
        base64Data = base64Data.split('base64,')[1];
      }

      if (base64Data) {
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        const publicUrl = `/uploads/${fileName}`;
        return sendJson(res, 200, {
          status: 'success',
          fileId: fileName,
          id: fileName,
          url: publicUrl,
          thumb: publicUrl
        });
      }

      return sendJson(res, 200, {
        status: 'success',
        fileId: photoId,
        id: photoId,
        url: rawUrl,
        thumb: rawUrl
      });
    }

    // 5. Endpoint POST /api/deletePhoto
    if (pathname === '/api/deletePhoto' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const fileId = String(body.fileId || '');
      if (fileId) {
        const safeName = path.basename(fileId);
        const targetPath = path.join(UPLOADS_DIR, safeName);
        if (fs.existsSync(targetPath)) {
          try { fs.unlinkSync(targetPath); } catch (e) {}
        }
      }
      return sendJson(res, 200, { status: 'success' });
    }

    // 6. Layani Antarmuka Web App (Index.html)
    if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html' || pathname === '/Index.html')) {
      const htmlCandidates = ['Index.html', 'index.html'];
      for (const name of htmlCandidates) {
        const p = path.join(ROOT_DIR, name);
        if (fs.existsSync(p)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
          fs.createReadStream(p).pipe(res);
          return;
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File Index.html tidak ditemukan di folder server.');
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch (err) {
    console.error('[Server Error]:', err);
    sendJson(res, 500, { status: 'error', message: err.message || String(err) });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🐾 Server Manajemen Klinik Hewan Aktif!`);
  console.log(`🌐 URL Lokal / VPS : http://0.0.0.0:${PORT}`);
  console.log(`💾 Lokasi Database : ${DB_FILE}`);
  console.log(`📷 Lokasi Foto     : ${UPLOADS_DIR}`);
  console.log(`====================================================`);
});