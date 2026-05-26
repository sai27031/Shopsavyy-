import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cartItems, cartOpen, setCartOpen, updateQty, removeItem, totalPrice } = useCart();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  return (
    <>
      <div onClick={() => setCartOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 200, backdropFilter: 'blur(4px)',
      }} />

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
        background: 'var(--bg2)', borderLeft: '1px solid var(--border)',
        zIndex: 201, display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.25s ease',
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>
            Your Cart ({cartItems.length})
          </h2>
          <button onClick={() => setCartOpen(false)}
            style={{ fontSize: 20, color: 'var(--text2)', padding: 4 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text2)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item._id} style={{
                display: 'flex', gap: 14, padding: '14px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <img src={item.image} alt={item.name} style={{
                  width: 72, height: 72, objectFit: 'cover',
                  borderRadius: 8, background: 'var(--bg3)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 14, fontWeight: 500, marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{item.name}</p>
                  {item.size && (
                    <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>
                      Size: {item.size}
                    </p>
                  )}
                  <p style={{ color: 'var(--accent)', fontWeight: 500 }}>
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      background: 'var(--bg3)', borderRadius: 6,
                      border: '1px solid var(--border)',
                    }}>
                      <button onClick={() => updateQty(item._id, item.quantity - 1)}
                        style={{ padding: '4px 10px', color: 'var(--text2)', fontSize: 16 }}>−</button>
                      <span style={{ padding: '4px 8px', fontSize: 13, minWidth: 28, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item._id, item.quantity + 1)}
                        style={{ padding: '4px 10px', color: 'var(--text2)', fontSize: 16 }}>+</button>
                    </div>
                    <button onClick={() => removeItem(item._id)}
                      style={{ color: 'var(--text3)', fontSize: 12 }}
                      onMouseEnter={e => e.target.style.color = '#e05c5c'}
                      onMouseLeave={e => e.target.style.color = 'var(--text3)'}
                    >Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: 'var(--text2)' }}>Subtotal</span>
              <span style={{ fontWeight: 500, fontSize: 18 }}>
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <button className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              onClick={() => { setCartOpen(false); navigate('/checkout'); }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}