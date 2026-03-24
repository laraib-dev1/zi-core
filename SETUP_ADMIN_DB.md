# Use Admin Database on Cluster0

## Problem
`ecommerce_user` with `readWriteAnyDatabase@admin` **cannot** access the `admin` database itself (MongoDB security restriction).

## Solution: Create a new user with explicit admin database access

### Step 1: Create new user in MongoDB Atlas

1. Go to **MongoDB Atlas** → **Database Access**
2. Click **"+ ADD NEW DATABASE USER"**
3. Fill in:
   - **Username:** `portfolio_admin_user` (or any name you want)
   - **Password:** Create a strong password (save it!)
   - **Database User Privileges:** Select **"Specific database"**
     - **Database:** `admin`
     - **Role:** `readWrite`
4. Click **Add User**

### Step 2: Update MONGO_URI

Replace `ecommerce_user` with your new user:

**Old (doesn't work):**
```
mongodb+srv://ecommerce_user:PASSWORD@cluster0....mongodb.net/admin?...
```

**New (works):**
```
mongodb+srv://portfolio_admin_user:YOUR_NEW_PASSWORD@cluster0.ttptlcr.mongodb.net/admin?retryWrites=true&w=majority&appName=Cluster0
```

### Step 3: Update your .env files

**backend/.env:**
```env
MONGO_URI=mongodb+srv://portfolio_admin_user:YOUR_NEW_PASSWORD@cluster0.ttptlcr.mongodb.net/admin?retryWrites=true&w=majority&appName=Cluster0
```

**backend/.env.local:** (same)

### Step 4: Update Vercel Environment Variables

- Backend project → **Settings** → **Environment Variables**
- Update **MONGO_URI** with the new user and password
- Redeploy

---

## Option 2: Use existing `myUser` (if you have the password)

If you have the password for `myUser` (which has `atlasAdmin@admin` role), you can use that:

```env
MONGO_URI=mongodb+srv://myUser:MYUSER_PASSWORD@cluster0.ttptlcr.mongodb.net/admin?retryWrites=true&w=majority&appName=Cluster0
```

---

## Why this happens

- `readWriteAnyDatabase@admin` grants access to **all databases EXCEPT admin**
- The `admin` database is special and requires explicit permissions
- `atlasAdmin@admin` or explicit `readWrite` on `admin` database works
