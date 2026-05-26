import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate('/login');
    axios.get('/api/orders/mine')
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const statusColor = {
    pending:    'var(--text2)',
    processing: '#e8c95a',
    shipped:    '#5ab8e8',
    delivered:  'var(--green)',
    cancelled:  'var(--red)',
  };

  if (loading) return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="container">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 120, marginBottom: 16, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-enter" style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 40,
          fontWeight: 400, marginBottom: 40,
        }}>
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            color: 'var(--text2)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <p style={{ fontSize: 18, marginBottom: 12 }}>No orders yet</p>
            <button className="btn btn-primary" onClick={() => navigate('/shop')}>
              Start Shopping
            </button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="card" style={{ padding: '24px', marginBottom: 16 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 16,
                flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
                    ORDER ID
                  </p>
                  <p style={{ fontFamily: 'monospace', fontSize: 13 }}>
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>DATE</p>
                  <p style={{ fontSize: 13 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>TOTAL</p>
                  <p style={{ fontWeight: 600 }}>₹{order.totalPrice.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>PAYMENT</p>
                  <p style={{ fontSize: 13 }}>{order.paymentMethod}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>STATUS</p>
                  <span style={{
                    fontSize: 13, fontWeight: 500, textTransform: 'capitalize',
                    color: statusColor[order.status] || 'var(--text2)',
                  }}>
                    ● {order.status}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: 48, height: 48, objectFit: 'cover',
                          borderRadius: 8, background: 'var(--bg3)',
                        }}
                      />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text2)' }}>
                          Qty: {item.quantity} · ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                marginTop: 16, paddingTop: 16,
                borderTop: '1px solid var(--border)',
              }}>
                <p style={{ fontSize: 13, color: 'var(--text2)' }}>
                  <strong style={{ color: 'var(--text)' }}>Ship to:</strong>{' '}
                  {order.shippingAddress.fullName},{' '}
                  {order.shippingAddress.address},{' '}
                  {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}