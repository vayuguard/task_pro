import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDb, DB_NAME } from './server/db.ts';
import { seedDatabase } from './server/seed.ts';
import { createApiRouter } from './server/routes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3100;
const dist = path.join(__dirname, 'dist');
const distReady = fs.existsSync(path.join(dist, 'index.html'));
// Prefer built assets whenever dist exists (PM2 sometimes omits NODE_ENV)
const isProd = process.env.NODE_ENV === 'production' || distReady;

async function start() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Connect + seed dedicated database
  const db = await connectDb();
  await seedDatabase(db, false);

  app.use('/api', createApiRouter());

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { port: Number(process.env.HMR_PORT) || 24679 }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    if (!distReady) {
      console.error('[server] dist/ missing. Run: npm run build');
    }
    app.use(express.static(dist));
    app.get('*', (_req, res) => {
      const indexFile = path.join(dist, 'index.html');
      if (!fs.existsSync(indexFile)) {
        res.status(500).send('Frontend not built. Run npm run build on the server.');
        return;
      }
      res.sendFile(indexFile);
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] TaskPro running on http://localhost:${PORT}`);
    console.log(`[server] Mode: ${isProd ? 'production (serving dist)' : 'development (vite)'}`);
    console.log(`[server] MongoDB database: ${DB_NAME}`);
    console.log(`[server] API: http://localhost:${PORT}/api/health`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[server] Port ${PORT} is already in use.`);
      console.error(`[server] Another TaskPro/Vite instance is probably still running.`);
      console.error(`[server] Fix (PowerShell):`);
      console.error(
        `  Get-NetTCPConnection -LocalPort ${PORT} | Select-Object OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`
      );
      console.error(`  npm run dev\n`);
      process.exit(1);
    }
    throw err;
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
