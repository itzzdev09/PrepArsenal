# PrepArsenal DevOps, Docker & Kubernetes Scaling Architecture

This guide provides the complete blueprint for running, containerizing, orchestrating, and horizontally scaling **PrepArsenal** across development, staging, and multi-cloud Kubernetes environments.

---

## 1. System Architecture Overview

```
                         [ Global CDN / Cloudflare ]
                                      │
                                      ▼
                        [ Ingress Controller (Nginx) ]
                       (TLS Termination / Rate Limiting)
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           ▼                                                     ▼
[ Next.js Web Pods (HPA: 2-25) ]                        [ Python ML CronJobs ]
  ├── Standalone Node 20 runtime                          ├── ml_trend_engine.py (Daily)
  ├── Non-root (uid: 1001)                                └── dataset_harvester.py (Weekly)
  ├── Readiness / Liveness Probes                                │
  │                                                              │
  ├───────────────► [ Redis In-Cluster Cache ] ◄─────────────────┘
  │                 (Session / AI Tutor / Rate Limits)
  │
  ├───────────────► [ Supabase PostgreSQL / BaaS ]
  │
  └───────────────► [ Google Gemini / Groq LLM APIs ]
```

---

## 2. Docker Architecture

### 2.1 Next.js Multi-Stage Build (`Dockerfile`)
The Web Dockerfile leverages a 4-stage build process:
1. **`base`**: Minimal `node:20-alpine` with `libc6-compat` and `curl`.
2. **`deps`**: Deterministic dependency installation with `npm ci`.
3. **`builder`**: Builds Next.js in `output: "standalone"` mode.
4. **`runner`**: Ultra-lean Alpine runtime (~150MB image size) running as non-privileged user `nextjs:nodejs` (UID 1001), with native HTTP `/api/health` health checking.

### 2.2 Local Multi-Container Stack (`docker-compose.yml`)
Run the full production-like environment on your machine (Next.js, Python Worker, Redis, Nginx Gateway):

```bash
# 1. Start all services in the background
docker-compose up -d --build

# 2. View live logs
docker-compose logs -f web

# 3. Check health status
docker-compose ps

# 4. Stop all services
docker-compose down
```

### 2.3 Exposed Ports in Docker Compose
- **Nginx Gateway:** `http://localhost` (Port 80)
- **Next.js Web App:** `http://localhost:3000` (Direct)
- **Redis Cache:** `localhost:6379`

---

## 3. Kubernetes Orchestration (`k8s/`)

### 3.1 Directory Structure
```
k8s/
├── base/
│   ├── namespace.yaml           # preparsenal namespace
│   ├── configmap.yaml           # Application settings
│   ├── secret.example.yaml      # Secret credentials template
│   ├── deployment.yaml          # Next.js high-availability deployment
│   ├── service.yaml             # ClusterIP service
│   ├── ingress.yaml             # Ingress with TLS & rate limiting
│   ├── hpa.yaml                 # HorizontalPodAutoscaler (2-15 pods)
│   ├── pdb.yaml                 # PodDisruptionBudget (minAvailable: 1)
│   ├── redis.yaml               # Redis cache deployment & service
│   ├── cronjob-ml-trends.yaml   # Nightly ML topic calculation (02:00 UTC)
│   ├── cronjob-harvester.yaml   # Weekly PYQ data harvester (Sun 04:00 UTC)
│   └── kustomization.yaml       # Base Kustomize manifest
└── overlays/
    ├── staging/                 # Staging environment (1 replica, staging domain)
    └── production/              # Production environment (4-25 replicas, production domain)
```

### 3.2 Key Kubernetes Features Implemented
- **Zero-Downtime Rolling Deployments**: `maxSurge: 25%`, `maxUnavailable: 0`.
- **Health Probes**: `startupProbe`, `livenessProbe`, and `readinessProbe` all check `/api/health`.
- **Pod Anti-Affinity**: Distributes pods across different physical worker nodes.
- **Security Hardening**: `runAsNonRoot: true`, `readOnlyRootFilesystem: false`, capabilities dropped.
- **Horizontal Autoscaling (HPA)**: Auto-scales pods when CPU exceeds 70% or Memory exceeds 80%.
- **Pod Disruption Budget (PDB)**: Guarantees uptime during node maintenance or Kubernetes version upgrades.
- **Batch CronJobs**: Asynchronously runs Python data pipelines without consuming web pod resources.

---

## 4. Helm Deployment (`helm/preparsenal/`)

Deploy PrepArsenal with a single command using Helm:

```bash
# 1. Install / Upgrade Staging
helm upgrade --install preparsenal-staging ./helm/preparsenal \
  --namespace preparsenal-staging \
  --create-namespace \
  -f ./helm/preparsenal/values.yaml

# 2. Install / Upgrade Production
helm upgrade --install preparsenal-prod ./helm/preparsenal \
  --namespace preparsenal-prod \
  --create-namespace \
  -f ./helm/preparsenal/values.prod.yaml \
  --set secrets.geminiApiKey="YOUR_GEMINI_KEY" \
  --set secrets.supabasePublishableKey="YOUR_SUPABASE_KEY"
```

---

## 5. Deployment Commands & Cheat Sheet

### 5.1 Local Testing with Minikube or Kind
```bash
# Start Minikube
minikube start --cpus=4 --memory=8192

# Enable Ingress & Metrics Server (for HPA)
minikube addons enable ingress
minikube addons enable metrics-server

# Apply base manifests with Kustomize
kubectl apply -k k8s/base

# Check pods and services
kubectl get pods -n preparsenal
kubectl get hpa -n preparsenal
```

### 5.2 Deploying to AWS EKS
```bash
# 1. Update kubeconfig
aws eks update-kubeconfig --region ap-south-1 --name preparsenal-eks-cluster

# 2. Apply Secrets
kubectl create secret generic preparsenal-secrets \
  --namespace preparsenal-prod \
  --from-literal=NEXT_PUBLIC_GEMINI_API_KEY="your-gemini-key" \
  --from-literal=NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-key"

# 3. Deploy via Kustomize
kubectl apply -k k8s/overlays/production
```

### 5.3 Deploying to Google Kubernetes Engine (GKE)
```bash
# 1. Authenticate with GKE
gcloud container clusters get-credentials preparsenal-cluster --region asia-south1

# 2. Deploy Helm Chart
helm upgrade --install preparsenal ./helm/preparsenal \
  --namespace preparsenal-prod \
  --create-namespace \
  -f ./helm/preparsenal/values.prod.yaml
```

### 5.4 Deploying to DigitalOcean Kubernetes (DOKS)
```bash
doctl kubernetes cluster kubeconfig save preparsenal-cluster
kubectl apply -k k8s/overlays/production
```

---

## 6. CI/CD Pipeline (`.github/workflows/`)

| Workflow File | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Pull Requests & Pushes | Lints, verifies TypeScript types, and executes Next.js build. |
| `docker-build-push.yml` | Push to `main` or Git Tag | Builds multi-platform (`amd64`, `arm64`) Docker images using Buildx and pushes them to GitHub Container Registry (`ghcr.io`). |
| `k8s-deploy.yml` | Image build complete | Triggers automated Kustomize/Helm rollout to target Kubernetes cluster. |

---

## 7. Scaling & Optimization Strategy

1. **Edge Static Caching:** `next.config.ts` sends `Cache-Control: public, max-age=31536000, immutable` for static chunks, reducing pod traffic by >85%.
2. **AI Tutor SSE Streaming:** Ingress and Nginx proxy buffers are disabled (`proxy_buffering off`) with 180s timeouts to support real-time token streaming from Google Gemini without dropping connections.
3. **Database Offloading:**
   - Static PYQ read queries are cached in in-cluster Redis (`maxmemory-policy allkeys-lru`).
   - Dynamic user submissions (XP, reviews) write directly to Supabase with connection pooling enabled (PgBouncer).
4. **HPA Fast Scale-Up:** Web pods scale up aggressively (100% capacity boost within 15 seconds) when exam traffic spikes during results or exam test dates.
