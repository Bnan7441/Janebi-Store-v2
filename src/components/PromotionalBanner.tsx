import React, { useState, useEffect } from 'react';
import { Sparkles, Percent, ArrowLeft, X, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'promotional_banner_dismissed_v1';

export default function PromotionalBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!isDismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, y: -10 }}
        animate={{ opacity: 1, height: 'auto', y: 0 }}
        exit={{ opacity: 0, height: 0, y: -10 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="mb-8 overflow-hidden"
      >
        <div className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 dark:from-orange-700 dark:via-amber-800 dark:to-rose-800 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-orange-500/10 border border-orange-500/20">
          {/* Background decorative shine circles */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
            {/* Left/Start Content */}
            <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="p-2.5 bg-white/20 dark:bg-white/15 backdrop-blur-md rounded-xl shrink-0 flex items-center justify-center text-amber-200">
                <Flame className="h-6 w-6 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-wide">
                    <Sparkles className="h-3 w-3" /> پیشنهادات شگفت‌انگیز
                  </span>
                  <span className="text-xs text-orange-100 font-bold">
                    فرصت محدود!
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                  جشنواره تخفیف‌های ویژه فصل — تا ۴۰٪ تخفیف روی انواع پاوربانک و لوازم جانبی
                </h3>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/15 pt-3 sm:pt-0">
              <Link
                to="/offers"
                className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 dark:bg-gray-900 dark:text-orange-400 dark:hover:bg-gray-800 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 shrink-0"
              >
                <span>مشاهده پیشنهادها</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <button
                onClick={handleDismiss}
                className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors shrink-0"
                title="بستن بنر"
                aria-label="بستن بنر تبلیغاتی"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
