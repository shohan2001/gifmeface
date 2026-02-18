/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Code2, TrendingUp, Search, Menu, User } from 'lucide-react';
import { FaceUploader } from './components/FaceUploader';
import { ValidationResult } from './components/ValidationResult';
import { GifSelector } from './components/GifSelector';
import { MemeEditor } from './components/MemeEditor';
import { AdUnit } from './components/AdUnit';
import { validateFace } from './services/ai';

// Types
type Step = 'upload' | 'validate' | 'select' | 'edit';

interface Gif {
  id: string;
  url: string;
  title: string;
  width: number;
  height: number;
}

export default function App() {
  const [step, setStep] = useState<Step>('upload');
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; reason: string } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [trendingGifs, setTrendingGifs] = useState<Gif[]>([]);
  const [selectedGif, setSelectedGif] = useState<Gif | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch trending GIFs on mount
  useEffect(() => {
    fetchGifs();
  }, []);

  const fetchGifs = async (query: string = '') => {
    setIsSearching(true);
    try {
      const endpoint = query ? `/api/gifs?q=${encodeURIComponent(query)}` : '/api/gifs';
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch GIFs");
      const data = await res.json();
      setTrendingGifs(data);
    } catch (err) {
      console.error("Failed to fetch GIFs:", err);
      // Ensure we don't leave the UI in a broken state
      setTrendingGifs([]); 
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setFaceImage(base64);
      setStep('validate');
      setIsValidating(true);

      // Validate with AI
      // Strip prefix for API
      const base64Data = base64.split(',')[1];
      const result = await validateFace(base64Data);
      
      setValidationResult(result);
      setIsValidating(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadTestFace = async () => {
    try {
      setIsValidating(true);
      setStep('validate');
      // Use a reliable face image from Unsplash
      const response = await fetch("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80");
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setFaceImage(base64);
        
        // Validate with AI
        const base64Data = base64.split(',')[1];
        const result = await validateFace(base64Data);
        
        setValidationResult(result);
        setIsValidating(false);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Failed to load test face", error);
      setIsValidating(false);
      setStep('upload');
    }
  };

  const handleReset = () => {
    setFaceImage(null);
    setValidationResult(null);
    setStep('upload');
  };

  const handleContinue = () => {
    setStep('select');
  };

  const handleGifSelect = (gif: Gif) => {
    setSelectedGif(gif);
    setStep('edit');
  };

  return (
    <div className="min-h-screen bg-giphy-dark font-sans text-white selection:bg-giphy-purple selection:text-white">
      {/* Retro Header */}
      <header className="bg-giphy-dark border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => setStep('upload')}>
              <div className="w-10 h-10 bg-black border-2 border-white transform -rotate-3 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <span className="text-2xl">🤪</span>
              </div>
              <div className="flex flex-col leading-none ml-2">
                <span className="font-black text-2xl tracking-tighter uppercase italic text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" style={{ textShadow: '2px 2px 0 #000' }}>
                  GIF<span className="text-giphy-blue">ME</span><span className="text-giphy-purple">FACE</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Make Yourself a Meme</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-1 ml-8">
              {['Reactions', 'Entertainment', 'Sports', 'Stickers'].map((item) => (
                <button key={item} className="px-4 py-2 text-sm font-bold hover:bg-white/10 rounded-sm transition-colors relative group">
                  {item}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-giphy-blue to-giphy-purple scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-giphy-purple to-giphy-pink hover:brightness-110 transition-all rounded-sm font-bold text-sm">
              <Zap className="w-4 h-4" />
              Create
            </button>
            <div className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer">
              <User className="w-6 h-6" />
              <span className="hidden md:inline text-sm font-bold">Log In</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Bar (Retro Style) */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-giphy-card p-2 rounded-full border border-white/10">
            {['Upload', 'Validate', 'Select', 'Edit'].map((label, i) => {
              const stepIndex = ['upload', 'validate', 'select', 'edit'].indexOf(step);
              const isActive = i === stepIndex;
              const isCompleted = i < stepIndex;
              
              return (
                <div key={label} className="flex items-center">
                  <div className={`
                    px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                    ${isActive ? 'bg-gradient-to-r from-giphy-blue to-giphy-purple text-white shadow-lg shadow-giphy-purple/20' : 
                      isCompleted ? 'bg-white/10 text-green-400' : 'text-gray-500'}
                  `}>
                    {label}
                  </div>
                  {i < 3 && <div className="w-4 h-0.5 bg-white/10 mx-2" />}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
                  <span className="text-white">BE THE </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-giphy-blue to-giphy-green-400">MEME</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-lg mx-auto font-medium">
                  Upload a selfie and let our AI inject you into the internet's viral history.
                </p>
              </div>
              <FaceUploader onFileSelect={handleFileSelect} isValidating={false} />
              
              <div className="mt-8">
                <button
                  onClick={handleLoadTestFace}
                  className="text-sm font-bold text-gray-500 hover:text-white underline decoration-dotted underline-offset-4 transition-colors"
                >
                  Or use a Test Face (Debug)
                </button>
              </div>
            </motion.div>
          )}

          {step === 'validate' && (
            <motion.div
              key="validate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black uppercase italic">Scanning Face...</h2>
              </div>
              
              {isValidating ? (
                <FaceUploader onFileSelect={() => {}} isValidating={true} />
              ) : (
                <ValidationResult 
                  isValid={validationResult?.isValid ?? false}
                  reason={validationResult?.reason ?? "Unknown error"}
                  onReset={handleReset}
                  onContinue={handleContinue}
                />
              )}
            </motion.div>
          )}

          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-giphy-blue" />
                  <h2 className="text-2xl font-black uppercase tracking-wide">Trending Now</h2>
                </div>
                <button onClick={handleReset} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                  CHANGE PHOTO
                </button>
              </div>
              
              {/* Trending Tags */}
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {['#reaction', '#happy', '#sad', '#confused', '#excited', '#party', '#cat', '#dog'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => fetchGifs(tag.replace('#', ''))}
                    className="px-4 py-2 bg-giphy-card hover:bg-white/10 rounded-full text-sm font-bold whitespace-nowrap transition-colors border border-white/5"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <GifSelector 
                gifs={trendingGifs} 
                onSelect={handleGifSelect}
                onSearch={fetchGifs}
                isLoading={isSearching}
              />
            </motion.div>
          )}

          {step === 'edit' && selectedGif && faceImage && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black uppercase">Customize</h2>
                <button onClick={() => setStep('select')} className="text-sm font-bold text-gray-400 hover:text-white">
                  BACK TO GRID
                </button>
              </div>
              <MemeEditor faceImage={faceImage} gifUrl={selectedGif.url} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Ad / Info */}
        <div className="mt-24 border-t border-white/10 pt-12">
           <AdUnit format="horizontal" slotId="footer-leaderboard" className="bg-giphy-card border-white/5" />
        </div>
      </main>
    </div>
  );
}

