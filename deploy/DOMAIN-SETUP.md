# Point teamtasks.vayuguard.com at TaskPro (port 3100)

## 1) DNS (Hostinger domain panel)

For domain **vayuguard.com**, add an **A record**:

| Type | Name / Host | Value              | TTL  |
|------|-------------|--------------------|------|
| A    | teamtasks   | YOUR_VPS_PUBLIC_IP | 300  |

This creates `teamtasks.vayuguard.com`.

Wait 5–30 minutes, then check:

```bash
ping teamtasks.vayuguard.com
# or: dig +short teamtasks.vayuguard.com
```

It must resolve to your VPS IP.

## 2) App must be running on the VPS

```bash
cd ~/task_pro
pm2 status
curl http://127.0.0.1:3100/api/health
```

If not running:

```bash
NODE_ENV=production pm2 start ecosystem.config.cjs
pm2 save
```

## 3) Nginx reverse proxy

```bash
# install nginx if needed
sudo apt update
sudo apt install -y nginx

# create site config
sudo nano /etc/nginx/sites-available/teamtasks
```

Paste:

```nginx
server {
    listen 80;
    server_name teamtasks.vayuguard.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/teamtasks /etc/nginx/sites-enabled/teamtasks
sudo nginx -t
sudo systemctl reload nginx
```

Or copy from the repo:

```bash
sudo cp ~/task_pro/deploy/nginx-teamtasks.conf /etc/nginx/sites-available/teamtasks
sudo ln -sf /etc/nginx/sites-available/teamtasks /etc/nginx/sites-enabled/teamtasks
sudo nginx -t && sudo systemctl reload nginx
```

## 4) Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Also open **80** and **443** in Hostinger VPS firewall if that panel is enabled.

## 5) HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d teamtasks.vayuguard.com
```

Follow prompts (email, agree to terms). Certbot will update Nginx for HTTPS.

## 6) MongoDB Atlas

In Atlas → **Network Access**, allow your VPS public IP (or the IP ranges you use).

## 7) Test

- http://teamtasks.vayuguard.com (should redirect to https after certbot)
- https://teamtasks.vayuguard.com
- Login with your admin account

## Troubleshooting

| Problem | Check |
|---------|--------|
| DNS not resolving | A record `teamtasks` → VPS IP; wait for propagation |
| 502 Bad Gateway | `pm2 status` / `pm2 logs taskpro` — app must listen on 3100 |
| Connection refused | Firewall 80/443; Nginx running: `sudo systemctl status nginx` |
| Wrong site | Another Nginx `server_name` catching the host; disable default site if needed: `sudo rm /etc/nginx/sites-enabled/default` |
