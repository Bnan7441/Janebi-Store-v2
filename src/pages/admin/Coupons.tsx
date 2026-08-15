import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2, Tag, Percent, DollarSign } from 'lucide-react';
import { toEnglishDigits } from '../../lib/utils';

export default function AdminCoupons() {
  const token = localStorage.getItem('token');
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percent', // 'percent' | 'amount'
    value: '',
    minTotal: '',
    label: '',
    active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      addToast('خطا در دریافت کدهای تخفیف', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanValue = toEnglishDigits(formData.value);
    const cleanMinTotal = toEnglishDigits(formData.minTotal);
    const parsedVal = parseInt(cleanValue, 10);

    const payload = {
      code: formData.code.trim().toUpperCase(),
      percent: formData.type === 'percent' ? (isNaN(parsedVal) ? undefined : parsedVal) : undefined,
      amount: formData.type === 'amount' ? (isNaN(parsedVal) ? undefined : parsedVal) : undefined,
      minTotal: parseInt(cleanMinTotal, 10) || 0,
      label: formData.label.trim(),
      active: formData.active
    };

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();

      addToast('کد تخفیف جدید اضافه شد', 'success');
      setIsModalOpen(false);
      setFormData({ code: '', type: 'percent', value: '', minTotal: '', label: '', active: true });
      fetchCoupons();
    } catch (err) {
      addToast('خطا در ثبت کد تخفیف', 'error');
    }
  };

  const handleDelete = async (code: string) => {
    if (!window.confirm(`آیا از حذف کد تخفیف ${code} اطمینان دارید؟`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      addToast('کد تخفیف حذف شد', 'success');
      fetchCoupons();
    } catch (err) {
      addToast('خطا در حذف کد تخفیف', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">مدیریت کدهای تخفیف</h1>
          <p className="text-gray-500 dark:text-gray-400">تعریف، فعال‌سازی و حذف کوپن‌های تخفیف</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          افزودن کد تخفیف
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-medium">کد تخفیف</th>
                <th className="p-4 font-medium">عنوان / توضیحات</th>
                <th className="p-4 font-medium">مقدار تخفیف</th>
                <th className="p-4 font-medium">حداقل خرید</th>
                <th className="p-4 font-medium text-center">وضعیت</th>
                <th className="p-4 font-medium text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center p-8">در حال بارگذاری...</td></tr>
              ) : coupons.map(c => (
                <tr key={c.code} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4 font-bold text-gray-900 dark:text-white dir-ltr text-left w-max inline-block uppercase">
                    <span className="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-lg border border-orange-200 dark:border-orange-800">
                      {c.code}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{c.label}</td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">
                    {c.percent ? `${c.percent}%` : `${c.amount?.toLocaleString()} تومان`}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{c.minTotal ? `${c.minTotal.toLocaleString()} تومان` : 'بدون حداقل'}</td>
                  <td className="p-4 text-center">
                    {c.active ? (
                      <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold">فعال</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 px-2.5 py-1 rounded-full text-xs font-bold">غیرفعال</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(c.code)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && !loading && (
                <tr><td colSpan={6} className="text-center p-8 text-gray-500">کد تخفیفی تعریف نشده است</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">افزودن کد تخفیف جدید</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">کد (انگلیسی) *</label>
                <input required type="text" placeholder="مثال: OFF50" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 uppercase text-left font-mono" dir="ltr" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان / نشان *</label>
                <input required type="text" placeholder="مثال: تخفیف ویژه ۵۰ درصدی" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع تخفیف</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer">
                    <option value="percent">درصدی (%)</option>
                    <option value="amount">مبلغ ثابت (تومان)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مقدار *</label>
                  <input required type="text" dir="ltr" placeholder={formData.type === 'percent' ? 'مثال: 20' : 'مثال: 50000'} value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-left font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">حداقل مبلغ سفارش (تومان)</label>
                <input type="text" dir="ltr" placeholder="مثال: 200000" value={formData.minTotal} onChange={e => setFormData({...formData, minTotal: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-left font-mono" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">انصراف</button>
                <button type="submit" className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-md shadow-orange-500/20 cursor-pointer">ذخیره کد تخفیف</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
