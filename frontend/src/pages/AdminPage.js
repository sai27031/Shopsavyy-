
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: 'clothing', subCategory: '', brand: '',
    image: '', stock: '', featured: false,
    sizes: '', colors: '', tags: '',
  });
  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'percentage', discountValue: '',
    minOrderValue: '', maxDiscount: '', usageLimit: '100',
    expiryDate: '',
  });
  const [couponMsg, setCouponMsg] = useState('');
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) return navigate('/');
    fetchData();
  }, [user, tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'products') {
        const r = await axios.get('/api/products?limit=100');
        setProducts(r.data.products);
      } else if (tab === 'orders') {
        const r = await axios.get('/api/orders');
        setOrders(r.data);
      } else if (tab === 'coupons') {
        const r = await axios.get('/api/coupons');
        setCoupons(r.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', price: '', originalPrice: '',
      category: 'clothing', subCategory: '', brand: '',
      image: '', stock: '', featured: false,
      sizes: '', colors: '', tags: '',
    });
    setEditProduct(null);
    setShowForm(false);
    setMsg('');
  };

  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setUploadingImage(true);
  setUploadMsg('');
  try {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await axios.post('/api/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setForm(f => ({ ...f, image: data.url }));
    setUploadMsg('Image uploaded successfully!');
  } catch (err) {
    setUploadMsg(err.response?.data?.message || 'Upload failed');
  } finally {
    setUploadingImage(false);
  }
};

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      name:          product.name,
      description:   product.description,
      price:         product.price,
      originalPrice: product.originalPrice || '',
      category:      product.category,
      subCategory:   product.subCategory || '',
      brand:         product.brand || '',
      image:         product.image,
      stock:         product.stock,
      featured:      product.featured,
      sizes:         product.sizes?.join(', ') || '',
      colors:        product.colors?.join(', ') || '',
      tags:          product.tags?.join(', ') || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    const payload = {
      ...form,
      price:         Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock:         Number(form.stock),
      sizes:         form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      colors:        form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
      tags:          form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    try {
      if (editProduct) {
        await axios.put(`/api/products/${editProduct._id}`, payload);
        setMsg('Product updated successfully!');
      } else {
        await axios.post('/api/products', payload);
        setMsg('Product added successfully!');
      }
      fetchData();
      setTimeout(resetForm, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCouponMsg('');
    try {
      await axios.post('/api/coupons', {
        ...couponForm,
        discountValue: Number(couponForm.discountValue),
        minOrderValue: Number(couponForm.minOrderValue) || 0,
        maxDiscount:   couponForm.maxDiscount ? Number(couponForm.maxDiscount) : undefined,
        usageLimit:    Number(couponForm.usageLimit),
      });
      setCouponMsg('Coupon created successfully!');
      setCouponForm({
        code: '', discountType: 'percentage', discountValue: '',
        minOrderValue: '', maxDiscount: '', usageLimit: '100', expiryDate: '',
      });
      fetchData();
      setTimeout(() => { setShowCouponForm(false); setCouponMsg(''); }, 1500);
    } catch (err) {
      setCouponMsg(err.response?.data?.message || 'Error creating coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await axios.delete(`/api/coupons/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCoupon = async (id) => {
    try {
      await axios.put(`/api/coupons/${id}/toggle`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = {
    pending: 'var(--text2)', processing: '#e8c95a',
    shipped: '#5ab8e8', delivered: 'var(--green)', cancelled: 'var(--red)',
  };

  const inputStyle = { marginBottom: 16 };
  const labelStyle = { fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 };

  return (
    <div className="page-enter" style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 400 }}>
            Admin Panel
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {['products', 'orders', 'coupons'].map(t => (
              <button key={t} onClick={() => { setTab(t); resetForm(); }}
                className={tab === t ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ padding: '8px 20px', textTransform: 'capitalize' }}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <>
            <div style={{ marginBottom: 20 }}>
              {!showForm ? (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  + Add New Product
                </button>
              ) : (
                <div style={{
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '28px', marginBottom: 32,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h2 style={{ fontWeight: 500, fontSize: 20 }}>
                      {editProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={resetForm} style={{ color: 'var(--text2)', fontSize: 20 }}>✕</button>
                  </div>

                  {msg && (
                    <div style={{
                      padding: '12px 16px', borderRadius: 8, marginBottom: 20,
                      background: msg.includes('success') ? 'rgba(92,184,122,0.1)' : 'rgba(224,92,92,0.1)',
                      border: `1px solid ${msg.includes('success') ? 'rgba(92,184,122,0.2)' : 'rgba(224,92,92,0.2)'}`,
                      color: msg.includes('success') ? 'var(--green)' : 'var(--red)', fontSize: 14,
                    }}>{msg}</div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Product Name *</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Nike Air Max" required />
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Brand</label>
                        <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="e.g. Nike" />
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Category *</label>
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                          <option value="clothing">Clothing</option>
                          <option value="electronics">Electronics</option>
                        </select>
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Sub Category</label>
                        <input value={form.subCategory} onChange={e => setForm(f => ({ ...f, subCategory: e.target.value }))} placeholder="e.g. T-Shirts, Laptops" />
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Price (₹) *</label>
                        <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="999" required />
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Original Price (₹)</label>
                        <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="1299" />
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Stock *</label>
                        <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="50" required />
                      </div>
                      <div style={{ ...inputStyle, gridColumn: 'span 2' }}>
  <label style={labelStyle}>Product Image *</label>
  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
    <div style={{ flex: 1 }}>
      <input
        value={form.image}
        onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
        placeholder="Paste image URL or upload below"
      />
    </div>
    <div style={{ flexShrink: 0 }}>
      <label style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
        border: '1px solid var(--border2)', background: 'var(--bg3)',
        color: 'var(--text)', fontSize: 13, transition: 'all 0.2s',
      }}>
        {uploadingImage ? 'Uploading...' : '📁 Upload Image'}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
          disabled={uploadingImage}
        />
      </label>
    </div>
    {form.image && (
      <img
        src={form.image}
        alt="preview"
        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
      />
    )}
  </div>
  {uploadMsg && (
    <p style={{ fontSize: 12, marginTop: 8, color: uploadMsg.includes('success') ? 'var(--green)' : 'var(--red)' }}>
      {uploadMsg}
    </p>
  )}
</div>
                      <div style={{ ...inputStyle, gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Description *</label>
                        <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the product..." required style={{ resize: 'vertical' }} />
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Sizes (comma separated)</label>
                        <input value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} placeholder="S, M, L, XL" />
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Colors (comma separated)</label>
                        <input value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} placeholder="Red, Blue, Black" />
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Tags (comma separated)</label>
                        <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="summer, casual, trending" />
                      </div>
                      <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} style={{ width: 'auto' }} />
                        <label htmlFor="featured" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Mark as Featured</label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <button type="submit" className="btn btn-primary" style={{ padding: '11px 28px' }}>
                        {editProduct ? 'Update Product' : 'Add Product'}
                      </button>
                      <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {loading ? (
              <div>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8, borderRadius: 8 }} />)}</div>
            ) : (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                      {['Image', 'Name', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <img src={p.image} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, maxWidth: 200 }}>
                          <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--text3)' }}>{p.brand}</p>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>{p.category}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 14 }}>
                          <p style={{ fontWeight: 500 }}>₹{p.price.toLocaleString('en-IN')}</p>
                          {p.originalPrice && <p style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString('en-IN')}</p>}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 14 }}>
                          <span style={{ color: p.stock > 0 ? 'var(--green)' : 'var(--red)' }}>
                            {p.stock > 0 ? `${p.stock} units` : 'Out of stock'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {p.featured ? <span style={{ color: 'var(--accent)' }}>★ Yes</span> : <span style={{ color: 'var(--text3)' }}>No</span>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleEdit(p)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }}>Edit</button>
                            <button onClick={() => handleDelete(p._id)} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', background: 'rgba(224,92,92,0.08)', cursor: 'pointer' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>No products yet.</div>
                )}
              </div>
            )}
          </>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          loading ? (
            <div>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 8, borderRadius: 8 }} />)}</div>
          ) : (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                    {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Update'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 13 }}>#{order._id.slice(-8).toUpperCase()}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13 }}>
                        <p>{order.user?.name}</p>
                        <p style={{ color: 'var(--text3)', fontSize: 12 }}>{order.user?.email}</p>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text2)' }}>{order.items.length} item{order.items.length > 1 ? 's' : ''}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>₹{order.totalPrice.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13 }}>{order.paymentMethod}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: statusColor[order.status], fontWeight: 500, fontSize: 13, textTransform: 'capitalize' }}>● {order.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <select value={order.status} onChange={e => updateOrderStatus(order._id, e.target.value)} style={{ width: 'auto', fontSize: 12, padding: '6px 10px' }}>
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>No orders yet.</div>
              )}
            </div>
          )
        )}

        {/* COUPONS TAB */}
        {tab === 'coupons' && (
          <>
            <div style={{ marginBottom: 20 }}>
              {!showCouponForm ? (
                <button className="btn btn-primary" onClick={() => setShowCouponForm(true)}>
                  + Create New Coupon
                </button>
              ) : (
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px', marginBottom: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h2 style={{ fontWeight: 500, fontSize: 20 }}>Create Coupon</h2>
                    <button onClick={() => { setShowCouponForm(false); setCouponMsg(''); }} style={{ color: 'var(--text2)', fontSize: 20 }}>✕</button>
                  </div>

                  {couponMsg && (
                    <div style={{
                      padding: '12px 16px', borderRadius: 8, marginBottom: 20,
                      background: couponMsg.includes('success') ? 'rgba(92,184,122,0.1)' : 'rgba(224,92,92,0.1)',
                      border: `1px solid ${couponMsg.includes('success') ? 'rgba(92,184,122,0.2)' : 'rgba(224,92,92,0.2)'}`,
                      color: couponMsg.includes('success') ? 'var(--green)' : 'var(--red)', fontSize: 14,
                    }}>{couponMsg}</div>
                  )}

                  <form onSubmit={handleCreateCoupon}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Coupon Code *</label>
                        <input value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" required />
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Discount Type *</label>
                        <select value={couponForm.discountType} onChange={e => setCouponForm(f => ({ ...f, discountType: e.target.value }))}>
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Discount Value *</label>
                        <input type="number" value={couponForm.discountValue} onChange={e => setCouponForm(f => ({ ...f, discountValue: e.target.value }))} placeholder={couponForm.discountType === 'percentage' ? '20 (for 20%)' : '200 (for ₹200 off)'} required />
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Min Order Value (₹)</label>
                        <input type="number" value={couponForm.minOrderValue} onChange={e => setCouponForm(f => ({ ...f, minOrderValue: e.target.value }))} placeholder="499" />
                      </div>
                      {couponForm.discountType === 'percentage' && (
                        <div style={inputStyle}>
                          <label style={labelStyle}>Max Discount (₹)</label>
                          <input type="number" value={couponForm.maxDiscount} onChange={e => setCouponForm(f => ({ ...f, maxDiscount: e.target.value }))} placeholder="500" />
                        </div>
                      )}
                      <div style={inputStyle}>
                        <label style={labelStyle}>Usage Limit</label>
                        <input type="number" value={couponForm.usageLimit} onChange={e => setCouponForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="100" />
                      </div>
                      <div style={inputStyle}>
                        <label style={labelStyle}>Expiry Date *</label>
                        <input type="date" value={couponForm.expiryDate} onChange={e => setCouponForm(f => ({ ...f, expiryDate: e.target.value }))} required />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <button type="submit" className="btn btn-primary" style={{ padding: '11px 28px' }}>Create Coupon</button>
                      <button type="button" className="btn btn-outline" onClick={() => setShowCouponForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {loading ? (
              <div>{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8, borderRadius: 8 }} />)}</div>
            ) : (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                      {['Code', 'Type', 'Value', 'Min Order', 'Used', 'Expiry', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>{c.code}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, textTransform: 'capitalize' }}>{c.discountType}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500 }}>
                          {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          {c.minOrderValue > 0 ? `₹${c.minOrderValue}` : 'None'}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          {c.usedCount}/{c.usageLimit}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          {new Date(c.expiryDate).toLocaleDateString('en-IN')}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ color: c.isActive ? 'var(--green)' : 'var(--red)', fontSize: 13, fontWeight: 500 }}>
                            ● {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleToggleCoupon(c._id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }}>
                              {c.isActive ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={() => handleDeleteCoupon(c._id)} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', background: 'rgba(224,92,92,0.08)', cursor: 'pointer' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {coupons.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text2)' }}>
                    No coupons yet. Create your first coupon above.
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}