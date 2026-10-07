// GET /c/:code?n=Name  (rewritten to /api/card?code=..&n=..) -> a tiny HTML page with WhatsApp/OG preview tags, then into the app.
const STATES = {AB:'Abia',AD:'Adamawa',AK:'Akwa Ibom',AN:'Anambra',BA:'Bauchi',BY:'Bayelsa',BN:'Benue',BO:'Borno',CR:'Cross River',DT:'Delta',EB:'Ebonyi',ED:'Edo',EK:'Ekiti',EN:'Enugu',FC:'FCT Abuja',GM:'Gombe',IM:'Imo',JG:'Jigawa',KD:'Kaduna',KN:'Kano',KT:'Katsina',KB:'Kebbi',KG:'Kogi',KW:'Kwara',LA:'Lagos',NS:'Nasarawa',NG:'Niger',OG:'Ogun',OD:'Ondo',OS:'Osun',OY:'Oyo',PL:'Plateau',RV:'Rivers',SO:'Sokoto',TR:'Taraba',YB:'Yobe',ZM:'Zamfara'};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function page(host, code, name) {
  const c = String(code || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  const st = STATES[c];
  const n = String(name || '').replace(/[^\p{L}\p{N} .'-]/gu, '').trim().slice(0, 30);
  const base = 'https://' + (host || 'nysc-companion-ng.vercel.app');
  const title = st ? `${n ? n + ' is' : 'I\'m'} heading to ${st} camp 🇳🇬` : `${n ? n + ' is' : 'I\'m'} heading to NYSC camp 🇳🇬`;
  const desc = '2026 Batch C Stream II camp opens Nov 4. Get your free camp checklist, countdown and camp guide on NYSC Companion. Not affiliated with the NYSC.';
  const img = base + '/og/' + (st ? c : 'default') + '.jpg';
  const to = '/?ref=card' + (st ? '#/camps/' + c : '#/');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="NYSC Companion"><meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${esc(img)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(base + '/c/' + (c || 'NG'))}"><meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${esc(to)}"><style>body{font:16px system-ui;background:#0a7a45;color:#fff;display:grid;place-items:center;height:100vh;margin:0}</style></head>
<body><a style="color:#fff" href="${esc(to)}">Open NYSC Companion</a><script>location.replace(${JSON.stringify(to)})</script></body></html>`;
}
module.exports = (req, res) => {
  const q = req.query || {};
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400');
  res.status(200).send(page(req.headers['x-forwarded-host'] || req.headers.host, q.code, q.n));
};
module.exports.page = page;
