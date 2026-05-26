import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponValid, setCouponValid] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', address: '', city: '',
    state: '', pincode: '', phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const shippingPrice = totalPrice > 999 ? 0 : 99;
  const finalTotal = totalPrice + shippingPrice - discountAmount;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg('');
    try {
      const { data } = await axios.post('/api/coupons/validate', {
        code: couponCode, orderTotal: totalPrice,
      });
      setDiscountAmount(data.discountAmount);
      setAppliedCoupon(data.code);
      setCouponValid(true);
      setCouponMsg(data.message);
    } catch (err) {
      setCouponValid(false);
      setDiscountAmount(0);
      setAppliedCoupon(null);
      setCouponMsg(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponMsg('');
    setCouponValid(false);
    setDiscountAmount(0);
    setAppliedCoupon(null);
  };

  const placeOrder = async (paymentResult = null) => {
    const { data: order } = await axios.post('/api/orders', {
      items: cartItems.map(i => ({
        product:  i.product,
        name:     i.name,
        image:    i.image,
        price:    i.price,
        quantity: i.quantity,
        size:     i.size,
        color:    i.color,
      })),
      shippingAddress: form,
      paymentMethod,
      itemsPrice:   totalPrice,
      shippingPrice,
      totalPrice:   finalTotal,
      ...(paymentResult ? { isPaid: true, paidAt: new Date(), paymentResult } : {}),
    });
    if (appliedCoupon) {
      await axios.post('/api/coupons/apply', { code: appliedCoupon });
    }
    await clearCart();
    return order;
  };

  const handleRazorpay = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/payment/create-order', {
        amount: finalTotal,
      });

      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        'ShopSavyy',
        description: 'Order Payment',
        order_id:    data.orderId,
        prefill: {
          name:    user.name,
          email:   user.email,
          contact: form.phone,
        },
        theme: { color: '#c9a96e' },
        handler: async (response) => {
          try {
            const order = await placeOrder({
              id:          response.razorpay_payment_id,
              status:      'completed',
              update_time: new Date().toISOString(),
            });
            await axios.post('/api/payment/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId:             order._id,
            });
            navigate('/orders');
          } catch (err) {
            setError('Payment verified but order failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Try again.');
      setLoading(false);
    }
  };

  const handleCOD = async () => {
    setLoading(true);
    setError('');
    try {
      await placeOrder();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (cartItems.length === 0) return setError('Your cart is empty');
    if (paymentMethod === 'COD') {
      await handleCOD();
    } else {
      await handleRazorpay();
    }
  };

  if (cartItems.length === 0) return (
    <div style={{
      paddingTop: 100, minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16, color: 'var(--text2)',
    }}>
      <div style={{ fontSize: 48 }}>🛒</div>
      <p style={{ fontSize: 18 }}>Your cart is empty</p>
      <button className="btn btn-primary" onClick={() => navigate('/shop')}>
        Continue Shopping
      </button>
    </div>
  );

  return (
    <div className="page-enter" style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 40,
          fontWeight: 400, marginBottom: 40,
        }}>
          Checkout
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40 }}>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '28px', marginBottom: 24,
            }}>
              <h2 style={{ fontWeight: 500, marginBottom: 24, fontSize: 18 }}>
                Shipping Address
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'fullName', label: 'Full Name', placeholder: 'John Doe', col: 2 },
                  { key: 'address', label: 'Address', placeholder: '123 Street, Area', col: 2 },
                  { key: 'city', label: 'City', placeholder: 'Mumbai' },
                  { key: 'state', label: 'State', placeholder: 'Maharashtra' },
                  { key: 'pincode', label: 'Pincode', placeholder: '400001' },
                  { key: 'phone', label: 'Phone', placeholder: '9999999999' },
                ].map(field => (
                  <div key={field.key} style={{ gridColumn: field.col === 2 ? 'span 2' : 'span 1' }}>
                    <label style={{
                      fontSize: 13, color: 'var(--text2)',
                      display: 'block', marginBottom: 8,
                    }}>
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={form[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '28px', marginBottom: 24,
            }}>
              <h2 style={{ fontWeight: 500, marginBottom: 20, fontSize: 18 }}>
                Payment Method
              </h2>
              {[
                { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                { value: 'Razorpay', label: 'Pay Online', desc: 'UPI, Cards, Net Banking via Razorpay' },
              ].map(method => (
                <div key={method.value} onClick={() => setPaymentMethod(method.value)} style={{
                  padding: '14px 16px', borderRadius: 10, marginBottom: 10,
                  border: `1px solid ${paymentMethod === method.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: paymentMethod === method.value ? 'var(--accent-dim)' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'all 0.2s',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: `2px solid ${paymentMethod === method.value ? 'var(--accent)' : 'var(--border2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {paymentMethod === method.value && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                    )}
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: 14 }}>{method.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--text2)' }}>{method.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: 8, marginBottom: 20,
                background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)',
                color: 'var(--red)', fontSize: 14,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
            >
              {loading ? 'Processing...' : paymentMethod === 'COD'
                ? `Place Order · ₹${finalTotal.toLocaleString('en-IN')}`
                : `Pay ₹${finalTotal.toLocaleString('en-IN')} via Razorpay`
              }
            </button>
          </form>

          {/* ORDER SUMMARY */}
          <div>
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '24px', position: 'sticky', top: 80,
            }}>
              <h2 style={{ fontWeight: 500, marginBottom: 20, fontSize: 18 }}>Order Summary</h2>

              {cartItems.map(item => (
                <div key={item._id} style={{
                  display: 'flex', gap: 12, marginBottom: 16,
                  paddingBottom: 16, borderBottom: '1px solid var(--border)',
                }}>
                  <img src={item.image} alt={item.name} style={{
                    width: 56, height: 56, objectFit: 'cover',
                    borderRadius: 8, background: 'var(--bg3)',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 500, marginBottom: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text2)' }}>Qty: {item.quantity}</p>
                    <p style={{ fontSize: 13, color: 'var(--accent)' }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}

              {/* COUPON */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
                  Have a coupon?
                </p>
                {!couponValid ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      style={{ flex: 1, padding: '9px 12px', fontSize: 13 }}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="btn btn-outline"
                      style={{ padding: '9px 14px', fontSize: 13, flexShrink: 0 }}
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(92,184,122,0.1)', border: '1px solid rgba(92,184,122,0.2)',
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>
                      ✓ {appliedCoupon} applied
                    </span>
                    <button onClick={removeCoupon} style={{ color: 'var(--text3)', fontSize: 12 }}>
                      Remove
                    </button>
                  </div>
                )}
                {couponMsg && (
                  <p style={{
                    fontSize: 12, marginTop: 8,
                    color: couponValid ? 'var(--green)' : 'var(--red)',
                  }}>
                    {couponMsg}
                  </p>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                {[
                  { label: 'Subtotal', value: `₹${totalPrice.toLocaleString('en-IN')}` },
                  { label: 'Shipping', value: shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}` },
                  ...(discountAmount > 0 ? [{ label: `Discount (${appliedCoupon})`, value: `-₹${discountAmount.toLocaleString('en-IN')}`, green: true }] : []),
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 10, fontSize: 14,
                  }}>
                    <span style={{ color: 'var(--text2)' }}>{row.label}</span>
                    <span style={{ color: row.green ? 'var(--green)' : row.value === 'FREE' ? 'var(--green)' : 'var(--text)' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)',
                  fontWeight: 600, fontSize: 18,
                }}>
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
                {shippingPrice === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>
                    ✓ Free shipping on orders above ₹999
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}