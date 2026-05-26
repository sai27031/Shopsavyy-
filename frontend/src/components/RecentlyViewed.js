import React from 'react';
import { Link } from 'react-router-dom';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useCart } from '../context/CartContext';

export default function RecentlyViewed() {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { addToCart } = useCart();

  if (recentlyViewed.length === 0) return null;

  return (
    <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 32,
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400 }}>
            Recently Viewed
          </h2>
          <button
            onClick={clearRecentlyViewed}
            style={{ fontSize: 13, color: 'var(--text3)' }}
            onMouseEnter={e => e.target.style.color = 'var(--text2)'}
            onMouseLeave={e => e.target.style.color = 'var(--text3)'}
          >
            Clear history
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}>
          {recentlyViewed.map(product => {
            const discount = product.originalPrice
              ? Math.round((1 - product.price / product.originalPrice) * 100)
              : 0;

            return (
              <div key={product._id} className="card" style={{
                overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <Link to={`/shop/${product._id}`}>
                  <div style={{
                    position: 'relative', paddingBottom: '100%',
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
                    {discount > 0 && (
                      <span className="badge badge-accent" style={{
                        position: 'absolute', top: 8, left: 8, fontSize: 10,
                      }}>
                        -{discount}%
                      </span>
                    )}
                  </div>
                </Link>

                <div style={{ padding: '12px' }}>
                  <p style={{
                    fontSize: 11, color: 'var(--text3)',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
                  }}>
                    {product.brand || product.category}
                  </p>

                  <Link to={`/shop/${product._id}`}>
                    <p style={{
                      fontSize: 13, fontWeight: 500, marginBottom: 8,
                      lineHeight: 1.3, color: 'var(--text)',
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {product.name}
                    </p>
                  </Link>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '5px 10px', fontSize: 11 }}
                      disabled={product.stock === 0}
                      onClick={() => addToCart(product)}
                    >
                      + Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}