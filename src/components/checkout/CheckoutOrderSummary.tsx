import React from 'react';
import { CartItem } from '../../types';
import { formatPrice } from '../../lib/utils';

interface CheckoutOrderSummaryProps {
  cart: CartItem[];
  cartTotal: number;
  shippingFee: number;
  finalPayable: number;
  submitting: boolean;
  isFreeShipping: boolean;
}

export default function CheckoutOrderSummary({
  cart,
  cartTotal,
  shippingFee,
  finalPayable,
  submitting,
  isFreeShipping,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs sticky top-28 space-y-6">
      <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100 pb-4 border-b border-gray-100 dark:border-gray-800">
        خلاصه سفارش ({cart.length.toLocaleString('fa-IR')} کالا)
      </h3>

      {/* Cart items scrollable overview */}
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-3 text-xs">
            <img
              src={item.image}
              alt={item.title}
              className="w-12 h-12 object-contain rounded-xl bg-gray-50 dark:bg-gray-800 p-1 border border-gray-100 dark:border-gray-700 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 dark:text-gray-100 truncate">
                {item.title}
              </div>
              <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                {item.quantity.toLocaleString('fa-IR')} عدد × {formatPrice(item.price)}
              </div>
            </div>
            <div className="font-bold text-gray-900 dark:text-gray-100 shrink-0">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Math */}
      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
        <div className="flex justify-between">
          <span>مجموع کالاها</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(cartTotal)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>هزینه ارسال</span>
          {isFreeShipping ? (
            <span className="font-bold text-emerald-600 dark:text-emerald-400">رایگان</span>
          ) : (
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(shippingFee)}
            </span>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between items-center text-sm">
          <span className="font-extrabold text-gray-900 dark:text-gray-100">مبلغ قابل پرداخت</span>
          <div className="font-black text-xl text-orange-600 dark:text-orange-400">
            {formatPrice(finalPayable)}
          </div>
        </div>
      </div>

      {/* Final Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 text-sm disabled:opacity-50"
      >
        <span>{submitting ? 'در حال ثبت سفارش...' : 'تأیید و پرداخت نهایی'}</span>
      </button>
    </div>
  );
}
