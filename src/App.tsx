/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutCallback from './pages/CheckoutCallback';
import WishlistPage from './pages/Wishlist';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Compare from './pages/Compare';
import About from './pages/static/About';
import Contact from './pages/static/Contact';
import Terms from './pages/static/Terms';
import Privacy from './pages/static/Privacy';
import FAQPage from './pages/static/FAQPage';
import Blog from './pages/static/Blog';
import Offers from './pages/static/Offers';
import NewProducts from './pages/static/NewProducts';
import Brands from './pages/static/Brands';
import NotFound from './pages/static/NotFound';

import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminCoupons from './pages/admin/Coupons';
import { ToastProvider } from './contexts/ToastContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CompareProvider } from './contexts/CompareContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <CompareProvider>
                <WishlistProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="products" element={<Products />} />
                      <Route path="products/:id" element={<ProductDetail />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="checkout/callback" element={<CheckoutCallback />} />
                      <Route path="wishlist" element={<WishlistPage />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                      <Route path="compare" element={<Compare />} />
                      
                      <Route path="about" element={<About />} />
                      <Route path="contact" element={<Contact />} />
                      <Route path="terms" element={<Terms />} />
                      <Route path="privacy" element={<Privacy />} />
                      <Route path="faq" element={<FAQPage />} />
                      <Route path="blog" element={<Blog />} />
                      <Route path="offers" element={<Offers />} />
                      <Route path="new-products" element={<NewProducts />} />
                      <Route path="brands" element={<Brands />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="coupons" element={<AdminCoupons />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </WishlistProvider>
            </CompareProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </ErrorBoundary>
  );
}
