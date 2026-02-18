import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';

interface Gif {
  id: string;
  url: string;
  title: string;
  width: number;
  height: number;
}

interface GifSelectorProps {
  gifs: Gif[];
  onSelect: (gif: Gif) => void;
  onSearch: (query: string) => void;
  selectedGifId?: string;
  isLoading?: boolean;
}

export function GifSelector({ gifs, onSelect, onSearch, selectedGifId, isLoading }: GifSelectorProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-giphy-blue to-giphy-pink rounded-sm opacity-75 group-hover:opacity-100 transition duration-200 blur-sm"></div>
        <div className="relative flex">
          <input
            type="text"
            placeholder="Search for memes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-4 pr-14 py-4 bg-giphy-dark text-white font-bold text-lg rounded-l-sm border-none focus:ring-0 placeholder-gray-500 outline-none"
          />
          <button 
            type="submit"
            className="px-8 bg-gradient-to-r from-giphy-pink to-giphy-purple text-white font-black uppercase tracking-wider rounded-r-sm hover:brightness-110 transition-all"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
      </form>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-giphy-card rounded-sm" />
          ))}
        </div>
      ) : gifs.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gifs.map((gif) => (
            <motion.div
              key={gif.id}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(gif)}
              className={`
                relative aspect-square bg-giphy-card rounded-sm overflow-hidden cursor-pointer group
                ${selectedGifId === gif.id ? 'ring-4 ring-giphy-blue' : ''}
              `}
            >
              <img
                src={gif.url}
                alt={gif.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <span className="text-white text-sm font-bold truncate">{gif.title}</span>
                <div className="h-1 w-full bg-gradient-to-r from-giphy-blue to-giphy-pink mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-500">
          <p className="text-xl font-bold">No GIFs found.</p>
          <p className="text-sm">Try searching for "cat", "fail", or "dance"</p>
        </div>
      )}
    </div>
  );
}
