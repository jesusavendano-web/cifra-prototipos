// Servidor estático mínimo para previsualizar los prototipos: node serve.js
// - /modules/reports/ -> /modules/reports/index.html (resolución de carpetas a cualquier profundidad)
// - Bloquea rutas fuera de la raíz del repo (..)
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT) || 4321;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(req.url.split('?')[0].split('#')[0]); } catch (e) { return send(res, 400, 'Bad request'); }
  const file = path.normalize(path.join(root, p));
  if (file !== root && !file.startsWith(root + path.sep)) return send(res, 403, 'Forbidden');

  fs.stat(file, (err, stat) => {
    if (err) return send(res, 404, 'Not found');
    if (stat.isDirectory()) {
      // /modules/reports -> /modules/reports/ para que las rutas relativas resuelvan bien
      if (!p.endsWith('/')) {
        res.writeHead(301, { Location: p + '/' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '') });
        return res.end();
      }
      return serveFile(path.join(file, 'index.html'), res);
    }
    serveFile(file, res);
  });
}).listen(port, () => console.log(`Prototipos en http://localhost:${port}`));

function serveFile(file, res) {
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, data, types[path.extname(file).toLowerCase()] || 'application/octet-stream');
  });
}
