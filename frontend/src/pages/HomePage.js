import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import RecentlyViewed from '../components/RecentlyViewed';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/products/featured')
      .then(r => setFeatured(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter">

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(201,169,110,0.06) 0%, transparent 60%), var(--bg)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '50%', height: '100%',
          background: 'linear-gradient(135deg, var(--bg3) 0%, var(--bg2) 100%)',
          clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 560 }}>
            <span className="badge badge-accent" style={{ marginBottom: 24, display: 'inline-block' }}>
              New Season 2026
            </span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 6vw, 80px)',
              fontWeight: 300, lineHeight: 1.1, marginBottom: 24,
            }}>
              Shop Smarter <br />
              <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>With AI</em>
            </h1>
            <p style={{
              color: 'var(--text2)', fontSize: 17, lineHeight: 1.7,
              marginBottom: 36, maxWidth: 420,
            }}>
              Discover premium clothing and electronics with AI-powered
              price insights and personalized recommendations.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/shop" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
                Shop Now
              </Link>
              <Link to="/shop?category=electronics" className="btn btn-outline" style={{ padding: '13px 28px', fontSize: 15 }}>
                Electronics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: '80px 0', background: 'var(--bg2)' }}>
        <div className="container">
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 36,
            fontWeight: 400, marginBottom: 40, textAlign: 'center',
          }}>
            Shop by Category
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { title: 'Clothing', desc: 'Curated fashion for every occasion', emoji: '👗', path: '/shop?category=clothing', color: 'rgba(201,169,110,0.08)' },
              { title: 'Electronics', desc: 'Latest tech at best prices', emoji: '📱', path: '/shop?category=electronics', color: 'rgba(92,184,122,0.06)' },
            ].map(cat => (
              <Link key={cat.title} to={cat.path} style={{
                padding: '40px 36px', borderRadius: 16,
                background: cat.color, border: '1px solid var(--border)',
                transition: 'all 0.2s', display: 'block',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--border2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{cat.emoji}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: 28,
                  fontWeight: 400, marginBottom: 8,
                }}>{cat.title}</h3>
                <p style={{ color: 'var(--text2)' }}>{cat.desc}</p>
                <span style={{ color: 'var(--accent)', marginTop: 16, display: 'inline-block' }}>
                  Browse →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: 36,
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 400 }}>
              Featured Products
            </h2>
            <Link to="/shop" style={{ color: 'var(--accent)', fontSize: 14 }}>View all →</Link>
          </div>

          {loading ? (
            <div className="grid-products">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card" style={{ height: 340 }}>
                  <div className="skeleton" style={{ height: 220 }} />
                  <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 14, marginBottom: 8, width: '60%' }} />
                    <div className="skeleton" style={{ height: 20, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text2)' }}>
              <p style={{ fontSize: 18, marginBottom: 12 }}>No featured products yet.</p>
              <p>Add products from the Admin panel and mark them as featured.</p>
            </div>
          ) : (
            <div className="grid-products">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* AI BANNER */}
      <section style={{
        padding: '60px 0', background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 34,
            fontWeight: 400, marginBottom: 12,
          }}>
            Shop Smarter with AI
          </h2>
          <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: 24 }}>
            ShopSavyy AI tracks price history, compares products, and tells
            you the best time to buy. Click the ✦ button to start.
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center',
            gap: 12, flexWrap: 'wrap', color: 'var(--text2)', fontSize: 14,
          }}>
            {[
              '📊 Price History',
              '🔍 Product Comparisons',
              '💡 Smart Recommendations',
              '⏰ Best Time to Buy',
            ].map(f => (
              <span key={f} style={{
                padding: '8px 16px', borderRadius: 20,
                border: '1px solid var(--border)', background: 'var(--bg3)',
              }}>{f}</span>
            ))}
          </div>
        </div>
      </section>
             {/* RECENTLY VIEWED */}
      <RecentlyViewed />
    </div>
  );
}