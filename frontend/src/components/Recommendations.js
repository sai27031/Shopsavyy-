import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ProductCard from './ProductCard';

export default function Recommendations({ productId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    axios.get(`/api/ai/recommendations/${productId}`)
      .then(r => setRecommendations(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  if (!loading && recommendations.length === 0) return null;

  return (
    <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <span className="badge badge-accent" style={{ marginBottom: 12, display: 'inline-block' }}>
            ✦ AI Powered
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 32,
            fontWeight: 400,
          }}>
            You May Also Like
          </h2>
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
        ) : (
          <div className="grid-products">
            {recommendations.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}