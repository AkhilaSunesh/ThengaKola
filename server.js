const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Load .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.substring(0, idx).trim();
          const val = trimmed.substring(idx + 1).trim();
          env[key] = val;
        }
      }
    });
  }
  return env;
}

const env = loadEnv();
const PORT = process.env.PORT || env.PORT || 3000;
const ROBOFLOW_API_KEY = env.ROBOFLOW_API_KEY || '';
const ROBOFLOW_LOC_MODEL = env.ROBOFLOW_LOCALIZATION_MODEL || 'coconut-bunch-detection/11';
const ROBOFLOW_MAT_MODEL = env.ROBOFLOW_MATURITY_MODEL || 'coconut-maturity-detection/6';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoint: /api/detect (Secures Roboflow API Key server-side)
  if (req.url === '/api/detect' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { imageBase64 } = JSON.parse(body);
        if (!imageBase64) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing imageBase64 payload' }));
          return;
        }

        // Call Roboflow Localization
        const locUrl = `https://detect.roboflow.com/${ROBOFLOW_LOC_MODEL}?api_key=${ROBOFLOW_API_KEY}&confidence=20`;
        const locResponse = await makeRoboflowRequest(locUrl, imageBase64);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          model: ROBOFLOW_LOC_MODEL,
          maturityModel: ROBOFLOW_MAT_MODEL,
          predictions: locResponse.predictions || [],
          image: locResponse.image || {}
        }));
      } catch (err) {
        console.error('API Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API Endpoint: /api/classify-maturity (Maturity model per cropped coconut)
  if (req.url === '/api/classify-maturity' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { cropBase64 } = JSON.parse(body);
        const matUrl = `https://classify.roboflow.com/${ROBOFLOW_MAT_MODEL}?api_key=${ROBOFLOW_API_KEY}`;
        const matResponse = await makeRoboflowRequest(matUrl, cropBase64);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(matResponse));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static File Serving
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

// Helper for calling Roboflow Inference HTTPS
function makeRoboflowRequest(apiUrl, base64Image) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(apiUrl);
    const postData = base64Image;

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || `Roboflow error HTTP ${res.statusCode}`));
          }
        } catch (e) {
          reject(new Error('Invalid JSON response from Roboflow: ' + data));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

server.listen(PORT, () => {
  console.log(`[THENGA KOLA] Official Server running securely at http://localhost:${PORT}`);
  console.log(`[ROBOFLOW] Localization Model: ${ROBOFLOW_LOC_MODEL}`);
  console.log(`[ROBOFLOW] Maturity Model: ${ROBOFLOW_MAT_MODEL}`);
  console.log(`[KEY] Loaded safely from .env`);
});
