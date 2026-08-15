import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Search, ChevronDown, CheckCircle, Package, Truck, XCircle, Eye, X, MapPin, Phone, User, Calendar, CreditCard } from 'lucide-react';
import { toPersianDigits, formatPrice } from '../../lib/utils';

export default function AdminOrders() {
  const token = localStorage.getItem('token');
  const { addToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedOrder]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      addToast('خطا در دریافت لیست سفارشات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string, newStatusText: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, statusText: newStatusText })
      });

      if (!res.ok) throw new Error();
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, statusText: newStatusText } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus, statusText: newStatusText });
      }
      addToast('وضعیت سفارش بروزرسانی شد', 'success');
    } catch (err) {
      addToast('خطا در بروزرسانی وضعیت', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    (o.recipientName && o.recipientName.includes(search)) || 
    (o.recipientPhone && o.recipientPhone.includes(search))
  );

  return (
    <div className="space-y-6 text-right">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">مدیریت سفارشات</h1>
        <p className="text-gray-500 dark:text-gray-400">مشاهده، بررسی فاکتور و پیگیری وضعیت سفارشات مشتریان</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="relative max-w-md mb-4">
          <input 
            type="text" 
            placeholder="جستجو (شماره سفارش، نام، موبایل)..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-xs font-bold"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-bold">شماره سفارش</th>
                <th className="p-4 font-bold">تاریخ</th>
                <th className="p-4 font-bold">تحویل‌گیرنده</th>
                <th className="p-4 font-bold">مبلغ کل</th>
                <th className="p-4 font-bold">پرداخت</th>
                <th className="p-4 font-bold text-center">وضعیت</th>
                <th className="p-4 font-bold text-center">اقدامات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center p-8 text-xs font-bold text-gray-400">در حال بارگذاری...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-8 text-xs font-bold text-gray-400">هیچ سفارشی یافت نشد.</td></tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id} className="text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4 font-bold text-gray-900 dark:text-white font-mono dir-ltr text-left">{order.id}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{order.date}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    <div className="font-bold text-gray-800 dark:text-gray-200">{order.recipientName}</div>
                    <div className="text-[11px] text-gray-400 font-mono" dir="ltr">{order.recipientPhone}</div>
                  </td>
                  <td className="p-4 font-black text-orange-600 dark:text-orange-400">{formatPrice(order.total)}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {order.paymentMethod === 'online' ? 'آنلاین (زرین‌پال)' : 'کارت به کارت'}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' :
                      order.status === 'pending_payment' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' :
                      'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                    }`}>
                      {order.statusText}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                        title="مشاهده جزئیات فاکتور"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <div className="relative group">
                        <button 
                          disabled={updatingId === order.id}
                          className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          {updatingId === order.id ? '...' : 'تغییر وضعیت'}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        
                        <div className="absolute left-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden text-right">
                          <button onClick={() => updateStatus(order.id, 'processing', 'در حال پردازش')} className="w-full text-right px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 text-blue-600 font-bold"><Package className="w-3.5 h-3.5"/> در پردازش</button>
                          <button onClick={() => updateStatus(order.id, 'shipped', 'ارسال شده')} className="w-full text-right px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 text-purple-600 font-bold"><Truck className="w-3.5 h-3.5"/> ارسال شده</button>
                          <button onClick={() => updateStatus(order.id, 'delivered', 'تحویل داده شده')} className="w-full text-right px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 text-emerald-600 font-bold"><CheckCircle className="w-3.5 h-3.5"/> تحویل شده</button>
                          <button onClick={() => updateStatus(order.id, 'cancelled', 'لغو شده')} className="w-full text-right px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 text-red-600 font-bold border-t border-gray-100 dark:border-gray-700"><XCircle className="w-3.5 h-3.5"/> لغو سفارش</button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  جزئیات سفارش <span className="font-mono text-orange-600" dir="ltr">{selectedOrder.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status and metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-xs">
              <div>
                <span className="text-gray-400 block mb-1">وضعیت:</span>
                <span className="font-bold text-orange-600">{selectedOrder.statusText}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">تاریخ ثبت:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedOrder.date}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">روش ارسال:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedOrder.shippingMethod === 'express' ? 'پیشتاز اکسپرس' : 'معمولی'}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">مبلغ کل:</span>
                <span className="font-black text-orange-600">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Recipient Information */}
            <div className="p-4 rounded-2xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 text-xs space-y-2">
              <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-orange-500" />
                <span>مشخصات تحویل‌گیرنده:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 dark:text-gray-300 font-medium">
                <div>نام: <strong className="text-gray-900 dark:text-white">{selectedOrder.recipientName}</strong></div>
                <div>شماره تماس: <strong className="text-gray-900 dark:text-white font-mono" dir="ltr">{selectedOrder.recipientPhone}</strong></div>
                <div className="sm:col-span-2">آدرس پستی: <strong className="text-gray-900 dark:text-white">{selectedOrder.recipientAddress}</strong></div>
                {selectedOrder.recipientPostalCode && (
                  <div>کد پستی: <strong className="text-gray-900 dark:text-white font-mono" dir="ltr">{selectedOrder.recipientPostalCode}</strong></div>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-gray-700 dark:text-gray-300">اقلام سفارش:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-contain bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700" />
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{item.title}</div>
                        <div className="text-[11px] text-gray-400">{item.brand}</div>
                      </div>
                    </div>
                    <div className="text-left font-bold text-gray-700 dark:text-gray-300">
                      <div>{toPersianDigits(item.qty || item.quantity)} عدد</div>
                      <div className="text-orange-600 text-[11px]">{formatPrice(item.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
