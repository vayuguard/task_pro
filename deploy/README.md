# Deploy notes (Hostinger / Linux VPS)

TaskPro runs on **port 3100** by default (avoids 3000 / 4000 / 8000).

## Requirements

- **Node.js 20+** (Node 19 is EOL and often breaks optional native deps)
- Do **not** copy `node_modules` from Windows — always install on the VPS

## Clean install + build (fixes Rollup error)

If you see:

`Cannot find module @rollup/rollup-linux-x64-gnu`

run this on the VPS:

```bash
cd /root/task_pro   # or your project path

# Upgrade Node if needed (NodeSource 20.x)
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# sudo apt-get install -y nodejs

rm -rf node_modules
# keep package-lock.json if present; only delete it if install still fails:
# rm -f package-lock.json

npm install
npm run build
```

Quick one-liner if you only need the missing package:

```bash
npm install @rollup/rollup-linux-x64-gnu@4.62.2
npm run build
```

## Start with PM2

```bash
# .env must include PORT=3100 and MONGODB_URI=...
NODE_ENV=production pm2 start ecosystem.config.cjs
# or: pm2 start "npx tsx server.ts" --name taskpro --update-env
pm2 save
```

Health check:

```bash
curl http://127.0.0.1:3100/api/health
```

Nginx sample: `deploy/nginx-taskpro.conf` (proxies to `127.0.0.1:3100`).
