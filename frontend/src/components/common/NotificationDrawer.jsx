import React from 'react';
import { Bell, CheckCheck, Clock, ShieldAlert } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, notifications, onMarkAllRead }) {
  if (!isOpen) return null;

  const isUnread = (item) => item.unread === true || item.isRead === false || (!item.isRead && !item.read);
  const unreadCount = notifications.filter(isUnread).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-body" 
        style={{ maxWidth: '420px', width: '90%', position: 'fixed', right: '1.2rem', top: '4.5rem', bottom: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell className="w-4 h-4 text-blue-500" />
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Notifications & Alerts</h4>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ margin: '0.8rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            {unreadCount} Unread Alert{unreadCount === 1 ? '' : 's'}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '13px' }}>
              <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600" style={{ margin: '0 auto 0.5rem' }} />
              No notifications yet. You're all caught up!
            </div>
          ) : (
            notifications.map((item) => {
              const unread = isUnread(item);
              return (
                <div 
                  key={item.id} 
                  style={{
                    padding: '0.8rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    backgroundColor: unread ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    borderLeft: unread ? '3px solid #3b82f6' : '1px solid var(--border-color)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-color)' }}>
                      {item.title || 'System Notification'}
                    </span>
                    {unread && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {item.message}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'flex-end' }}>
                    <Clock className="w-3 h-3" />
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (item.time || 'Just now')}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
