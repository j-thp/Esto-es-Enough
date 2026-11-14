const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'logo-instagram.png');
const SVG = path.join(__dirname, 'logo-instagram.svg');

// Fetch Cormorant Garamond 300 woff2 URL from Google Fonts CSS
function fetchText(url) {
  return new Promise((res, rej) => {
    const opts = new URL(url);
    https.get({ hostname: opts.hostname, path: opts.pathname + opts.search, headers: { 'User-Agent': 'Mozilla/5.0' } }, r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); r.on('error', rej);
    }).on('error', rej);
  });
}

function fetchBinary(url) {
  return new Promise((res, rej) => {
    const opts = new URL(url);
    https.get({ hostname: opts.hostname, path: opts.pathname + opts.search }, r => {
      const chunks = []; r.on('data', c => chunks.push(c)); r.on('end', () => res(Buffer.concat(chunks))); r.on('error', rej);
    }).on('error', rej);
  });
}

(async () => {
  console.log('Descargando fuente Cormorant Garamond...');
  const css = await fetchText('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300&display=swap');
  const urlMatch = css.match(/src:\s*url\(([^)]+)\)\s*format\('([^']+)'\)/);
  if (!urlMatch) { console.error('No se encontró la URL de la fuente'); process.exit(1); }

  const fontUrl = urlMatch[1];
  const fontFormat = urlMatch[2];
  const mimeMap = { truetype: 'font/ttf', woff: 'font/woff', woff2: 'font/woff2', opentype: 'font/otf' };
  const mime = mimeMap[fontFormat] || 'font/ttf';

  const fontBuf = await fetchBinary(fontUrl);
  const b64 = fontBuf.toString('base64');
  const fontFace = `@font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 300; src: url('data:${mime};base64,${b64}') format('${fontFormat}'); }`;

  const svgOriginal = fs.readFileSync(SVG, 'utf8');
  const svgWithFont = svgOriginal.replace(
    /@import url\([^)]+\);/,
    fontFace
  );
  const tmpSVG = path.join(__dirname, '_logo-tmp.svg');
  fs.writeFileSync(tmpSVG, svgWithFont);
  console.log('SVG con fuente embebida listo.');

  // Try to find Edge or Chrome
  const browsers = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  const { execFile } = require('child_process');
  const browser = browsers.find(b => fs.existsSync(b));
  if (!browser) { console.error('No se encontró Edge ni Chrome'); process.exit(1); }

  console.log('Usando:', browser);
  const fileUrl = 'file:///' + tmpSVG.replace(/\\/g, '/');

  await new Promise((res, rej) => {
    execFile(browser, [
      '--headless', '--disable-gpu', '--no-sandbox',
      '--screenshot=' + OUT,
      '--window-size=1080,1080',
      fileUrl
    ], { timeout: 15000 }, (err, stdout, stderr) => {
      if (err) rej(err); else res();
    });
  });

  fs.unlinkSync(tmpSVG);
  if (fs.existsSync(OUT)) {
    console.log('✓ logo-instagram.png guardado (' + Math.round(fs.statSync(OUT).size / 1024) + ' KB)');
  } else {
    console.error('El archivo PNG no se generó');
  }
})().catch(e => { console.error(e.message); process.exit(1); });
