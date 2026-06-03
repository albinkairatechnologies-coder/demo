// server.js - Simple local development server for testing
// Run with: node server.js

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser to avoid external dependencies
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let val = parts.slice(1).join('=').trim();
        // Remove surrounding quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    });
  }
} catch (e) {
  console.warn("Could not load .env file:", e.message);
}

import handler from './api/health-check.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  // Helper to mimic Vercel's res.status().json()
  res.status = (code) => {
    res.statusCode = code;
    return {
      json: (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      },
      end: () => res.end()
    };
  };

  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // Route: /api/health-check
  if (req.url === '/api/health-check') {
    // Read request body
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      req.body = body;
      try {
        await handler(req, res);
      } catch (err) {
        console.error("Handler error:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    return;
  }

  // Serve static files (like index.html)
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Basic security check to stay within the directory
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html');
      res.end('<h1>404 Not Found</h1>');
    } else {
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      if (ext === '.js') contentType = 'text/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.json') contentType = 'application/json';
      
      res.setHeader('Content-Type', contentType);
      res.statusCode = 200;
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Local Dev Server running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop.\n`);
});
