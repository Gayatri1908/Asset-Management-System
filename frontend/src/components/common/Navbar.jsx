import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleSidebar, notifications, onOpenNotifications, user }) {
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => n.unread === true || n.isRead === false || (!n.isRead && !n.read)).length;

  return (
    <header className="navbar">
      {/* Brand Logo & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onToggleSidebar} className="btn-icon" style={{ display: 'none' }}>
          ☰
        </button>
        <span 
          onClick={() => navigate('/')} 
          className="brand-logo" 
          style={{ cursor: 'pointer' }}
        >
          Asset Management System (AMS)
        </span>
      </div>

      {/* Global Search Bar */}
      <div style={{ flex: 1, maxWidth: '400px', margin: '0 1rem' }}>
        <input
          type="text"
          placeholder="Search assets by ID, name, brand..."
          className="search-input"
          style={{ width: '100%' }}
        />
      </div>

      {/* Actions */}
      <div className="nav-actions">
        <button onClick={toggleTheme} className="btn-icon" title="Toggle Theme">
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>

        <button onClick={onOpenNotifications} className="btn-icon" style={{ position: 'relative' }}>
          🔔 {unreadCount > 0 && <span style={{ color: 'red', fontWeight: 'bold' }}>({unreadCount})</span>}
        </button>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)} 
            className="btn-secondary"
            style={{ borderRadius: '20px', padding: '0.3rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {user?.name || 'Unknown User'} ▾
          </button>

          {showProfileMenu && (
            <div 
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                width: '200px',
                boxShadow: 'var(--shadow)',
                padding: '0.5rem 0',
                zIndex: 200
              }}
              onClick={() => setShowProfileMenu(false)}
            >
              <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                <strong>{user?.name || 'Unknown User'}</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {user?.role ? user.role.replace('_', ' ') : 'User'}
                </div>
              </div>
              <button 
                onClick={() => navigate('/profile')} 
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
              >
                Profile
              </button>
              <button 
                onClick={() => navigate('/settings')} 
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
              >
                Settings
              </button>
              <button 
                onClick={() => {
                  // Clear both sessionStorage and localStorage
                  sessionStorage.removeItem('session');
                  localStorage.removeItem('ams_auth_token');
                  localStorage.removeItem('token');
                  navigate('/login');
                }} 
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f', fontWeight: '500' }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
