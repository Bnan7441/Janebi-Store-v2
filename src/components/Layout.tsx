import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BackToTop from './BackToTop';
import ChatWidget from './ChatWidget';
import DynamicBreadcrumbs from './DynamicBreadcrumbs';
import MobileBottomNav from './MobileBottomNav';
import { AnimatePresence, motion } from 'motion/react';

export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 bg-[#f8fafc] dark:bg-[#090d16] transition-colors duration-300 pb-16 lg:pb-0 relative overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* Ambient background light gradients */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-orange-500/10 dark:bg-orange-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 left-1/4 w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/3 w-80 h-80 bg-rose-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <Header />
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <DynamicBreadcrumbs />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <BackToTop />
      <ChatWidget />
      <MobileBottomNav />
    </div>
  );
}

