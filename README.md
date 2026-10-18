# Lost & Found App

A full-stack mobile app for reporting and finding lost items. Users can post lost or found items with images, categorize them, and mark items as resolved when recovered.

## Running and operating it on Kubernetes

The backend runs on a local **kind** cluster behind ingress-nginx, packaged with **Helm**,
built and verified by **GitHub Actions**, and observed with **Prometheus/Grafana**,
structured logs, and **OpenTelemetry → Jaeger** traces.

| Doc | What it covers |
|---|---|
| [docs/BASELINE.md](docs/BASELINE.md) | Starting point (commit `d484255`) and what existed before |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture, request path, failure boundaries, every design choice and its alternative |
| [docs/RUNBOOK.md](docs/RUNBOOK.md) | What to do for each alert |
| [docs/EVIDENCE.md](docs/EVIDENCE.md) | Pipeline run, deployed version, user journey, rollback, fault/recovery, dashboards |

### Prerequisites

macOS or Linux with Docker (Docker Desktop: ≥ 4 CPUs / 8 GB RAM for the full monitoring stack),
`kind` ≥ 0.27, `kubectl`, `helm` ≥ 4, `make`, `openssl`; `gh` (GitHub CLI) for the CI-gated deploy.
`brew install kind helm kubectl gh` covers it.

### Build and deploy

```bash
make cluster                  # kind cluster + ingress-nginx, metrics-server, Prometheus/Grafana/Alertmanager, Jaeger
make deploy SHA=<commit>      # deploy the image CI built for <commit> (refuses if that commit's CI failed)
# or, without GHCR/CI:
make deploy-local             # build the current commit locally, load into kind, deploy
make smoke                    # register → post an item → list it, through the ingress
```

`make deploy` runs `scripts/deploy.sh`: creates the Secret if missing (generated values,
never stored in Git), `helm upgrade --install --rollback-on-failure` with
`image.tag=<sha7>`, then `helm test`.

### Access

| What | How |
|---|---|
| API | http://lostnfound.localtest.me:8080/api (resolves to 127.0.0.1) — e.g. `curl http://lostnfound.localtest.me:8080/version` |
| Grafana | `make grafana` → http://localhost:3000, user `admin`, password: `make grafana-password`; dashboard “Lost & Found — Service Health” |
| Prometheus / alerts | `make prometheus` → http://localhost:9090/alerts |
| Jaeger | `make jaeger` → http://localhost:16686, service `lostnfound-api` |
| Logs | `kubectl -n lostnfound logs -l app.kubernetes.io/name=lostnfound-api -f` (JSON, with `trace_id`) |
| Mobile app | point `frontend/src/api/axios.ts` `baseURL` at `http://<your-LAN-IP>:8080/api` |

### Release operations

```bash
helm history lostnfound -n lostnfound                 # what ran when, by commit
helm rollback lostnfound <revision> -n lostnfound --wait
helm upgrade lostnfound deploy/helm/lostnfound -n lostnfound --reuse-values \
  --set api.features.itemSearch=true                  # feature flag, no rebuild
```

### Pipeline

`.github/workflows/ci.yml` on every PR and push to `main`: lint + tests + `npm audit` →
gitleaks secret scan → helm lint + Trivy config scan → build image tagged with the commit SHA
→ Trivy image scan → push to `ghcr.io/kkartikay-27/lostnfound-api:<sha7>` → deploy that image to
a throwaway kind cluster in the runner and run `helm test`.

### Known limitations

- Single-node MongoDB (no replica set); its local-path volume is tied to one kind node. No backups.
- The deploy to the laptop cluster is triggered by a person (`make deploy`), gated on CI, because GitHub-hosted runners cannot reach a local cluster. See DECISIONS → CI/CD.
- Kubernetes Secrets are not encrypted at rest in kind; no Sealed Secrets/External Secrets.
- HTTP only (no TLS) on the local ingress, bound to 127.0.0.1.
- Logs are not shipped to a central store (no Loki); Jaeger keeps traces in memory.
- Rate limits are per pod, not global.
- The Expo frontend is unchanged and not containerised; the user journey is exercised through the API.
- ingress-nginx is retired upstream; fine locally, but a real cluster should use Gateway API or another controller.

## Problem Statement

People often lose personal belongings or find items that others have lost. This app bridges that gap by allowing users to:
- Report lost items with details and photos
- Report found items to help return them
- Browse and search through listings
- Contact and coordinate returns

## Tech Stack Used

### Frontend (React Native/Expo)
- **Framework**: Expo Router with file-based routing
- **Language**: TypeScript
- **State Management**: React Context (AuthContext)
- **Storage**: AsyncStorage for token persistence
- **UI**: React Native components, expo-image-picker, expo-status-bar
- **HTTP**: Axios with interceptors for auth and 401 handling
- **Image Hosting**: Cloudinary (signed uploads)

### Backend (Node.js/Express)
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT with bcrypt for password hashing
- **Image Upload**: Cloudinary SDK with signature generation
- **Validation**: Input validation and error handling

## Features Implemented

- **Authentication**: Secure JWT-based login/registration with case-insensitive emails.
- **Item Management**:
  - Post lost or found items with title, description, location, optional category, and image.
  - View items in a feed with filters (All/Lost/Found).
  - Pull-to-refresh on lists.
  - View item details with poster information and full-screen image viewer.
- **Image Upload**:
  - Secure signed Cloudinary uploads.
  - Choose from library or take a photo with camera.
  - Image previews in cards and item details.
- **User Dashboard**:
  - View own posts (My Posts) with resolved status indicator.
  - Profile page with post counts and resolved items.
  - Owner actions: Mark as Resolved, Delete.
- **UI/UX**:
  - Consistent headers across the app.
  - SafeAreaView support to avoid system UI overlaps.
  - Loading states and error handling.
  - Responsive design with modern components.

## How to Run the Project Locally

### Prerequisites

- Node.js (v20+)
- npm or yarn
- MongoDB (local or cloud)
- Expo CLI (`npx expo install`)
- Cloudinary account (for image uploads)

### 1. Clone the repository
```bash
git clone https://github.com/KKartikay-27/lost-n-found
cd lost-n-found
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
MONGO_URI=mongodb://localhost:27017/lostnfound
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Start the backend:
```bash
npm run dev      # or: npm test / npm run lint
```
The server runs on `http://localhost:5050`.

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

Update `app.config.ts` to include any additional Expo extras if needed.

Start the frontend:
```bash
npx expo start
```
Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Basic API Documentation

### Authentication Endpoints
- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Login a user
- `GET /api/auth/verify` – Verify token and get user data

### Item Endpoints
- `GET /api/items` – Get all unresolved items (optional `?type=lost|found`; `?q=text` when `FEATURE_ITEM_SEARCH` is on)
- `GET /api/items/my-items` – Get current user’s items
- `GET /api/items/:id` – Get item details
- `POST /api/items` – Create a new item
- `PATCH /api/items/:id/resolve` – Mark item as resolved
- `DELETE /api/items/:id` – Delete an item (owner only)

### Operational Endpoints
- `GET /healthz` – liveness (process is up)
- `GET /readyz` – readiness (MongoDB connected); cluster-internal
- `GET /version` – running commit and build time
- `GET /metrics` – Prometheus metrics; cluster-internal

### Upload Endpoint
- `POST /api/upload/sign` – Get Cloudinary signed upload params (auth required)

## Project Structure

```
lost-n-found/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── config/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (tabs)/
│   │   ├── item/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── constants/
│   │   ├── utils/
│   │   └── config/
│   ├── app.config.ts
│   └── package.json
└── README.md
```
