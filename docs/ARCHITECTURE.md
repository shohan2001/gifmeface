# Architecture & Implementation Guide

## Overview
MemeFace is a full-stack web application designed to create personalized meme GIFs. It leverages React for the frontend, Express/Node.js for the backend, and Google Gemini AI for intelligent face validation.

## Core Workflows

### 1. Face Validation
**Goal:** Ensure the uploaded image contains a usable human face.
**Implementation:**
- **Frontend:** User uploads an image via `FaceUploader` (using `react-dropzone`).
- **Processing:** The image is converted to Base64.
- **AI Service:** We call `gemini-2.5-flash-image` via the `@google/genai` SDK.
- **Prompt Engineering:** We ask the model to return a JSON object `{ isValid: boolean, reason: string }` confirming if a clear face is present.
- **Fallback:** If the API fails (e.g., rate limits), we fail open or provide a mock success for demo purposes.

### 2. GIF Catalog & Search
**Goal:** Provide a searchable library of trending memes.
**Implementation:**
- **Backend (`server.ts`):** 
  - We maintain a `MOCK_GIFS` array acting as our database.
  - The `/api/gifs` endpoint accepts a `?q=` query parameter.
  - It filters the array based on the `title` property.
- **Frontend:** 
  - `GifSelector` component includes a search input.
  - It debounces input (optional optimization) or triggers on submit to call `fetchGifs` in `App.tsx`.

### 3. Face "Swapping" (Composition)
**Goal:** Place the user's face onto the GIF.
**Implementation:**
- **Technique:** For this web-based prototype, we use a **DOM Overlay** technique rather than server-side deepfaking (which requires heavy GPU compute).
- **Editor:** `MemeEditor` uses `motion/react` to create a draggable, scalable `div` containing the user's face on top of the GIF.
- **UX:** Users can position and resize their face to match the meme's subject.

### 4. Processing & Download
**Goal:** Generate a shareable file.
**Implementation:**
- **Library:** `html2canvas`.
- **Process:** 
  1. We capture the DOM element containing the GIF and the overlay.
  2. We render it to a `<canvas>`.
  3. We convert the canvas to a Blob/DataURL.
  4. We trigger a browser download.
- **Note:** This generates a static PNG (snapshot) of the meme frame. True GIF generation would require capturing multiple frames and encoding them client-side (using `gif.js`) or server-side (using `ffmpeg`), which is computationally expensive for a browser demo.

---

# Deployment Guide

## Prerequisites
- Node.js v18+
- A Google Cloud Project with Vertex AI / Gemini API enabled.

## Environment Variables
Create a `.env` file (or configure in your cloud provider):
```env
GEMINI_API_KEY=your_api_key_here
APP_URL=https://your-app-url.com
```

## Steps to Deploy

### 1. Docker Deployment (Recommended)
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "dev"] # Or a dedicated start script for prod
```

### 2. Vercel / Netlify (Frontend Only)
If you separate the backend:
1. Push to GitHub.
2. Connect repository to Vercel.
3. Set build command: `npm run build`.
4. **Limitation:** The Express backend won't run on standard static hosting. You need Vercel Functions or a separate backend.

### 3. Google Cloud Run (Full Stack)
Since this is a containerized app (Vite + Express):
1. Build the container: `gcloud builds submit --tag gcr.io/PROJECT_ID/memeface`.
2. Deploy: `gcloud run deploy memeface --image gcr.io/PROJECT_ID/memeface --platform managed`.
3. Set environment variables in the Cloud Run console.

## Scaling Considerations
- **CDN:** Serve static assets (GIFs) via CloudFront or Cloudflare.
- **Queue:** Move image processing to a background worker (Redis + BullMQ) if implementing real deepfakes.
- **Database:** Migrate from in-memory `MOCK_GIFS` to PostgreSQL or MongoDB.
