import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'سارا احمدی',
    text: 'کیفیت لوازم جانبی واقعا عالیه و از همه مهم‌تر ارسال خیلی سریعشون بود. ممنون از تیم خوبتون.',
    rating: 5,
    date: '۲ روز پیش'
  },
  {
    id: 2,
    name: 'امیررضا کریمی',
    text: 'قیمت‌ها نسبت به بازار خیلی مناسب‌تره و پشتیبانی هم عالی پاسخگو بود. حتما بازم خرید می‌کنم.',
    rating: 5,
    date: '۱ هفته پیش'
  },
  {
    id: 3,
    name: 'مریم نوری',
    text: 'تنوع محصولات بالاست ولی بعضی از قاب‌ها زود تموم میشن. در کل از خریدم راضیم.',
    rating: 4,
    date: '۳ هفته پیش'
  }
];

export default function Testimonials() {
  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3 tracking-tight">
          <span className="w-2.5 h-8 bg-orange-600 dark:bg-orange-500 rounded-full shadow-sm"></span>
          نظرات و تجربیات مشتریان
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center font-black text-sm border border-orange-200/50 dark:border-orange-800/50">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{testimonial.name}</h4>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{testimonial.date}</span>
                  </div>
                </div>
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < testimonial.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
