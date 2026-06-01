# Deploy QueueSense (Vercel + Render)

## 1. MongoDB Atlas

Create a free cluster and copy the connection string into `MONGO_URI`.

## 2. Render (backend + ML)

1. [render.com](https://render.com) → **New** → **Blueprint**
2. Connect this repo (uses root `render.yaml`)
3. After deploy, copy both URLs:
   - `https://queuesense-backend.onrender.com` (API)
   - `https://queuesense-ml.onrender.com` (ML)

4. In **queuesense-backend** → **Environment**, set:

   | Variable | Value |
   |----------|--------|
   | `MONGO_URI` | Your Atlas connection string |
   | `JWT_SECRET` | Long random secret |
   | `ML_SERVICE_URL` | ML service URL from step 3 |
   | `CLIENT_ORIGIN` | Your Vercel URL (set after step 3) |

5. Redeploy backend after env vars are saved.

Health checks: `GET /` (backend), `GET /health` (ML).

## 3. Vercel (frontend)

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import repo
2. **Root Directory**: `Frontend`
3. **Environment Variables**:

   | Variable | Value |
   |----------|--------|
   | `VITE_API_URL` | Backend Render URL (no trailing slash) |

4. Deploy and copy your app URL, e.g. `https://your-app.vercel.app`

5. Go back to Render → **queuesense-backend** → set `CLIENT_ORIGIN` to that Vercel URL → redeploy.

## 4. Local `.env` files (optional)

```bash
# Frontend/.env
VITE_API_URL=https://queuesense-backend.onrender.com

# Backend/.env — see Backend/.env.example
```

## Quick link checklist

| Service | Platform | Env var |
|---------|----------|---------|
| Frontend | Vercel | `VITE_API_URL` → backend URL |
| API | Render | `ML_SERVICE_URL` → ML URL, `CLIENT_ORIGIN` → Vercel URL |
| ML | Render | (none required for inference) |
