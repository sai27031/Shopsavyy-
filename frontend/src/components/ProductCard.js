import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const wishlisted = isInWishlist(product._id);

  return (
    <div className="card" style={{ overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s' }}
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
        <div style={{ position: 'relative', paddingBottom: '100%', background: 'var(--bg3)' }}>
          <img src={product.image} alt={product.name} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', transition: 'transform 0.3s',
          }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
          {discount > 0 && (
            <span className="badge badge-accent" style={{ position: 'absolute', top: 10, left: 10 }}>
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(10,10,11,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'var(--text2)', fontWeight: 500 }}>Out of Stock</span>
            </div>
          )}

          {/* WISHLIST BUTTON */}
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              wishlisted ? removeFromWishlist(product._id) : addToWishlist(product._id);
            }}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(10,10,11,0.7)',
              backdropFilter: 'blur(4px)',
              border: `1px solid ${wishlisted ? 'rgba(224,92,92,0.5)' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, transition: 'all 0.2s',
              color: wishlisted ? '#e05c5c' : 'var(--text2)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(224,92,92,0.2)';
              e.currentTarget.style.borderColor = 'rgba(224,92,92,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(10,10,11,0.7)';
              e.currentTarget.style.borderColor = wishlisted ? 'rgba(224,92,92,0.5)' : 'rgba(255,255,255,0.1)';
            }}
          >
            {wishlisted ? '♥' : '♡'}
          </button>
        </div>
      </Link>

      <div style={{ padding: '14px 16px' }}>
        <p style={{
          fontSize: 11, color: 'var(--text3)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
        }}>
          {product.brand || product.category}
        </p>

        <Link to={`/shop/${product._id}`}>
          <h3 style={{
            fontSize: 14, fontWeight: 500, marginBottom: 8, lineHeight: 1.4,
            color: 'var(--text)', overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {product.name}
          </h3>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <span style={{ color: 'var(--accent)', fontSize: 13 }}>
            {'★'.repeat(Math.round(product.rating || 0))}
          </span>
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>
            ({product.numReviews || 0})
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: 16 }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span style={{
                fontSize: 12, color: 'var(--text3)',
                textDecoration: 'line-through', marginLeft: 6,
              }}>
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '7px 12px', fontSize: 12 }}
            disabled={product.stock === 0}
            onClick={() => addToCart(product)}
          >
            + Cart
          </button>
        </div>
      </div>
    </div>
  );
}