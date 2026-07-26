/**
 * PM2 process file for Hostinger / Linux VPS.
 * Uses port 3100 so it does not clash with apps on 3000, 4000, or 8000.
 *
 * Usage:
 *   npm run build
 *   pm2 delete taskpro
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 */
module.exports = {
  apps: [
    {
      name: 'taskpro',
      script: './node_modules/.bin/tsx',
      args: 'server.ts',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3100
      },
      max_memory_restart: '512M',
      time: true
    }
  ]
};
