import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShieldCheck, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../../types';
import { MAX_CART_QUANTITY } from '../../lib/constants';
import { formatPrice } from '../../lib/utils';

interface CartItemListProps {
  cart: CartItem[];
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
}

export default function CartItemList({
  cart,
  removeFromCart,
  updateQuantity,
  clearCart,
}: CartItemListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">اقلام سبد خرید</h2>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          حذف همه
        </button>
      </div>

      <AnimatePresence>
        {cart.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-4 sm:p-6 shadow-xs hover:border-gray-200 dark:hover:border-gray-700 transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6"
          >
            {/* Product Info */}
            <div className="flex items-center gap-4 flex-1">
              <Link to={`/products/${item.id}`} className="shrink-0 group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 dark:bg-gray-800 p-2 border border-gray-100 dark:border-gray-700/60 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                  />
                </div>
              </Link>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {item.brand}
                  </span>
                  {item.category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                      {item.category}
                    </span>
                  )}
                </div>

                <Link
                  to={`/products/${item.id}`}
                  className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-2"
                >
                  {item.title}
                </Link>

                {item.warranty && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{item.warranty}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Controls & Price */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 dark:border-gray-800 gap-4">
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/80 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= MAX_CART_QUANTITY}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center font-bold shadow-xs hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-gray-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="font-extrabold text-sm w-6 text-center text-gray-900 dark:text-gray-100">
                  {item.quantity.toLocaleString('fa-IR')}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center font-bold shadow-xs hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-gray-700"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>

              <div className="text-right">
                <div className="font-black text-base sm:text-lg text-gray-900 dark:text-gray-100">
                  {formatPrice(item.price * item.quantity)}
                </div>
                {item.quantity > 1 && (
                  <div className="text-[11px] text-gray-400 font-medium">
                    هر عدد {formatPrice(item.price)}
                  </div>
                )}
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                title="حذف از سبد"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
