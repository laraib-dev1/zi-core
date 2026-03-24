# Backend Server Setup Guide

## Quick Start

The backend server needs to be running for the frontend to work. Here's how to start it:

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies (if not already installed)
```bash
npm install
```

### 3. Create `.env` File
Create a `.env` file in the `backend` directory with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=3000
NODE_ENV=development
```

### 4. Start the Server

**For Development (with auto-reload):**
```bash
npm run dev
```

**For Production:**
```bash
npm start
```

### 5. Verify Server is Running
You should see:
```
✅ Server running on http://localhost:3000
MongoDB connected: ...
```

### 6. Create Admin User (for admin panel login)
Run the seed script once to create the default admin:
```bash
cd backend
npm run seed-admin
```
This creates (or updates) the only admin: **admin@gmail.com** / **11223344**. Use these to log in to the admin panel.

## Required Environment Variables

- **MONGO_URI**: Your MongoDB connection string (e.g., `mongodb://localhost:27017/your-db-name` or MongoDB Atlas connection string)
- **JWT_SECRET**: A secret key for JWT token generation (any random string)
- **CLOUDINARY_***: Cloudinary credentials for image uploads (optional if not using image uploads)
- **STRIPE_SECRET_KEY**: Stripe secret key for payments (optional if not using payments)
- **PORT**: Server port (defaults to 3000)

## Troubleshooting

### Connection Refused Error
If you see `ERR_CONNECTION_REFUSED`:
1. Make sure the backend server is running
2. Check that the server is running on port 3000 (or the port specified in `.env`)
3. Verify your `.env` file exists and has correct values

### MongoDB Connection Error
If you see MongoDB connection errors:
1. Make sure MongoDB is running (if using local MongoDB)
2. Check your `MONGO_URI` is correct
3. If using MongoDB Atlas, verify your IP is whitelisted

### Port Already in Use
If port 3000 is already in use:
1. Change the `PORT` in your `.env` file
2. Or stop the process using port 3000

## Running Both Frontend and Backend

You need **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend typically runs on `http://localhost:5174` and the backend on `http://localhost:3000`.






