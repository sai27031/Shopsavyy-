import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, setCartOpen } = useCart();
  const { wishlistItems } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?search=${encodeURIComponent(search)}`);
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(10,10,11,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 24 }}>

        <Link to="/" style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500,
          letterSpacing: '0.05em', color: 'var(--accent)', flexShrink: 0,
        }}>
          ShopSavyy
        </Link>

        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {[
            ['/', 'Home'],
            ['/shop', 'Shop'],
            ['/shop?category=clothing', 'Clothing'],
            ['/shop?category=electronics', 'Electronics'],
          ].map(([path, label]) => (
            <Link key={path} to={path} style={{
              padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              color: location.pathname === path ? 'var(--text)' : 'var(--text2)',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = location.pathname === path ? 'var(--text)' : 'var(--text2)'}
            >{label}</Link>
          ))}
        </div>

        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 340 }}>
          <div style={{ position: 'relative' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              style={{ paddingRight: 40, background: 'var(--bg3)', borderColor: 'var(--border)' }}
            />
            <button type="submit" style={{
              position: 'absolute', right: 10, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text2)', fontSize: 16,
            }}>⌕</button>
          </div>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {user ? (
            <>
              {user.isAdmin && (
                <Link to="/admin" className="btn btn-outline" style={{ padding: '7px 14px', fontSize: 13 }}>
                  Admin
                </Link>
              )}

              {/* USER DROPDOWN */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 12px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'var(--bg2)',
                    color: 'var(--text)', fontSize: 13, transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--accent)', color: '#0a0a0b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  {user.name?.split(' ')[0]}
                  <span style={{ fontSize: 10, color: 'var(--text2)' }}>▼</span>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 8,
                    background: 'var(--bg2)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '8px', minWidth: 180,
                    boxShadow: 'var(--shadow)', zIndex: 200,
                    animation: 'popUp 0.15s ease',
                  }}>
                    <style>{`@keyframes popUp { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

                    {[
                      { label: '👤 My Profile', path: '/profile' },
                      { label: '📦 My Orders', path: '/orders' },
                      { label: '♥ Wishlist', path: '/wishlist' },
                    ].map(item => (
                      <Link key={item.path} to={item.path} style={{
                        display: 'block', padding: '10px 14px', borderRadius: 8,
                        fontSize: 13, color: 'var(--text2)', transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; }}
                      >{item.label}</Link>
                    ))}

                    <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

                    <button onClick={() => { logout(); navigate('/'); }} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', borderRadius: 8,
                      fontSize: 13, color: 'var(--red)', transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,92,92,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text2)', fontSize: 13, padding: '7px 10px' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>
                Register
              </Link>
            </>
          )}

          {/* WISHLIST BUTTON */}
          <Link to="/wishlist" style={{
            position: 'relative', padding: '8px 12px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg2)',
            color: wishlistItems.length > 0 ? '#e05c5c' : 'var(--text2)',
            fontSize: 16, transition: 'border-color 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#e05c5c'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {wishlistItems.length > 0 ? '♥' : '♡'}
            {wishlistItems.length > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: '#e05c5c', color: '#fff',
                fontSize: 10, fontWeight: 700, borderRadius: '50%',
                width: 18, height: 18, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>{wishlistItems.length}</span>
            )}
          </Link>

          {/* CART BUTTON */}
          <button onClick={() => setCartOpen(true)} style={{
            position: 'relative', padding: '8px 12px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg2)',
            color: 'var(--text)', fontSize: 16, transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            🛒
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--accent)', color: '#0a0a0b',
                fontSize: 10, fontWeight: 700, borderRadius: '50%',
                width: 18, height: 18, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>{totalItems}</span>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}