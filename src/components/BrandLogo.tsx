import React from 'react';

interface BrandLogoProps {
  name: string;
  className?: string;
}

export default function BrandLogo({ name, className = '' }: BrandLogoProps) {
  const brandName = name.toLowerCase();

  if (brandName.includes('apple')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg className="w-6 h-6 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.11-.97.04-2.16.65-2.85 1.46-.62.72-1.16 1.88-1.01 3.01 1.09.08 2.21-.54 2.87-1.36z"/>
        </svg>
      </div>
    );
  }

  if (brandName.includes('samsung')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-black text-xs sm:text-sm tracking-tighter text-[#1428A0] dark:text-blue-400 font-sans uppercase">
          SAMSUNG
        </span>
      </div>
    );
  }

  if (brandName.includes('anker')) {
    return (
      <div className={`flex items-center justify-center gap-1 ${className}`}>
        <span className="font-black text-xs sm:text-sm tracking-wider text-[#00A3E0] dark:text-cyan-400 font-sans uppercase">
          ANKER
        </span>
        <svg className="w-3.5 h-3.5 fill-amber-500 shrink-0" viewBox="0 0 24 24">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
    );
  }

  if (brandName.includes('xiaomi')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-7 h-7 rounded-lg bg-[#FF6900] text-white flex items-center justify-center font-black text-xs font-sans shadow-xs">
          mi
        </div>
      </div>
    );
  }

  if (brandName.includes('baseus')) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="font-black text-xs sm:text-sm tracking-tight text-amber-500 dark:text-amber-400 font-sans uppercase bg-gray-900 dark:bg-black px-2 py-0.5 rounded-md">
          Baseus
        </span>
      </div>
    );
  }

  if (brandName.includes('nillkin')) {
    return (
      <div className={`flex items-center justify-center gap-1 ${className}`}>
        <svg className="w-4 h-4 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
        <span className="font-black text-xs sm:text-sm tracking-widest text-emerald-600 dark:text-emerald-400 font-sans uppercase">
          NILLKIN
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-300 ${className}`}>
      {name}
    </div>
  );
}
