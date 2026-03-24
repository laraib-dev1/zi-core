# Deploy Portfolio (Frontend + Backend) on Vercel

Your repo has **two apps** in one folder: `frontend/` and `backend/`. You deploy them as **two separate Vercel projects** from the **same GitHub repo**. That fixes the **404** you see when deploying the root.

---

## Why you get 404

Vercel is building from the **root** of the repo. The root has no `package.json` build or static files, so there is nothing to serve → **404: NOT FOUND**.

---

## Step 1: Connect your new GitHub repo (once)

1. Push your **Portfolio** project to your **new** GitHub repo (the one you want to use).
2. In **Vercel**:  
   - Either **edit the existing “portfolio” project** and change the Git repo,  
   - Or **add a new project** and import from the new repo.
3. To **change repo** on an existing project:
   - Open the project → **Settings** → **Git**.
   - Under **Connected Git Repository**, click **Disconnect** (if it was the old repo).
   - Click **Connect Git Repository** and choose your **new** GitHub repo.
4. You will use this **same repo** for both the frontend and backend projects (see below).

---

## Step 2: Deploy the **frontend** (first Vercel project)

1. In Vercel: **Add New** → **Project** → import your **new** GitHub repo.
2. Name it e.g. **portfolio-frontend** (or keep “portfolio” for the frontend only).
3. **Root Directory**: click **Edit** and set to **`frontend`**.
4. **Framework Preset**: Vite (Vercel usually detects it).
5. **Build Command**: `npm run build` (default).
6. **Output Directory**: `dist` (Vite default).
7. **Environment variables** (Settings → Environment Variables):
   - `VITE_API_URLS` = `http://localhost:3000/api,https://YOUR-BACKEND-URL.vercel.app/api`  
     Replace `YOUR-BACKEND-URL` with your **backend** Vercel URL (you’ll set this after deploying the backend).
8. Deploy. Your site will be at e.g. `portfolio-frontend.vercel.app` (or whatever you named it).

---

## Step 3: Deploy the **backend** (second Vercel project)

1. In Vercel: **Add New** → **Project** → import the **same** GitHub repo again.
2. Name it e.g. **portfolio-backend**.
3. **Root Directory**: set to **`backend`**.
4. **Build**: Vercel will use `backend/vercel.json` (no extra build command needed for Node).
5. **Environment variables** (same place as above). Add the same ones as in your `backend/.env`:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY` (if you use Stripe)
   - `CLOUDINARY_*` (if you use Cloudinary)
   - **`FRONTEND_URLS`** = `http://localhost:5174,https://YOUR-FRONTEND-URL.vercel.app`  
     Replace `YOUR-FRONTEND-URL` with your **frontend** Vercel URL (e.g. `portfolio-frontend.vercel.app`).
6. Deploy. Your API will be at e.g. `portfolio-backend.vercel.app`.

---

## Step 4: Link frontend and backend

1. **Frontend project**  
   - **Settings** → **Environment Variables**  
   - Set `VITE_API_URLS` = `http://localhost:3000/api,https://portfolio-backend.vercel.app/api`  
   - Redeploy the frontend so the new env is applied.

2. **Backend project**  
   - **Settings** → **Environment Variables**  
   - Set `FRONTEND_URLS` = `http://localhost:5174,https://portfolio-frontend.vercel.app`  
   - Redeploy the backend.

After this, the live frontend will call the live backend, and CORS will allow it.

---

## Summary

| What              | Where in repo | Root Directory | Result URL              |
|-------------------|---------------|----------------|-------------------------|
| Frontend (Vite)   | `frontend/`   | `frontend`     | portfolio-frontend.vercel.app |
| Backend (Node)    | `backend/`    | `backend`      | portfolio-backend.vercel.app   |

- **One GitHub repo** (Portfolio) → **two Vercel projects** (frontend + backend).
- **404** is fixed by setting **Root Directory** to `frontend` for the app you’re serving as the website.
- To use your **new** repo: connect it in **Settings → Git** (or create new projects and import the new repo for both).

---

## Run on localhost AND on Vercel (same codebase)

The app is set up so **one codebase** works both locally and on Vercel. The env vars use **two URLs** (comma-separated):

| Env var          | First URL (localhost)     | Second URL (production)        |
|------------------|---------------------------|--------------------------------|
| **VITE_API_URLS** (frontend) | `http://localhost:3000/api` | `https://your-backend.vercel.app/api` |
| **FRONTEND_URLS** (backend)  | `http://localhost:5174`     | `https://your-frontend.vercel.app`   |

**How it works:**
- When you open the app on **localhost** (e.g. `npm run dev` in `frontend/`), the frontend uses the **first** URL → talks to your **local** backend.
- When you open the app on **Vercel** (your frontend URL), the frontend uses the **second** URL → talks to your **Vercel** backend.

**What to set:**

1. **Local (`.env` in `frontend/` and `backend/`)**  
   Use your real Vercel URLs for the second value so the same file works for local dev and for any build:
   - `frontend/.env`: `VITE_API_URLS=http://localhost:3000/api,https://YOUR-BACKEND.vercel.app/api`
   - `backend/.env`: `FRONTEND_URLS=http://localhost:5174,https://YOUR-FRONTEND.vercel.app`

2. **Vercel (Environment Variables in dashboard)**  
   Same format: first = localhost, second = production. Vercel builds use the second URL when users visit your live site.
   - Frontend project: `VITE_API_URLS=http://localhost:3000/api,https://YOUR-BACKEND.vercel.app/api`
   - Backend project: `FRONTEND_URLS=http://localhost:5174,https://YOUR-FRONTEND.vercel.app`

**Local run:**
- Backend: `cd backend && npm run dev` (e.g. port 3000).
- Frontend: `cd frontend && npm run dev` (e.g. port 5174).
- Open `http://localhost:5174` → frontend calls `http://localhost:3000/api` automatically.
