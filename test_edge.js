const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const server = http.createServer((req, res) => {
  const p = path.join('c:/Users/WINDOWS/Documents/antigravity/magical-hawking/salon-yamila', req.url === '/' ? 'index.html' : req.url);
  if (fs.existsSync(p)) {
    res.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'application/javascript' : (p.endsWith('.css') ? 'text/css' : 'text/html') });
    res.end(fs.readFileSync(p));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(8888, () => {
  try {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const html = execSync(`"${edgePath}" --headless --virtual-time-budget=3000 --dump-dom http://127.0.0.1:8888/index.html`, { encoding: 'utf8' });
    const match = html.match(/id="badge-conexion"[^>]*>[\s\S]*?<\/span>/);
    console.log('BADGE HTML:', match ? match[0] : 'Not found');
  } catch(e) {
    console.error('Exec error:', e.message);
  } finally {
    server.close();
  }
});
