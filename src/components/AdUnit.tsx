import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AdUnitProps {
  className?: string;
  slotId?: string;
  format?: 'horizontal' | 'vertical' | 'rectangle';
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdUnit({ className, slotId, format = 'horizontal' }: AdUnitProps) {
  const isAdsEnabled = import.meta.env.VITE_ENABLE_ADS === 'true';
  const clientId = import.meta.env.VITE_GOOGLE_ADS_CLIENT_ID;
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (isAdsEnabled && clientId && adRef.current && !initialized.current) {
      try {
        // Load the script if it's not already loaded
        if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
          const script = document.createElement('script');
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
          script.async = true;
          script.crossOrigin = "anonymous";
          document.head.appendChild(script);
        }

        // Push the ad
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        initialized.current = true;
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [isAdsEnabled, clientId]);

  if (isAdsEnabled && clientId) {
    return (
      <div className={cn("overflow-hidden flex justify-center", className)}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client={clientId}
          data-ad-slot={slotId || "1234567890"} // Default test slot
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Fallback / Placeholder (Retro Style)
  return (
    <div 
      className={cn(
        "bg-giphy-card border border-white/10 flex flex-col items-center justify-center p-4 text-gray-600 text-xs uppercase tracking-widest overflow-hidden relative group",
        format === 'horizontal' && "w-full h-24",
        format === 'vertical' && "w-40 h-full min-h-[400px]",
        format === 'rectangle' && "w-[300px] h-[250px]",
        className
      )}
    >
      {/* Retro Grid Background */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <span className="font-bold z-10 text-gray-500">Advertisement</span>
      <span className="text-[10px] mt-1 z-10 opacity-40">Space Available</span>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-giphy-blue/10 to-giphy-purple/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white font-bold tracking-widest">Ad Slot {slotId || '#001'}</span>
      </div>
    </div>
  );
}
