import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Award, ChevronLeft } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { toPersianDigits } from '../lib/utils';

interface Brand {
  name: string;
  faName?: string;
  nameFa?: string;
  logo: string;
  image?: string;
  count: number;
}

const DEFAULT_BRANDS: Brand[] = [
  { name: 'Anker', nameFa: 'انکر', logo: 'https://cdn.simpleicons.org/anker/00A3E0', count: 3 },
  { name: 'Apple', nameFa: 'اپل', logo: 'https://cdn.simpleicons.org/apple/000000/ffffff', count: 2 },
  { name: 'Samsung', nameFa: 'سامسونگ', logo: 'https://cdn.simpleicons.org/samsung/1428A0', count: 3 },
  { name: 'Baseus', nameFa: 'بیسوس', logo: 'https://images.unsplash.com/photo-1622445268465-843d63d69b30?auto=format&fit=crop&w=120&q=80', count: 2 },
  { name: 'Xiaomi', nameFa: 'شیائومی', logo: 'https://cdn.simpleicons.org/xiaomi/FF6900', count: 1 },
  { name: 'Nillkin', nameFa: 'نیلکین', logo: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=120&q=80', count: 1 },
];

export default function BrandShowcase() {
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);

  useEffect(() => {
    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBrands(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3 tracking-tight">
          <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <Award className="h-5 w-5" />
          </span>
          برندهای برتر و معتبر
        </h2>
        <Link
          to="/brands"
          className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
        >
          مشاهده همه برندها <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {brands.map((brand, idx) => (
          <motion.div
            key={brand.name}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
          >
            <Link
              to={`/products?brand=${encodeURIComponent(brand.name)}`}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-orange-200 dark:hover:border-gray-700 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden h-full"
            >
              <div className="w-14 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/80 px-2 py-1 mb-3 border border-gray-100 dark:border-gray-700/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xs relative overflow-hidden">
                <BrandLogo name={brand.name} />
              </div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-0.5">
                {brand.name}
              </h3>
              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                {brand.faName || brand.nameFa} • {toPersianDigits(brand.count)} کالا
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
