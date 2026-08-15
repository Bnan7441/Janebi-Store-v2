import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Award } from 'lucide-react';
import { motion } from 'motion/react';
import BrandLogo from '../../components/BrandLogo';
import { toPersianDigits } from '../../lib/utils';

const DEFAULT_BRANDS = [
  { 
    name: 'Anker', 
    faName: 'انکر', 
    logo: 'https://cdn.simpleicons.org/anker/00A3E0', 
    image: 'https://images.unsplash.com/photo-1609592424074-32b00ff37207?auto=format&fit=crop&w=600&q=80',
    count: 24, 
    desc: 'پیشرو در تولید شارژر، پاوربانک و تجهیزات شارژ فوق سریع' 
  },
  { 
    name: 'Apple', 
    faName: 'اپل', 
    logo: 'https://cdn.simpleicons.org/apple/000000/ffffff', 
    image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&w=600&q=80',
    count: 35, 
    desc: 'لوازم جانبی اصلی و تایید شده MFi برای آیفون و اپل واچ' 
  },
  { 
    name: 'Samsung', 
    faName: 'سامسونگ', 
    logo: 'https://cdn.simpleicons.org/samsung/1428A0', 
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
    count: 28, 
    desc: 'شارژرهای دیواری اصلی سوپر فست، گلس و هندزفری‌های گلکسی' 
  },
  { 
    name: 'Baseus', 
    faName: 'بیسوس', 
    logo: 'https://images.unsplash.com/photo-1622445268465-843d63d69b30?auto=format&fit=crop&w=150&q=80', 
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80',
    count: 42, 
    desc: 'طراحی مدرن و تکنولوژی نوآورانه در لوازم جانبی خودرو و دیجیتال' 
  },
  { 
    name: 'Xiaomi', 
    faName: 'شیائومی', 
    logo: 'https://cdn.simpleicons.org/xiaomi/FF6900', 
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    count: 30, 
    desc: 'هندزفری‌های اقتصادی، پاوربانک‌های باکیفیت و اکسسوری همراه' 
  },
  { 
    name: 'Nillkin', 
    faName: 'نیلکین', 
    logo: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=150&q=80', 
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
    count: 18, 
    desc: 'تخصصی‌ترین برند تولید قاب‌های ضدضربه و محافظ لنز دوربین' 
  },
];

export default function Brands() {
  const [brandsList, setBrandsList] = useState(DEFAULT_BRANDS);

  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBrandsList(data);
        }
      })
      .catch(() => {
        // fallback
      });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 dark:from-black dark:to-gray-900 text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Award className="h-3.5 w-3.5" /> ۱۰۰٪ اصلی با ضمانت اصالت
          </span>
          <h1 className="text-3xl font-black mb-3 tracking-tight">برندهای معتبر جهانی</h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            مجموعه کاملی از معتبرترین برندهای بین‌المللی تولیدکننده لوازم جانبی موبایل و دیجیتال.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {brandsList.map((b, idx) => (
          <motion.div
            key={b.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link 
              to={`/products?search=${encodeURIComponent(b.name)}`}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:border-orange-200 dark:hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-300 group h-full relative overflow-hidden"
            >
              <div>
                {/* Cover Banner */}
                <div className="relative h-36 rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                  <img 
                    src={b.image} 
                    alt={b.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-orange-600/90 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md backdrop-blur-md">
                      {toPersianDigits(b.count)} کالا
                    </span>
                  </div>
                </div>

                {/* Brand Logo & Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-11 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <BrandLogo name={b.name} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight">
                      {b.faName} ({b.name})
                    </h3>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">اصلی و با گارانتی</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                  {b.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800/80 text-xs font-bold text-orange-600 dark:text-orange-400">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-medium text-[11px]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> تضمین ۷ روز بازگشت
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                  مشاهده محصولات <ArrowLeft className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
