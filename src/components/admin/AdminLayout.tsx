import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, ArrowRight, ShieldAlert, Tag } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 text-center shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full inline-block mb-6">
            <ShieldAlert className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4">دسترسی غیرمجاز</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            شما اجازه دسترسی به پنل مدیریت را ندارید. لطفاً با حساب کاربری مدیر وارد شوید.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl transition-all"
          >
            بازگشت به فروشگاه
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "داشبورد", exact: true },
    { to: "/admin/products", icon: Package, label: "محصولات" },
    { to: "/admin/orders", icon: ShoppingCart, label: "سفارشات" },
    { to: "/admin/users", icon: Users, label: "کاربران" },
    { to: "/admin/coupons", icon: Tag, label: "کدهای تخفیف" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col fixed inset-y-0 right-0 z-20">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-orange-500">جانبی‌استور</span>
            <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 font-bold px-2 py-0.5 rounded-md">مدیریت</span>
          </div>
        </div>
        
        <div className="p-6 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
          <img 
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
            alt={user.name} 
            className="w-12 h-12 rounded-full border-2 border-orange-500/20"
          />
          <div>
            <div className="font-bold text-gray-900 dark:text-white">{user.name}</div>
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">مدیر سیستم</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl font-medium transition-all"
          >
            <ArrowRight className="h-5 w-5" />
            مشاهده فروشگاه
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-all"
          >
            <LogOut className="h-5 w-5" />
            خروج از حساب
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mr-64">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
