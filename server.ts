import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDb, DB_NAME } from './server/db.ts';
import { seedDatabase } from './server/seed.ts';
import { createApiRouter } from './server/routes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3100;
const isProd = process.env.NODE_ENV === 'production';

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
        // Avoid fixed HMR websocket port collisions when another Vite is running
        hmr: { port: Number(process.env.HMR_PORT) || 24679 }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(__dirname, 'dist');
    app.use(express.static(dist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(dist, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] TaskPro running on http://localhost:${PORT}`);
    console.log(`[server] MongoDB database: ${DB_NAME}`);
    console.log(`[server] API: http://localhost:${PORT}/api/health`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[server] Port ${PORT} is already in use.`);
      console.error(`[server] Another TaskPro/Vite instance is probably still running.`);
      console.error(`[server] Fix (PowerShell):`);
      console.error(`  Get-NetTCPConnection -LocalPort ${PORT} | Select-Object OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`);
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
