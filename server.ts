import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock GIF Database
  const MOCK_GIFS = [
    { id: "1", title: "Rick Roll", width: 480, height: 360, url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp4bW5qenZ5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5Z3Z5/Ju7l5y9osyymQ/giphy.gif" },
    { id: "2", title: "Cat Vibing", width: 480, height: 480, url: "https://media.giphy.com/media/GeimqsH0TLDt4tScGw/giphy.gif" },
    { id: "3", title: "Success Kid", width: 480, height: 360, url: "https://media.giphy.com/media/nXxOjZrbnbRxS/giphy.gif" },
    { id: "4", title: "Distracted Boyfriend", width: 480, height: 360, url: "https://media.giphy.com/media/rpFHSuk2OxYsZdHNyC/giphy.gif" },
    { id: "5", title: "This is Fine Dog", width: 480, height: 360, url: "https://media.giphy.com/media/QMHoU66sBXqqLqYvGO/giphy.gif" },
    { id: "6", title: "Leonardo DiCaprio Toast", width: 480, height: 360, url: "https://media.giphy.com/media/8Iv5lqKwKsZ2g/giphy.gif" },
    { id: "7", title: "Spongebob Mocking", width: 480, height: 360, url: "https://media.giphy.com/media/QUXYcgCwvCm4/giphy.gif" },
    { id: "8", title: "Hide the Pain Harold", width: 480, height: 360, url: "https://media.giphy.com/media/7T33BLlB7NQrjozoRB/giphy.gif" },
    { id: "9", title: "Confused Math Lady", width: 480, height: 360, url: "https://media.giphy.com/media/4JVTF9zR9BicshFAb7/giphy.gif" },
    { id: "10", title: "Futurama Fry Suspicious", width: 480, height: 360, url: "https://media.giphy.com/media/ANbD1CCdA3iI8/giphy.gif" },
    { id: "11", title: "Drake Hotline Bling", width: 480, height: 360, url: "https://media.giphy.com/media/3o84sq21TxDH6SaHVh/giphy.gif" },
    { id: "12", title: "Thinking Black Guy", width: 480, height: 360, url: "https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif" }
  ];

  // Giphy API Configuration
  const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
  const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs';

  // Helper to transform Giphy result
  const transformGiphyResult = (data: any[]) => {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      url: item.images?.original?.url || item.images?.downsized?.url,
      width: parseInt(item.images?.original?.width || '0'),
      height: parseInt(item.images?.original?.height || '0')
    }));
  };

  // Search/Trending GIFs API
  app.get("/api/gifs", async (req, res) => {
    const query = (req.query.q as string)?.toLowerCase() || "";
    
    // 1. Try Giphy API if Key is present
    if (GIPHY_API_KEY) {
      try {
        const endpoint = query 
          ? `${GIPHY_BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=24&rating=g`
          : `${GIPHY_BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=24&rating=g`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
           throw new Error(`Giphy API Error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.meta && data.meta.status === 200 && data.data && data.data.length > 0) {
          return res.json(transformGiphyResult(data.data));
        }
        console.warn("Giphy API returned no data or error, falling back to mock.", data.meta);
      } catch (error) {
        console.error("Failed to fetch from Giphy:", error);
        // Fall through to mock data
      }
    }

    // 2. Fallback to Mock Data
    console.log("Using Mock Data");
    if (!query) {
      return res.json(MOCK_GIFS);
    }

    const filtered = MOCK_GIFS.filter(gif => 
      gif.title.toLowerCase().includes(query)
    );
    res.json(filtered);
  });

  // Keep legacy endpoint for compatibility if needed, or redirect
  app.get("/api/trending-gifs", (req, res) => {
    res.json(MOCK_GIFS.slice(0, 6));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static files from dist
    const distPath = new URL("./dist", import.meta.url).pathname;
    app.use(express.static(distPath));
    
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(new URL("./dist/index.html", import.meta.url).pathname);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
