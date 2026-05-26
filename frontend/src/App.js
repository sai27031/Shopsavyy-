import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import AIAssistant from './components/AIAssistant';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              <Navbar />
              <CartDrawer />
              <AIAssistant />
              <Routes>
                <Route path="/"           element={<HomePage />} />
                <Route path="/shop"       element={<ShopPage />} />
                <Route path="/shop/:id"   element={<ProductPage />} />
                <Route path="/login"      element={<LoginPage />} />
                <Route path="/register"   element={<RegisterPage />} />
                <Route path="/orders"     element={<OrdersPage />} />
                <Route path="/checkout"   element={<CheckoutPage />} />
                <Route path="/admin"      element={<AdminPage />} />
                <Route path="/wishlist"   element={<WishlistPage />} />
                <Route path="/profile"    element={<ProfilePage />} />
              </Routes>
            </RecentlyViewedProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}