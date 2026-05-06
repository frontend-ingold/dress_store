# Dressify Ecommerce Starter

This project creates two folders:

- `frontend`: React + Vite ecommerce UI for dresses
- `backend`: Node.js + Express API with PostgreSQL

## Project structure

```text
frontend/
backend/
```

## Frontend setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Set `VITE_API_URL` in `frontend/.env` if your backend runs on a different URL.

## Backend setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

First create the database `dress_store`, then run `backend/database/schema.sql` inside that database using `psql`, pgAdmin, or another PostgreSQL client.

Use this backend environment:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=HappyAvijit2024@
DB_NAME=dress_store
```

## API endpoints

- `GET /api/health`
- `GET /api/products`
- `GET /api/categories`
- `POST /api/orders`

## Deployment notes

- Frontend can be deployed to Vercel, Netlify, or any static host.
- Backend can be deployed separately on Render, Railway, VPS, or any Node host.
- Update CORS `CLIENT_URL` and frontend `VITE_API_URL` before deployment.
