import React, { useState } from 'react';
import { User as UserIcon, Phone, MapPin, Building, Star, CheckCircle2 } from 'lucide-react';
import { CheckoutFormData } from '../../hooks/useCheckoutForm';
import { useAuth } from '../../contexts/AuthContext';
import { normalizeIranianMobile } from '../../lib/utils';

interface CheckoutRecipientFormProps {
  formData: CheckoutFormData;
  updateField: (field: keyof CheckoutFormData, value: string) => void;
}

const PROVINCES = [
  'تهران',
  'اصفهان',
  'خراسان رضوی',
  'فارس',
  'آذربایجان شرقی',
  'مازندران',
  'البرز',
  'گیلان',
  'خوزستان',
  'کرمان',
  'قم',
  'یزد',
  'قزوین',
  'همدان',
  'سایر استان‌ها',
];

export default function CheckoutRecipientForm({
  formData,
  updateField,
}: CheckoutRecipientFormProps) {
  const { user } = useAuth();
  const savedAddresses = user?.addresses || [];
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);

  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddrId(addr.id);
    updateField('name', addr.name || '');
    updateField('phone', normalizeIranianMobile(addr.phone || ''));
    updateField('province', addr.province || 'تهران');
    updateField('city', addr.city || 'تهران');
    updateField('address', addr.address || '');
    updateField('postalCode', addr.postalCode || '');
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-orange-500" />
          <span>آدرس و اطلاعات گیرنده</span>
        </h3>
        {savedAddresses.length > 0 && (
          <span className="text-xs text-gray-400 font-medium">
            می‌توانید از آدرس‌های ذخیره‌شده خود انتخاب کنید
          </span>
        )}
      </div>

      {/* Saved Addresses Quick Selector */}
      {savedAddresses.length > 0 && (
        <div className="space-y-2.5 pb-2">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
            انتخاب سریع از دفترچه آدرس‌ها:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddrId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelectSavedAddress(addr)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-xs'
                      : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-orange-500" />
                      {addr.title}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-md font-bold">
                        پیش‌فرض
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate mb-1">
                    {addr.province}، {addr.city}، {addr.address}
                  </p>
                  <div className="text-[10px] text-gray-500 flex justify-between font-medium">
                    <span>{addr.name}</span>
                    <span dir="ltr" className="font-mono">{addr.phone}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
            نام و نام خانوادگی تحویل‌گیرنده *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="مثلا: علی محمدی"
              className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 px-4 pr-10 text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500"
              required
            />
            <UserIcon className="h-4 w-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
            شماره موبایل گیرنده *
          </label>
          <div className="relative">
            <input
              type="tel"
              dir="ltr"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="09123456789"
              className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 px-4 pl-10 text-left font-mono text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500"
              required
            />
            <Phone className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Province */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
            استان *
          </label>
          <select
            value={formData.province}
            onChange={(e) => updateField('province', e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 px-4 text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
            شهر *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="مثلا: تهران"
            className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 px-4 text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500"
            required
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
          آدرس پستی دقیق *
        </label>
        <textarea
          rows={3}
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="خیابان اصلی، کوچه، پلاک، واحد..."
          className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 resize-none"
          required
        />
      </div>

      {/* Postal Code & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
            کد پستی ۱۰ رقمی (اختیاری)
          </label>
          <input
            type="text"
            dir="ltr"
            value={formData.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            placeholder="1234567890"
            className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 px-4 text-left font-mono text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
            توضیحات و ملاحظات ارسال (اختیاری)
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="مثلا تحویل به نگهبانی..."
            className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 px-4 text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>
    </div>
  );
}
