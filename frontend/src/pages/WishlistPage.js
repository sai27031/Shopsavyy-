import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <div style={{
      paddingTop: 100, minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16, color: 'var(--text2)',
    }}>
      <div style={{ fontSize: 48 }}>♡</div>
      <p style={{ fontSize: 18 }}>Login to view your wishlist</p>
      <button className="btn btn-primary" onClick={() => navigate('/login')}>
        Login
      </button>
    </div>
  );

  return (
    <div className="page-enter" style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40 }}>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 40,
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 40,
              fontWeight: 400, marginBottom: 8,
            }}>
              My Wishlist
            </h1>
            <p style={{ color: 'var(--text2)' }}>
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <button
              className="btn btn-outline"
              onClick={clearWishlist}
              style={{ fontSize: 13 }}
            >
              Clear All
            </button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            color: 'var(--text2)',
          }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>♡</div>
            <p style={{ fontSize: 20, marginBottom: 8, color: 'var(--text)' }}>
              Your wishlist is empty
            </p>
            <p style={{ marginBottom: 28 }}>
              Save items you love by clicking the heart icon
            </p>
            <Link to="/shop" className="btn btn-primary" style={{ padding: '12px 28px' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {wishlistItems.map(product => (
              <div key={product._id} className="card" style={{ overflow: 'hidden' }}>

                <Link to={`/shop/${product._id}`}>
                  <div style={{
                    position: 'relative', paddingBottom: '75%',
                    background: 'var(--bg3)',
                  }}>
                    <img src={product.image} alt={product.name} style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.3s',
                    }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                    {product.stock === 0 && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(10,10,11,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ color: 'var(--text2)', fontWeight: 500 }}>
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <div style={{ padding: '16px' }}>
                  <p style={{
                    fontSize: 11, color: 'var(--text3)',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
                  }}>
                    {product.brand || product.category}
                  </p>

                  <Link to={`/shop/${product._id}`}>
                    <h3 style={{
                      fontSize: 15, fontWeight: 500, marginBottom: 8,
                      lineHeight: 1.4, color: 'var(--text)',
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {product.name}
                    </h3>
                  </Link>

                  <div style={{
                    display: 'flex', alignItems: 'baseline',
                    gap: 8, marginBottom: 16,
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 18 }}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.originalPrice && (
                      <span style={{
                        fontSize: 13, color: 'var(--text3)',
                        textDecoration: 'line-through',
                      }}>
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="badge badge-accent">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center', padding: '9px' }}
                      disabled={product.stock === 0}
                      onClick={() => {
                        addToCart(product);
                        removeFromWishlist(product._id);
                      }}
                    >
                      Move to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      style={{
                        padding: '9px 12px', borderRadius: 8,
                        border: '1px solid rgba(224,92,92,0.3)',
                        color: 'var(--red)', background: 'rgba(224,92,92,0.08)',
                        fontSize: 16, cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,92,92,0.15)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(224,92,92,0.08)'}
                    >
                      ♥
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}