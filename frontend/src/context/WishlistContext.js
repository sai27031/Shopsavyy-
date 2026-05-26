import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = async () => {
    if (!user) return setWishlistItems([]);
    try {
      const { data } = await axios.get('/api/wishlist');
      setWishlistItems(data.products || []);
    } catch { setWishlistItems([]); }
  };

  useEffect(() => { fetchWishlist(); }, [user]);

  const addToWishlist = async (productId) => {
    if (!user) return alert('Please login to add to wishlist');
    try {
      await axios.post('/api/wishlist', { productId });
      await fetchWishlist();
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`/api/wishlist/${productId}`);
      await fetchWishlist();
    } catch (err) {
      console.error(err);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(p => p._id === productId);
  };

  const clearWishlist = async () => {
    try {
      await axios.delete('/api/wishlist');
      setWishlistItems([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);