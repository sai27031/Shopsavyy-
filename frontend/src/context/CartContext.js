import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const fetchCart = async () => {
    if (!user) return setCartItems([]);
    try {
      const { data } = await axios.get('/api/cart');
      setCartItems(data.items || []);
    } catch { setCartItems([]); }
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (product, qty = 1, size = '', color = '') => {
    if (!user) return alert('Please login to add items to cart');
    try {
      const { data } = await axios.post('/api/cart', {
        productId: product._id,
        name:      product.name,
        image:     product.image,
        price:     product.price,
        quantity:  qty,
        size,
        color,
      });
      setCartItems(data.items || []);
      setCartOpen(true);
    } catch (err) { console.error(err); }
  };

  const updateQty = async (itemId, qty) => {
    try {
      const { data } = await axios.put(`/api/cart/items/${itemId}`, { quantity: qty });
      setCartItems(data.items || []);
    } catch (err) { console.error(err); }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await axios.delete(`/api/cart/items/${itemId}`);
      setCartItems(data.items || []);
    } catch (err) { console.error(err); }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart');
      setCartItems([]);
    } catch (err) { console.error(err); }
  };

  const totalItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartOpen,
      setCartOpen,
      addToCart,
      updateQty,
      removeItem,
      clearCart,
      totalItems,
      totalPrice,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);