import React from 'react';
import { Clock, Calendar, ArrowLeft, BookOpen, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function Blog() {
  const articles = [
    {
      id: 1,
      title: 'راهنمای کامل خرید شارژر دیواری: توان وات واقعی و استاندارد PD چیست؟',
      excerpt: 'بررسی جامع تفاوت‌های شارژرهای فست شارژ ۲۰، ۲۵ و ۶۵ وات و نحوه انتخاب توان مناسب برای حفظ سلامت باتری آیفون و سامسونگ.',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
      date: '۱۸ مرداد ۱۴۰۳',
      readTime: '۵ دقیقه',
      category: 'راهنمای خرید',
      author: 'مهندس رضایی'
    },
    {
      id: 2,
      title: 'تفاوت گلس شیشه‌ای و سرامیکی: کدام محافظ صفحه ارزش خرید بیشتری دارد؟',
      excerpt: 'مقایسه سختی، مقایسه در برابر ضربه و خرد شدگی گلس‌های سرامیکی انعطاف‌پذیر با گلس‌های شیشه‌ای ۹H.',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80',
      date: '۱۲ مرداد ۱۴۰۳',
      readTime: '۴ دقیقه',
      category: 'مقایسه و بررسی',
      author: 'مریم احمدی'
    },
    {
      id: 3,
      title: 'فناوری مگ‌سیف (MagSafe) چیست و چه کاربردهایی در اکوسیستم اپل دارد؟',
      excerpt: 'همه چیز درباره سرعت شارژ ۱۵ وات مغناطیسی، قاب‌های سازگار با مگ‌سیف و لوازم جانبی کاربردی این فناوری.',
      image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&w=600&q=80',
      date: '۰۵ مرداد ۱۴۰۳',
      readTime: '۶ دقیقه',
      category: 'تکنولوژی',
      author: 'تیم فنی جانبی آرنا'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-lg shadow-orange-500/20">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            <BookOpen className="h-3.5 w-3.5" /> مجله تخصصی جانبی آرنا
          </span>
          <h1 className="text-3xl font-black mb-3 tracking-tight">آخرین اخبار و راهنماهای کاربردی</h1>
          <p className="text-orange-100 text-sm leading-relaxed">
            بررسی جدیدترین گجت‌ها، تکنولوژی‌های شارژ و مقالات آموزشی برای نگهداری بهتر از لوازم جانبی.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((art, idx) => (
          <motion.article 
            key={art.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg dark:hover:shadow-black/30 hover:border-orange-200 dark:hover:border-gray-700 transition-all duration-300 flex flex-col group h-full"
          >
            <div className="aspect-video w-full relative overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img src={art.image} alt={art.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              <span className="absolute top-3 right-3 bg-orange-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                {art.category}
              </span>
            </div>

            <div className="p-6 flex flex-col grow justify-between">
              <div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {art.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {art.readTime}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-snug mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {art.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-6">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
                <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium text-[11px]">
                  <User className="h-3.5 w-3.5" /> {art.author}
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform cursor-pointer">
                  ادامه مقاله <ArrowLeft className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
