import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import NotificationDrawer from '../components/common/NotificationDrawer';
import { Toaster } from 'react-hot-toast';
import { NotificationService } from '../services/api';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const session = JSON.parse(sessionStorage.getItem('session') || '{}');
  const user = { name: session.username, role: session.role };

  const fetchNotifications = async () => {
    try {
      if (session?.token) {
        const res = await NotificationService.getUnread();
        setNotifications(res?.data || res || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      for (const notif of notifications) {
        if (!notif.isRead && notif.isRead !== true) {
          await NotificationService.markAsRead(notif.id);
        }
      }
      setNotifications(prev => prev.map(n => ({ ...n, unread: false, isRead: true, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  return (
    <div className="app-layout">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        notifications={notifications}
        onOpenNotifications={() => setNotificationsOpen(true)}
        user={user}
      />

      <div className="main-wrapper">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <Footer />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
}
