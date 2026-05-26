import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import AIAssistant from '../components/AIAssistant';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import Recommendations from '../components/Recommendations';

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [insights, setInsights] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
  setLoading(true);
  api.get(`/api/products/${id}`)
    .then(r => {
      setProduct(r.data);
      if (r.data.sizes?.length) setSelectedSize(r.data.sizes[0]);
      if (r.data.colors?.length) setSelectedColor(r.data.colors[0]);
      addToRecentlyViewed(r.data);
    })
    .catch(console.error)
    .finally(() => setLoading(false));

  api.get(`/api/ai/insights/${id}`)
    .then(r => setInsights(r.data))
    .catch(() => {});
}, [id]);

  const handleAddToCart = () => {
    if (product) addToCart(product, quantity, selectedSize, selectedColor);
  };

  const submitReview = async () => {
    try {
      await api.post(`/api/products/${id}/reviews`, review);
      setReviewMsg('Review submitted successfully!');
      const r = await api.get(`/api/products/${id}`);
      setProduct(r.data);
    } catch (err) {
      setReviewMsg(err.response?.data?.message || 'Error submitting review');
    }
  };

  if (loading) return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <div className="skeleton" style={{ height: 500, borderRadius: 16 }} />
          <div>
            <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 80, marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 48 }} />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ paddingTop: 100, textAlign: 'center', color: 'var(--text2)' }}>
      Product not found
    </div>
  );

  const images = [product.image, ...(product.images || [])];
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div className="page-enter" style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 60 }}>

          {/* IMAGES */}
          <div>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              background: 'var(--bg2)', border: '1px solid var(--border)',
              marginBottom: 12, aspectRatio: '1',
            }}>
              <img src={images[activeImage]} alt={product.name} style={{
                width: '100%', height: '100%', objectFit: 'cover',
              }} />
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImage(i)} style={{
                    width: 72, height: 72, borderRadius: 8, overflow: 'hidden',
                    border: `2px solid ${activeImage === i ? 'var(--accent)' : 'var(--border)'}`,
                    cursor: 'pointer',
                  }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div>
            <p style={{ color: 'var(--text3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {product.brand} · {product.category}
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 400, marginBottom: 16, lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ color: 'var(--accent)', fontSize: 16 }}>
                {'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}
              </span>
              <span style={{ color: 'var(--text2)', fontSize: 13 }}>({product.numReviews} reviews)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 600 }}>₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span style={{ fontSize: 18, color: 'var(--text3)', textDecoration: 'line-through' }}>
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && <span className="badge badge-accent">-{discount}%</span>}
            </div>

            {/* AI PRICE INSIGHTS */}
            {insights && (
              <div style={{
                padding: '14px 16px', borderRadius: 10,
                background: 'var(--accent-dim)', border: '1px solid rgba(201,169,110,0.2)',
                marginBottom: 20,
              }}>
                <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ✦ AI Price Insights
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Lowest Ever', value: `₹${insights.lowestEver?.toLocaleString('en-IN')}` },
                    { label: 'Highest Ever', value: `₹${insights.highestEver?.toLocaleString('en-IN')}` },
                    { label: 'Trend', value: insights.priceTrend === 'up' ? '📈 Rising' : insights.priceTrend === 'down' ? '📉 Falling' : '➡️ Stable' },
                  ].map(item => (
                    <div key={item.label}>
                      <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 2 }}>{item.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {insights.isBestPrice && (
                  <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>
                    ✓ This is the lowest price ever recorded!
                  </p>
                )}
              </div>
            )}

            <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>

            {/* SIZES */}
            {product.sizes?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Size</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} style={{
                      padding: '7px 14px', borderRadius: 8, fontSize: 13,
                      border: `1px solid ${selectedSize === s ? 'var(--accent)' : 'var(--border)'}`,
                      background: selectedSize === s ? 'var(--accent-dim)' : 'transparent',
                      color: selectedSize === s ? 'var(--accent)' : 'var(--text2)',
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* COLORS */}
            {product.colors?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Color</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)} style={{
                      padding: '7px 14px', borderRadius: 8, fontSize: 13,
                      border: `1px solid ${selectedColor === c ? 'var(--accent)' : 'var(--border)'}`,
                      background: selectedColor === c ? 'var(--accent-dim)' : 'transparent',
                      color: selectedColor === c ? 'var(--accent)' : 'var(--text2)',
                    }}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)',
              }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ padding: '10px 16px', color: 'var(--text2)', fontSize: 18 }}>−</button>
                <span style={{ padding: '10px 16px', minWidth: 40, textAlign: 'center' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  style={{ padding: '10px 16px', color: 'var(--text2)', fontSize: 18 }}>+</button>
              </div>
              <span style={{ color: 'var(--text2)', fontSize: 13 }}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 15, justifyContent: 'center' }}
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* REVIEWS */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, marginBottom: 32 }}>
            Reviews ({product.numReviews})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>

            <div>
              {product.reviews?.length === 0 ? (
                <p style={{ color: 'var(--text2)' }}>No reviews yet. Be the first!</p>
              ) : (
                product.reviews.map((r, i) => (
                  <div key={i} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>{r.name}</span>
                      <span style={{ color: 'var(--accent)' }}>{'★'.repeat(r.rating)}</span>
                    </div>
                    <p style={{ color: 'var(--text2)', fontSize: 14 }}>{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '24px', background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', height: 'fit-content' }}>
              <h3 style={{ fontWeight: 500, marginBottom: 20 }}>Write a Review</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Rating</label>
                <select value={review.rating} onChange={e => setReview(r => ({ ...r, rating: Number(e.target.value) }))}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Comment</label>
                <textarea
                  rows={4}
                  value={review.comment}
                  onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                  placeholder="Share your experience..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              {reviewMsg && <p style={{ fontSize: 13, color: 'var(--green)', marginBottom: 12 }}>{reviewMsg}</p>}
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={submitReview}>
                Submit Review
              </button>
            </div>
          </div>
        </div>

               {/* AI RECOMMENDATIONS */}
      <Recommendations productId={id} />
      
      </div>
    </div>
  );
}