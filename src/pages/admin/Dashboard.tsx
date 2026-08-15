import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Package, ShoppingCart, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  metrics: {
    totalUsers: number;
    totalProducts: number;
    totalRevenue: number;
    totalOrders: number;
  };
  recentOrders: any[];
}

export default function Dashboard() {
  const token = localStorage.getItem('token');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('خطا در دریافت آمار');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError('مشکلی پیش آمده است.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (error || !stats) {
    return <div className="text-red-500 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">{error}</div>;
  }

  const { metrics, recentOrders } = stats;

  const statCards = [
    { title: 'درآمد کل', value: `${metrics.totalRevenue.toLocaleString()} تومان`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
    { title: 'سفارشات', value: metrics.totalOrders, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' },
    { title: 'محصولات', value: metrics.totalProducts, icon: Package, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' },
    { title: 'کاربران', value: metrics.totalUsers, icon: Users, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">داشبورد مدیریت</h1>
        <p className="text-gray-500 dark:text-gray-400">نمای کلی از وضعیت فروشگاه شما</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">آخرین سفارشات</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-orange-600 hover:text-orange-700">مشاهده همه</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-medium">شماره سفارش</th>
                <th className="p-4 font-medium">تاریخ</th>
                <th className="p-4 font-medium">مشتری</th>
                <th className="p-4 font-medium">مبلغ کل</th>
                <th className="p-4 font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentOrders.map((order) => (
                <tr key={order.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4 font-bold text-gray-900 dark:text-white dir-ltr text-left w-max inline-block">{order.id}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{order.date}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{order.recipientName}</td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{order.total.toLocaleString()} تومان</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                      order.status === 'pending_payment' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                      'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {order.statusText}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">سفارشی یافت نشد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
