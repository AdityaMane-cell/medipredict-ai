# Deployment & Operations Guide

## Local Development

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 2. Install backend
pip install -r requirements.txt

# 3. Start services
docker-compose up -d

# 4. Run migrations (future: Alembic)
# For now, SQLAlchemy auto-creates tables on first run

# 5. Start API
uvicorn api.app:app --reload --host 0.0.0.0 --port 8000

# 6. In another terminal, start frontend
cd web
npm install
npm run dev

# 7. Open http://localhost:5173
```

## Docker Deployment

### Build

```bash
docker build -t health-ai:latest .
```

### Run Single Container

```bash
docker run -d \
  -e DATABASE_URL="postgresql://user:pass@db:5432/healthai" \
  -e SECRET_KEY="your-secret" \
  -p 8000:8000 \
  health-ai:latest
```

### Run with Compose (Recommended)

```bash
docker-compose up -d
# Starts API + PostgreSQL automatically
# API available at http://localhost:8000
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Secrets in AWS Secrets Manager / Azure Key Vault (not `.env`)
- [ ] Database backups configured (daily snapshots)
- [ ] HTTPS/TLS certificate (Let's Encrypt)
- [ ] CORS origins restricted to your domain
- [ ] Rate limits tuned for expected traffic
- [ ] Logging aggregated (ELK / DataDog / CloudWatch)
- [ ] Monitoring alerts set (health check, error rate)
- [ ] Backup restore tested

### Kubernetes Deployment (Future)

```yaml
# helm/health-ai/values.yaml
replicaCount: 3
image:
  repository: yourdomain/health-ai
  tag: "1.0.0"
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
postgresql:
  enabled: true
  auth:
    password: secretpassword
```

Deploy with:

```bash
helm install health-ai ./helm/health-ai -n prod
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name api.healthai.com;

    ssl_certificate /etc/letsencrypt/live/api.healthai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.healthai.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring & Alerting

### Health Checks

```bash
# Manual
curl http://localhost:8000/health

# Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 30
```

### Metrics Export

```bash
# Prometheus scrape config
scrape_configs:
  - job_name: 'health-ai'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```

### Log Aggregation

**ELK Stack Example**:

```bash
# Forward JSON logs to Elasticsearch
docker run -d \
  -e ELASTICSEARCH_HOSTS=https://elk:9200 \
  -v /app/logs:/var/log/app \
  filebeat:8.0
```

## Database Maintenance

### Backup

```bash
# PostgreSQL dump
docker exec health-ai-db pg_dump -U healthai healthai > backup.sql

# Automated daily backups
0 2 * * * pg_dump -U healthai healthai | gzip > /backups/healthai-$(date +\%Y\%m\%d).sql.gz
```

### Restore

```bash
docker exec health-ai-db psql -U healthai healthai < backup.sql
```

### Cleanup

```bash
# Remove old prediction history (>1 year)
DELETE FROM prediction_history WHERE created_at < NOW() - INTERVAL '1 year';
VACUUM ANALYZE;
```

## Performance Tuning

### Database Connection Pooling

```python
# api/db.py
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40,
    pool_recycle=3600
)
```

### Redis Caching (Optional)

```python
from redis import Redis

cache = Redis(host='localhost', port=6379)

# Cache symptoms list (24h TTL)
def get_symptoms_cached():
    cached = cache.get('symptoms')
    if cached:
        return json.loads(cached)

    symptoms = available_symptoms()
    cache.setex('symptoms', 86400, json.dumps(symptoms))
    return symptoms
```

## Security Hardening

### CORS Configuration

```python
# In production, restrict to specific domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://healthai.com", "https://app.healthai.com"],  # Not "*"
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)
```

### Rate Limiting Tuning

```python
# Stricter for prediction endpoints
@limiter.limit("5/minute")
def predict(req: SymptomRequest, ...):
    ...

# Relaxed for symptom list
@limiter.limit("100/minute")
def list_symptoms():
    ...
```

### HTTPS Enforcement

```python
# In production, add to Nginx or reverse proxy
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## Rollback Plan

```bash
# If new version breaks production:

# 1. Scale down new version
docker service scale api=0

# 2. Rollback database (if schema changed)
./scripts/rollback-db.sh

# 3. Deploy previous version
docker service update --image health-ai:previous api

# 4. Verify
curl http://api.healthai.com/health
```

## Troubleshooting

| Issue                              | Solution                                                   |
| ---------------------------------- | ---------------------------------------------------------- |
| **API won't start**                | Check `DATABASE_URL` in `.env`; verify PostgreSQL running  |
| **Rate limit errors**              | Increase `limit` values; use API key for trusted clients   |
| **401 Unauthorized**               | JWT expired → re-login; check `SECRET_KEY` matches         |
| **Slow predictions**               | Load test with `ab` or `k6`; consider model caching        |
| **Database connection pooled out** | Increase `pool_size` in `db.py`; check for hanging queries |
| **CORS errors**                    | Add frontend domain to `allow_origins`                     |

## Support Contacts

- **DevOps**: ops@company.com
- **On-Call**: Pagerduty integration
- **Incident**: #incidents Slack channel

---

Last updated: 2026-04-02
