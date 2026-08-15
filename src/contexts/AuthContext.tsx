import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

export interface AddressItem {
  id: string;
  title: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  joinedDate?: string;
  vipPoints?: number;
  addresses?: AddressItem[];
  role?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (name: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addAddress: (address: Omit<AddressItem, 'id'>) => void;
  updateAddress: (id: string, address: Partial<AddressItem>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.accessToken);
        addToast(data.message, 'success');
        return true;
      } else {
        addToast(data.message, 'error');
        return false;
      }
    } catch (e) {
      addToast('خطا در ارتباط با سرور', 'error');
      return false;
    }
  };

  const register = async (name: string, phone: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.accessToken);
        addToast(data.message, 'success');
        return true;
      } else {
        addToast(data.message, 'error');
        return false;
      }
    } catch (e) {
      addToast('خطا در ارتباط با سرور', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    addToast('با موفقیت خارج شدید', 'success');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setUser(prev => prev ? { ...prev, ...data } : null);
        addToast('پروفایل با موفقیت بروزرسانی شد', 'success');
      } else {
        const error = await res.json();
        addToast(error.message, 'error');
      }
    } catch (e) {
      addToast('خطا در ارتباط با سرور', 'error');
    }
  };

  const addAddress = async (address: Omit<AddressItem, 'id'>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/users/me/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(address)
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, addresses: [...(user.addresses || []), data.address] });
        addToast(data.message, 'success');
      } else {
        const error = await res.json();
        addToast(error.message, 'error');
      }
    } catch (e) {
      addToast('خطا در ارتباط با سرور', 'error');
    }
  };

  const updateAddress = async (id: string, address: Partial<AddressItem>) => {
    if (!user || !user.addresses) return;
    try {
      const res = await fetch(`/api/users/me/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(address)
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          ...user,
          addresses: user.addresses.map(a => a.id === id ? data.address : a)
        });
        addToast(data.message, 'success');
      } else {
        const error = await res.json();
        addToast(error.message, 'error');
      }
    } catch (e) {
      addToast('خطا در ارتباط با سرور', 'error');
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user || !user.addresses) return;
    try {
      const res = await fetch(`/api/users/me/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setUser({
          ...user,
          addresses: user.addresses.filter(a => a.id !== id)
        });
        addToast('آدرس حذف شد', 'success');
      } else {
        const error = await res.json();
        addToast(error.message, 'error');
      }
    } catch (e) {
      addToast('خطا در ارتباط با سرور', 'error');
    }
  };

  const setDefaultAddress = async (id: string) => {
    if (!user || !user.addresses) return;
    try {
      const res = await fetch(`/api/users/me/addresses/${id}/default`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setUser({
          ...user,
          addresses: user.addresses.map(a => ({
            ...a,
            isDefault: a.id === id
          }))
        });
        addToast('آدرس پیش‌فرض تغییر کرد', 'success');
      } else {
        const error = await res.json();
        addToast(error.message, 'error');
      }
    } catch (e) {
      addToast('خطا در ارتباط با سرور', 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
