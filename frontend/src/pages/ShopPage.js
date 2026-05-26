import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [brands, setBrands] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search') || '';
  const sort     = searchParams.get('sort') || '';
  const page     = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const brand    = searchParams.get('brand') || '';
  const rating   = searchParams.get('rating') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search)   params.set('search', search);
    if (sort)     params.set('sort', sort);
    if (page)     params.set('page', page);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (brand)    params.set('brand', brand);
    if (rating)   params.set('rating', rating);
    params.set('limit', '12');

    api.get(`/api/products?${params}`)
      .then(r => {
        setProducts(r.data.products);
        setTotal(r.data.total);
        setPages(r.data.pages);
        const uniqueBrands = [...new Set(r.data.products.map(p => p.brand).filter(Boolean))];
        setBrands(prev => [...new Set([...prev, ...uniqueBrands])]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search, sort, page, minPrice, maxPrice, brand, rating]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});

  const activeFilters = [
    category && { key: 'category', label: category },
    brand    && { key: 'brand', label: brand },
    rating   && { key: 'rating', label: `${rating}★ & above` },
    minPrice && { key: 'minPrice', label: `Min ₹${minPrice}` },
    maxPrice && { key: 'maxPrice', label: `Max ₹${maxPrice}` },
    sort     && { key: 'sort', label: sort.replace('-', ' ') },
  ].filter(Boolean);

  return (
    <div className="page-enter" style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 32 }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 400, marginBottom: 4 }}>
              {category ? category.charAt(0).toUpperCase() + category.slice(1)
                : search ? `Results for "${search}"`
                : 'All Products'}
            </h1>
            <p style={{ color: 'var(--text2)' }}>{total} products found</p>
          </div>
          <button
            className="btn btn-outline"
            style={{ fontSize: 13, padding: '8px 16px' }}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'} ⚙
          </button>
        </div>

        {/* ACTIVE FILTER TAGS */}
        {activeFilters.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {activeFilters.map(f => (
              <span key={f.key} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 20,
                background: 'var(--accent-dim)', border: '1px solid rgba(201,169,110,0.2)',
                color: 'var(--accent)', fontSize: 12,
              }}>
                {f.label}
                <button onClick={() => updateParam(f.key, '')} style={{ color: 'var(--accent)', fontSize: 14, lineHeight: 1 }}>✕</button>
              </span>
            ))}
            <button onClick={clearAll} style={{ fontSize: 12, color: 'var(--text3)', padding: '5px 8px' }}>
              Clear all
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: showFilters ? '240px 1fr' : '1fr', gap: 28 }}>

          {/* FILTERS SIDEBAR */}
          {showFilters && (
            <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontWeight: 500, marginBottom: 20, fontSize: 15 }}>Filters</h3>

                {/* CATEGORY */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Category</p>
                  {['', 'clothing', 'electronics'].map(c => (
                    <button key={c} onClick={() => updateParam('category', c)} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '8px 12px', borderRadius: 8, marginBottom: 4,
                      fontSize: 13, transition: 'all 0.15s',
                      background: category === c ? 'var(--accent-dim)' : 'transparent',
                      color: category === c ? 'var(--accent)' : 'var(--text2)',
                      border: `1px solid ${category === c ? 'rgba(201,169,110,0.2)' : 'transparent'}`,
                    }}>
                      {c === '' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>

                {/* SORT */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Sort By</p>
                  {[
                    { value: '', label: 'Newest First' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Top Rated' },
                  ].map(s => (
                    <button key={s.value} onClick={() => updateParam('sort', s.value)} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '8px 12px', borderRadius: 8, marginBottom: 4,
                      fontSize: 13, transition: 'all 0.15s',
                      background: sort === s.value ? 'var(--accent-dim)' : 'transparent',
                      color: sort === s.value ? 'var(--accent)' : 'var(--text2)',
                      border: `1px solid ${sort === s.value ? 'rgba(201,169,110,0.2)' : 'transparent'}`,
                    }}>
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* PRICE RANGE */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Price Range</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={minPrice}
                      onChange={e => updateParam('minPrice', e.target.value)}
                      style={{ padding: '8px 10px', fontSize: 12 }}
                    />
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={maxPrice}
                      onChange={e => updateParam('maxPrice', e.target.value)}
                      style={{ padding: '8px 10px', fontSize: 12 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {[
                      { label: 'Under ₹1K', min: '', max: '1000' },
                      { label: '₹1K-5K', min: '1000', max: '5000' },
                      { label: '₹5K-20K', min: '5000', max: '20000' },
                      { label: 'Above ₹20K', min: '20000', max: '' },
                    ].map(range => (
                      <button key={range.label} onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        if (range.min) next.set('minPrice', range.min); else next.delete('minPrice');
                        if (range.max) next.set('maxPrice', range.max); else next.delete('maxPrice');
                        next.delete('page');
                        setSearchParams(next);
                      }} style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 11,
                        border: '1px solid var(--border)', color: 'var(--text2)',
                        background: minPrice === range.min && maxPrice === range.max ? 'var(--accent-dim)' : 'transparent',
                        transition: 'all 0.15s',
                      }}>
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RATING */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Min Rating</p>
                  {[4, 3, 2].map(r => (
                    <button key={r} onClick={() => updateParam('rating', rating === String(r) ? '' : String(r))} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '8px 12px', borderRadius: 8, marginBottom: 4,
                      fontSize: 13, transition: 'all 0.15s',
                      background: rating === String(r) ? 'var(--accent-dim)' : 'transparent',
                      color: rating === String(r) ? 'var(--accent)' : 'var(--text2)',
                      border: `1px solid ${rating === String(r) ? 'rgba(201,169,110,0.2)' : 'transparent'}`,
                    }}>
                      {'★'.repeat(r)}{'☆'.repeat(5 - r)} & above
                    </button>
                  ))}
                </div>

                {/* BRANDS */}
                {brands.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Brand</p>
                    {brands.map(b => (
                      <button key={b} onClick={() => updateParam('brand', brand === b ? '' : b)} style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '8px 12px', borderRadius: 8, marginBottom: 4,
                        fontSize: 13, transition: 'all 0.15s',
                        background: brand === b ? 'var(--accent-dim)' : 'transparent',
                        color: brand === b ? 'var(--accent)' : 'var(--text2)',
                        border: `1px solid ${brand === b ? 'rgba(201,169,110,0.2)' : 'transparent'}`,
                      }}>
                        {b}
                      </button>
                    ))}
                  </div>
                )}

                {activeFilters.length > 0 && (
                  <button onClick={clearAll} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          <div>
            {loading ? (
              <div className="grid-products">
                {[...Array(8)].map((_, i) => (
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
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text2)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <p style={{ fontSize: 18, marginBottom: 8 }}>No products found</p>
                <p style={{ marginBottom: 20 }}>Try adjusting your filters</p>
                <button onClick={clearAll} className="btn btn-primary">Clear Filters</button>
              </div>
            ) : (
              <div className="grid-products">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}

            {/* PAGINATION */}
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
                <button
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', page - 1);
                    setSearchParams(next);
                  }}
                  disabled={page === 1}
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  ← Prev
                </button>
                {[...Array(pages)].map((_, i) => (
                  <button key={i}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', i + 1);
                      setSearchParams(next);
                    }}
                    style={{
                      width: 38, height: 38, borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: page === i + 1 ? 'var(--accent)' : 'var(--bg2)',
                      color: page === i + 1 ? '#0a0a0b' : 'var(--text)',
                      fontWeight: page === i + 1 ? 600 : 400,
                      fontSize: 14,
                    }}
                  >{i + 1}</button>
                ))}
                <button
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', page + 1);
                    setSearchParams(next);
                  }}
                  disabled={page === pages}
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}