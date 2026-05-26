import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });

  useEffect(() => {
    if (!user) return navigate('/login');
    setForm({ name: user.name, email: user.email, password: '', confirmPassword: '' });
    axios.get('/api/orders/mine')
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (form.password && form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      await axios.put('/api/auth/profile', payload);
      setMsg('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const totalSpent = orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const statusColor = {
    pending: 'var(--text2)', processing: '#e8c95a',
    shipped: '#5ab8e8', delivered: 'var(--green)', cancelled: 'var(--red)',
  };

  if (!user) return null;

  return (
    <div className="page-enter" style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40, maxWidth: 900 }}>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 400, marginBottom: 40 }}>
          My Profile
        </h1>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Total Orders', value: orders.length, icon: '📦' },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: '💰' },
            { label: 'Wishlist Items', value: wishlistItems.length, icon: '♥' },
            { label: 'Member Since', value: new Date(user.createdAt || Date.now()).getFullYear(), icon: '🎯' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
              <p style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* PROFILE FORM */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontWeight: 500, fontSize: 18 }}>Account Details</h2>
              {!editing && (
                <button className="btn btn-outline" style={{ padding: '7px 14px', fontSize: 13 }}
                  onClick={() => setEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            {msg && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, marginBottom: 16,
                background: 'rgba(92,184,122,0.1)', border: '1px solid rgba(92,184,122,0.2)',
                color: 'var(--green)', fontSize: 14,
              }}>{msg}</div>
            )}
            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, marginBottom: 16,
                background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)',
                color: 'var(--red)', fontSize: 14,
              }}>{error}</div>
            )}

            {!editing ? (
              <div>
                {[
                  { label: 'Full Name', value: user.name },
                  { label: 'Email', value: user.email },
                  { label: 'Role', value: user.isAdmin ? 'Admin' : 'Customer' },
                ].map(field => (
                  <div key={field.label} style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {field.label}
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 500 }}>{field.value}</p>
                  </div>
                ))}
                <div className="divider" />
                <button onClick={() => { logout(); navigate('/'); }}
                  style={{ color: 'var(--red)', fontSize: 14, padding: '8px 0' }}>
                  Logout from account
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdate}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Full Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>New Password (optional)</label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave blank to keep current" />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Confirm Password</label>
                  <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Confirm new password" />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Save Changes</button>
                  <button type="button" className="btn btn-outline" onClick={() => { setEditing(false); setError(''); setMsg(''); }}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* RECENT ORDERS */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontWeight: 500, fontSize: 18 }}>Recent Orders</h2>
              <Link to="/orders" style={{ color: 'var(--accent)', fontSize: 13 }}>View all →</Link>
            </div>

            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 60, marginBottom: 10, borderRadius: 8 }} />
              ))
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text2)' }}>
                <p style={{ marginBottom: 12 }}>No orders yet</p>
                <Link to="/shop" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.slice(0, 5).map(order => (
                <div key={order._id} style={{
                  padding: '14px 0', borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontFamily: 'monospace', marginBottom: 4 }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text2)' }}>
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} · {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>₹{order.totalPrice.toLocaleString('en-IN')}</p>
                    <span style={{ fontSize: 12, color: statusColor[order.status], fontWeight: 500, textTransform: 'capitalize' }}>
                      ● {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}