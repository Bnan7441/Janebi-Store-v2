import React from 'react';

export default function PageLoadingFallback() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col justify-start items-center py-12 px-4">
      {/* Top Animated Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 z-50 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 w-full animate-pulse origin-left" />
      </div>

      {/* Modern Content Skeleton Card */}
      <div className="w-full max-w-5xl space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
