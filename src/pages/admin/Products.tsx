import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { Product } from '../../types';
import { toEnglishDigits } from '../../lib/utils';

export default function AdminProducts() {
  const token = localStorage.getItem('token');
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '', category: '', price: '', originalPrice: '', discount: '', image: '', brand: '', warranty: '', description: '', stockQuantity: '10', sku: ''
  });

  useEffect(() => {
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (err) {
      addToast('خطا در دریافت لیست محصولات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        category: product.category,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        discount: product.discount?.toString() || '0',
        image: product.image,
        brand: product.brand,
        warranty: product.warranty || '',
        description: product.description || '',
        stockQuantity: (product.stockQuantity ?? 10).toString(),
        sku: product.sku || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ title: '', category: '', price: '', originalPrice: '', discount: '0', image: '', brand: '', warranty: '', description: '', stockQuantity: '10', sku: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrice = toEnglishDigits(formData.price);
    const cleanOrigPrice = formData.originalPrice ? toEnglishDigits(formData.originalPrice) : '';
    const cleanDiscount = toEnglishDigits(formData.discount);
    const cleanStock = toEnglishDigits(formData.stockQuantity);

    const payload = {
      ...formData,
      price: parseInt(cleanPrice, 10) || 0,
      originalPrice: cleanOrigPrice ? parseInt(cleanOrigPrice, 10) : null,
      discount: parseInt(cleanDiscount, 10) || 0,
      stockQuantity: parseInt(cleanStock, 10) || 0
    };

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();

      addToast(editingProduct ? 'محصول بروزرسانی شد' : 'محصول جدید اضافه شد', 'success');
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      addToast('خطا در ذخیره محصول', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('آیا از حذف این محصول اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      addToast('محصول حذف شد', 'success');
      fetchProducts();
    } catch (err) {
      addToast('خطا در حذف محصول', 'error');
    }
  };

  const filteredProducts = products.filter(p => p.title.includes(search) || p.sku?.includes(search) || p.brand.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">مدیریت محصولات و انبار</h1>
          <p className="text-gray-500 dark:text-gray-400">افزودن، ویرایش، حذف و کنترل موجودی انبار محصولات</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          افزودن محصول جدید
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="relative max-w-md mb-4">
          <input 
            type="text" 
            placeholder="جستجو در محصولات (نام، برند، SKU)..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-medium">تصویر</th>
                <th className="p-4 font-medium">نام محصول</th>
                <th className="p-4 font-medium">دسته‌بندی</th>
                <th className="p-4 font-medium">قیمت</th>
                <th className="p-4 font-medium">موجودی انبار</th>
                <th className="p-4 font-medium text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center p-8">در حال بارگذاری...</td></tr>
              ) : filteredProducts.map(p => {
                const qty = p.stockQuantity ?? 0;
                return (
                  <tr key={p.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4">
                      <img src={p.image} alt={p.title} className="w-12 h-12 rounded-lg object-contain bg-white dark:bg-gray-900 p-1 border border-gray-100 dark:border-gray-800" />
                    </td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{p.title}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{p.category}</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{p.price.toLocaleString()} تومان</td>
                    <td className="p-4">
                      {qty > 5 ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold">
                          {qty} عدد در انبار
                        </span>
                      ) : qty > 0 ? (
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold">
                          {qty} عدد (رو به اتمام)
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold">
                          ناموجود
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(p)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام محصول *</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">دسته‌بندی *</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">قیمت فروش (تومان) *</label>
                  <input required type="text" dir="ltr" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-left font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">قیمت اصلی بدون تخفیف (اختیاری)</label>
                  <input type="text" dir="ltr" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-left font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">برند *</label>
                  <input required type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تعداد موجودی انبار *</label>
                  <input required type="text" dir="ltr" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-bold text-left font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">کد کالا (SKU)</label>
                  <input type="text" dir="ltr" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-left font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">گارانتی</label>
                  <input type="text" placeholder="مثلاً: ۱۸ ماه گارانتی شرکتی" value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">آدرس تصویر (URL) *</label>
                  <input required type="url" dir="ltr" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-left font-mono" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">توضیحات محصول</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 resize-none" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer">انصراف</button>
                <button type="submit" className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-md shadow-orange-500/20 cursor-pointer">
                  {editingProduct ? 'ذخیره تغییرات' : 'افزودن محصول'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
