import React, { useState, useRef } from 'react';
import { motion, useDragControls } from 'motion/react';
import { Download, Share2, Wand2, Loader2, Sparkles, Layers, Film } from 'lucide-react';
import { generateMeme } from '@/services/ai';
import { processGifWithFace } from '@/lib/gif-processor';

interface MemeEditorProps {
  faceImage: string;
  gifUrl: string;
}

export function MemeEditor({ faceImage, gifUrl }: MemeEditorProps) {
  const [scale, setScale] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'overlay' | 'ai'>('overlay');
  const [aiResult, setAiResult] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLImageElement>(null);
  const dragControls = useDragControls();
  
  const positionRef = useRef({ x: 0, y: 0 });

  // Convert GIF URL to base64 for AI
  const getTemplateBase64 = async () => {
    const response = await fetch(gifUrl);
    const blob = await response.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const handleAiGenerate = async () => {
    setIsProcessing(true);
    try {
      const templateBase64 = await getTemplateBase64();
      const templateData = templateBase64.split(',')[1];
      const faceData = faceImage.split(',')[1];

      // Uses gemini-2.5-flash-image (nano banana) as configured in services/ai.ts
      const resultImage = await generateMeme(faceData, templateData);
      setAiResult(resultImage);
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("AI Generation failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGifGenerate = async () => {
    if (!containerRef.current || !faceRef.current) return;
    setIsProcessing(true);

    try {
      // 1. Calculate Face Position & Size relative to the GIF
      const containerRect = containerRef.current.getBoundingClientRect();
      const faceRect = faceRef.current.getBoundingClientRect();
      
      const img = new Image();
      img.src = gifUrl;
      await new Promise(resolve => img.onload = resolve);
      
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      
      const displayRatio = containerRect.width / naturalWidth;
      
      const relativeX = faceRect.left - containerRect.left;
      const relativeY = faceRect.top - containerRect.top;
      
      const actualX = relativeX / displayRatio;
      const actualY = relativeY / displayRatio;
      const actualWidth = faceRect.width / displayRatio;
      const actualHeight = faceRect.height / displayRatio;

      // 2. Process GIF
      const faceImgElement = new Image();
      faceImgElement.src = faceImage;
      await new Promise(resolve => faceImgElement.onload = resolve);

      const gifBlob = await processGifWithFace(gifUrl, faceImgElement, {
        x: actualX,
        y: actualY,
        width: actualWidth,
        height: actualHeight
      });

      // 3. Download
      const url = URL.createObjectURL(gifBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meme-overlay-${Date.now()}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("GIF Processing failed:", error);
      alert("Could not generate animated GIF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (mode === 'ai') {
      if (!aiResult) {
        await handleAiGenerate();
        // If generation succeeds, the user will need to click download again or we can auto-trigger
        // For now, let's just return and let them see the result.
        return; 
      }
      
      const a = document.createElement('a');
      a.href = aiResult;
      a.download = `meme-ai-${Date.now()}.png`;
      a.click();
      return;
    }

    if (mode === 'overlay') {
      await handleGifGenerate();
      return;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-4xl mx-auto">
      
      {/* Mode Switcher */}
      <div className="flex bg-giphy-card p-1 rounded-lg border border-white/10 w-full max-w-md">
        <button
          onClick={() => setMode('overlay')}
          className={`flex-1 px-4 py-3 rounded-md text-sm font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
            mode === 'overlay' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          Overlay (GIF)
        </button>
        <button
          onClick={() => setMode('ai')}
          className={`flex-1 px-4 py-3 rounded-md text-sm font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
            mode === 'ai' ? 'bg-gradient-to-r from-giphy-blue to-giphy-purple text-white shadow-lg' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Blend
        </button>
      </div>

      <div className="bg-giphy-card p-6 rounded-sm shadow-2xl border border-white/10 w-full relative group">
        
        {/* Editor Canvas */}
        <div className="relative w-full aspect-square bg-black/50 rounded-sm overflow-hidden border border-white/5" ref={containerRef}>
          
          {mode === 'ai' ? (
            <div className="w-full h-full flex items-center justify-center">
              {aiResult ? (
                <img src={aiResult} alt="AI Generated Meme" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-8 max-w-md">
                  <div className="w-24 h-24 bg-gradient-to-tr from-giphy-blue to-giphy-purple rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">AI Magic Blend</h3>
                  <p className="text-gray-400 mb-8 text-lg">
                    Our AI will analyze the meme and seamlessly blend your face into it, matching lighting and style.
                  </p>
                  <button
                    onClick={handleAiGenerate}
                    disabled={isProcessing}
                    className="w-full py-4 bg-white text-black font-black uppercase tracking-wider rounded-sm hover:scale-105 transition-transform text-lg shadow-xl"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                      </span>
                    ) : 'Generate Magic Blend'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full relative overflow-hidden">
              <img 
                src={gifUrl} 
                alt="Meme Background" 
                className="w-full h-full object-contain pointer-events-none select-none"
                crossOrigin="anonymous" 
              />

              <motion.div
                drag
                dragMomentum={false}
                dragControls={dragControls}
                dragConstraints={containerRef}
                onDragEnd={(e, info) => {
                  positionRef.current = { x: info.point.x, y: info.point.y };
                }}
                style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%',
                  x: '-50%',
                  y: '-50%',
                  scale 
                }}
                className="cursor-move group/face"
              >
                <div className="relative">
                  <img 
                    ref={faceRef}
                    src={faceImage} 
                    alt="Your Face" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                    draggable={false}
                  />
                  
                  <div className="absolute -inset-4 border-2 border-giphy-blue rounded-full opacity-0 group-hover/face:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </motion.div>
            </div>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
              <Loader2 className="w-12 h-12 text-giphy-blue animate-spin mb-4" />
              <p className="font-black text-2xl text-white uppercase tracking-widest animate-pulse">
                {mode === 'ai' ? 'Dreaming...' : 'Encoding GIF...'}
              </p>
              {mode === 'overlay' && <p className="text-gray-400 text-sm mt-2">Processing frames frame-by-frame</p>}
            </div>
          )}
        </div>

        {/* Controls (Overlay Mode Only) */}
        {mode === 'overlay' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider w-12">Size</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-giphy-blue"
                disabled={isProcessing}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 w-full">
        {/* Only show main download button if we are in overlay mode OR if AI result is ready */}
        {(mode === 'overlay' || (mode === 'ai' && aiResult)) && (
          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-giphy-blue to-giphy-purple text-white font-black uppercase tracking-wider rounded-sm hover:brightness-110 transition-all shadow-lg shadow-giphy-purple/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download {mode === 'ai' ? 'AI Image' : 'GIF'}
              </>
            )}
          </button>
        )}
        
        <button 
          disabled={isProcessing || (mode === 'ai' && !aiResult)}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-giphy-card text-white font-bold uppercase tracking-wider rounded-sm hover:bg-white/10 transition-colors border border-white/10 disabled:opacity-50"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>
    </div>
  );
}
