# Backend crash ho raha ho? Yeh steps follow karo

## Step 1: Vercel pe backend project kholo
- vercel.com → login → **backend** wala project (portfolio-sh6y ya portfolio-backend) open karo

## Step 2: Deployments pe jao
- Upar **Deployments** tab pe click karo
- Sabse upar wala (latest) deployment pe click karo

## Step 3: Logs kholo
- Us deployment page pe **"Logs"** ya **"Runtime Logs"** ya **"Function"** section dhundo
- **"View Function Logs"** / **"Logs"** pe click karo

## Step 4: Error copy karo
- Wahan red colour mein error message aata hai (jaise "MONGO_URI is not defined" ya "Cannot connect to MongoDB")
- Us message ko copy karke kisi ko bhejo ya khud fix karo

## Step 5: Environment Variables check karo
- Backend project → **Settings** → **Environment Variables**
- Ye 3 zaroor honi chahiye:
  - **MONGO_URI** (MongoDB connection string)
  - **JWT_SECRET** (koi bhi secret word)
  - **FRONTEND_URLS** (http://localhost:5174,https://tumhari-frontend-url.vercel.app)

Agar koi missing hai to add karo, Save karo, phir **Redeploy** karo.
