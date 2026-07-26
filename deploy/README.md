# Deploy notes (Hostinger / Linux VPS)

TaskPro runs on **port 3100** by default (avoids 3000 / 4000 / 8000).

## Requirements

- **Node.js 20.19+ or 22 LTS** — **Node 19 will fail** (Vite / Tailwind / MongoDB do not support it)
- Install dependencies **on the VPS** — never copy `node_modules` from Windows

Check version:

```bash
node -v   # must be v20.x or v22.x — NOT v19
```

## Upgrade Node to 20 on Ubuntu (Hostinger)

```bash
# Remove old Node if needed, then install Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

node -v   # expect v20.x.x
npm -v
```

If `node -v` still shows v19, you likely have another Node (nvm / snap). Fix with one of:

```bash
# Option A: nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
hash -r
node -v

# Option B: see which binary is first
which -a node
# remove/disable the v19 path, or put Node 20 earlier in PATH
```

## Clean install + build

```bash
cd ~/task_pro   # or /root/task_pro

rm -rf node_modules
rm -f package-lock.json

npm install
npm run build
```

### If native binding / Rollup / Tailwind oxide still fails

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm install @rollup/rollup-linux-x64-gnu@4.62.2
npm run build
```

## Start with PM2

```bash
# .env must include PORT=3100 and MONGODB_URI=...
NODE_ENV=production pm2 start ecosystem.config.cjs
pm2 save
```

Use the **same Node 20** for PM2:

```bash
pm2 delete taskpro 2>/dev/null
# ensure `which node` is v20, then:
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Health check:

```bash
curl http://127.0.0.1:3100/api/health
```

Nginx sample: `deploy/nginx-taskpro.conf` (proxies to `127.0.0.1:3100`).
