# Vera DO Ops Runbook

Quick operational checklist for the `vera.italofarve.com` deployment.

## 1) Access

- SSH:
  ```bash
  ssh -i ~/.ssh/id_ed25519_vera_do root@64.226.108.163
  ```
- If SSH stops working, update DO firewall SSH source to your current public IP in CIDR `/32`.

## 2) Locations

- Repo on server: `~/vera-hiring-tracker-cursor`
- Docker compose dir: `~/vera-hiring-tracker-cursor/docker`

## 3) Daily health checks

```bash
cd ~/vera-hiring-tracker-cursor/docker
docker compose ps
curl -i https://vera.italofarve.com/api/healthz
```

Expected:
- all services `Up`
- `db` healthy
- `/api/healthz` returns `200` with `{"status":"ok"}`

## 4) Logs

```bash
cd ~/vera-hiring-tracker-cursor/docker
docker compose logs --tail 120 api
docker compose logs --tail 120 proxy
docker compose logs --tail 120 web
docker compose logs --tail 120 db
```

## 5) Deploy update from `deploy/do-vm`

```bash
cd ~/vera-hiring-tracker-cursor
git checkout deploy/do-vm
git pull
cd docker
docker compose up -d --build
docker compose ps
```

For frontend-only changes:

```bash
cd ~/vera-hiring-tracker-cursor/docker
docker compose build web --progress=plain
docker compose up -d web proxy
docker compose ps
```

## 6) Env/config changes

When changing `docker/.env` or `docker/allowed-emails.csv`, recreate API:

```bash
cd ~/vera-hiring-tracker-cursor/docker
docker compose up -d --force-recreate api
```

Verify OCR/env values inside the container:

```bash
docker compose exec api sh -lc 'env | grep -E "^CV_OCR_|^CV_STORAGE_PROVIDER|^LOCAL_CV_STORAGE_DIR"'
```

Recommended OCR values:

```env
CV_OCR_FALLBACK_ENABLED=true
CV_OCR_TIMEOUT_MS=30000
CV_OCR_LANG=eng
CV_OCR_MIN_TEXT_LENGTH=40
CV_OCR_MAX_PAGES=5
CV_STORAGE_PROVIDER=local
LOCAL_CV_STORAGE_DIR=/app/uploads
```

## 7) Allowlist checks

The allowlist file must be a regular file, not a directory.

```bash
cd ~/vera-hiring-tracker-cursor/docker
ls -l allowed-emails.csv
```

Expected: line starts with `-` (regular file).

Check mounted file in container:

```bash
docker compose exec api sh -lc 'sed -n "1,40p" /app/artifacts/api-server/data/allowed-emails.csv'
docker compose exec api sh -lc 'grep -in "ifarfan@faculty.ie.edu" /app/artifacts/api-server/data/allowed-emails.csv'
```

## 8) Database backup/restore

Backup:

```bash
cd ~/vera-hiring-tracker-cursor/docker
docker compose exec db pg_dump -U vera vera_hiring > backup-$(date +%F).sql
```

Restore:

```bash
cat backup-YYYY-MM-DD.sql | docker compose exec -T db psql -U vera vera_hiring
```

Current reference demo backup used during setup:
- `backups/vera-db-20260501-161613.sql` (copied from local machine to server when needed).

## 9) Low-memory server notes (1GB RAM)

- Builds can be slow/stall.
- Keep swap enabled:

```bash
swapon --show
free -h
```

If missing:

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 10) Sensitive data policy

- Never commit real secrets:
  - `docker/.env`
  - API keys/tokens/passwords
- Safe to commit:
  - `docker/.env.example` (placeholders only)
  - docs/runbooks/checklists
