import { GifReader } from 'omggif';
import GIF from 'gif.js';

// Cache the worker URL to avoid re-fetching
let workerBlobUrl: string | null = null;

async function getWorkerUrl() {
  if (workerBlobUrl) return workerBlobUrl;
  
  try {
    const response = await fetch('https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js');
    if (!response.ok) throw new Error('Failed to fetch worker script');
    const script = await response.text();
    const blob = new Blob([script], { type: 'application/javascript' });
    workerBlobUrl = URL.createObjectURL(blob);
    return workerBlobUrl;
  } catch (error) {
    console.error("Failed to load GIF worker:", error);
    // Fallback to direct importScripts if fetch fails (though less likely to work if CSP blocks)
    const fallbackBlob = new Blob([`importScripts('https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js');`], { type: 'application/javascript' });
    return URL.createObjectURL(fallbackBlob);
  }
}

export async function processGifWithFace(
  gifUrl: string,
  faceImage: HTMLImageElement,
  facePosition: { x: number, y: number, width: number, height: number }
): Promise<Blob> {
  // 1. Get Worker URL
  const workerUrl = await getWorkerUrl();

  // 2. Fetch and Parse GIF
  const response = await fetch(gifUrl);
  const buffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  const reader = new GifReader(uint8Array);

  const width = reader.width;
  const height = reader.height;
  const frameCount = reader.numFrames();

  // 3. Setup Canvas and Encoder
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx) throw new Error("Could not get canvas context");

  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: width,
    height: height,
    workerScript: workerUrl
  });

  // 4. Process Each Frame
  // We need a temporary buffer for frame pixel data
  const framePixels = new Uint8ClampedArray(width * height * 4);
  const imageData = new ImageData(framePixels, width, height);

  for (let i = 0; i < frameCount; i++) {
    // Decode frame pixels into the buffer
    reader.decodeAndBlitFrameRGBA(i, framePixels);
    
    // Put raw frame data onto canvas
    ctx.putImageData(imageData, 0, 0);

    // Draw Face Overlay
    // We need to map the relative position (from the editor) to the actual GIF dimensions
    // The editor might be scaled, so we assume facePosition is in relative coordinates (0-1) or pre-calculated
    // For this implementation, we'll assume facePosition is passed as absolute pixels relative to the GIF size
    
    ctx.drawImage(
      faceImage, 
      facePosition.x, 
      facePosition.y, 
      facePosition.width, 
      facePosition.height
    );

    // Add frame to encoder
    // Get delay for this frame (in 1/100th of a second) -> convert to ms
    const delay = reader.frameInfo(i).delay * 10; 
    gif.addFrame(ctx, { copy: true, delay: delay });
  }

  // 5. Render Final GIF
  return new Promise((resolve, reject) => {
    gif.on('finished', (blob: Blob) => {
      resolve(blob);
    });
    gif.render();
  });
}
