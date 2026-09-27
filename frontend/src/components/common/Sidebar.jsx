import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Laptop,
  Layers,
  FolderTree,
  Truck,
  Wrench,
  Users,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  ClipboardList,
  QrCode,
  AlertTriangle,
  CalendarClock,
  Send,
  RotateCcw,
  Clock,
  UserCheck,
  FileText,
  History,
  PlusCircle,
  Package,
  CornerUpLeft,
  MessageSquareWarning,
  UserCog,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Shield,
  User
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const [assetSubmenuOpen, setAssetSubmenuOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const session = JSON.parse(sessionStorage.getItem('session') || '{}');
  const rawRole = session.role || 'EMPLOYEE';
  const role = rawRole.toUpperCase().replace('ROLE_', '');
  const username = session.username || 'User';

  const handleLogout = () => {
    sessionStorage.removeItem('session');
    localStorage.removeItem('ams_auth_token');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className={`enhanced-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-scroll-area">
        {/* Role Badge Indicator Card */}
        <div className="sidebar-role-badge-card">
          <div className="role-badge-left">
            <div className={`role-icon-box ${
              role === 'ADMIN' ? 'role-icon-admin' :
              role === 'ASSET_ISSUER' ? 'role-icon-issuer' : 'role-icon-employee'
            }`}>
              {role === 'ADMIN' ? <Shield size={16} /> :
               role === 'ASSET_ISSUER' ? <ShieldCheck size={16} /> : <User size={16} />}
            </div>
            <div>
              <div className="role-title-text">
                {role === 'ADMIN' ? 'Admin Portal' :
                 role === 'ASSET_ISSUER' ? 'Issuer Desk' : 'Employee Desk'}
              </div>
              <div className="role-subtitle-text">AIMS Enterprise</div>
            </div>
          </div>
          <div className="role-status-dot" title="Active Connection" />
        </div>

        {/* ================= ADMIN NAVIGATION ================= */}
        {role === 'ADMIN' && (
          <>
            <div className="sidebar-group">
              <span className="sidebar-group-header">Core Management</span>
              
              <NavLink to="/admin" end className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <LayoutDashboard className="nav-link-icon" />
                  <span>Admin Dashboard</span>
                </div>
              </NavLink>

              {/* Collapsible Asset Management */}
              <div>
                <div 
                  onClick={() => setAssetSubmenuOpen(!assetSubmenuOpen)}
                  className={`enhanced-nav-link collapsible-trigger ${location.pathname.startsWith('/assets') ? 'active' : ''}`}
                >
                  <div className="nav-link-left">
                    <Laptop className="nav-link-icon" />
                    <span>Asset Management</span>
                  </div>
                  {assetSubmenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>

                {assetSubmenuOpen && (
                  <div className="submenu-container">
                    <NavLink to="/assets" end className={({ isActive }) => `enhanced-submenu-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                      <Package size={13} />
                      <span>All Asset Registry</span>
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink to="/inventory" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <Layers className="nav-link-icon" />
                  <span>Inventory Control</span>
                </div>
              </NavLink>

              <NavLink to="/categories" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <FolderTree className="nav-link-icon" />
                  <span>Asset Categories</span>
                </div>
              </NavLink>

              <NavLink to="/vendors" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <Truck className="nav-link-icon" />
                  <span>Vendor Directory</span>
                </div>
              </NavLink>

              <NavLink to="/maintenance" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <Wrench className="nav-link-icon" />
                  <span>Maintenance Desk</span>
                </div>
              </NavLink>
            </div>

            <div className="sidebar-group">
              <span className="sidebar-group-header">People &amp; Org</span>
              
              <NavLink to="/employees" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <Users className="nav-link-icon" />
                  <span>Employees</span>
                </div>
              </NavLink>

              <NavLink to="/issuers" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <ShieldCheck className="nav-link-icon" />
                  <span>Asset Issuers</span>
                </div>
              </NavLink>

              <NavLink to="/departments" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <Building2 className="nav-link-icon" />
                  <span>Departments</span>
                </div>
              </NavLink>
            </div>

            <div className="sidebar-group">
              <span className="sidebar-group-header">Analytics &amp; Compliance</span>
              
              <NavLink to="/reports" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <FileSpreadsheet className="nav-link-icon" />
                  <span>Reports &amp; Export</span>
                </div>
                <span className="nav-badge badge-primary">PDF/CSV</span>
              </NavLink>

              <NavLink to="/audit-logs" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <ClipboardList className="nav-link-icon" />
                  <span>Audit Trail</span>
                </div>
              </NavLink>

              <NavLink to="/verify" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <QrCode className="nav-link-icon" />
                  <span>QR / Barcode Desk</span>
                </div>
                <span className="nav-badge badge-cyan">SCAN</span>
              </NavLink>
            </div>

            <div className="sidebar-group">
              <span className="sidebar-group-header">Stock Monitoring</span>
              
              <NavLink to="/low-stock-alerts" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <AlertTriangle className="nav-link-icon" />
                  <span>Low Stock Alerts</span>
                </div>
                <span className="nav-badge badge-warning">ALERT</span>
              </NavLink>

              <NavLink to="/warranty-alerts" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <CalendarClock className="nav-link-icon" />
                  <span>Warranty Expiry</span>
                </div>
              </NavLink>
            </div>
          </>
        )}

        {/* ================= ASSET ISSUER NAVIGATION ================= */}
        {role === 'ASSET_ISSUER' && (
          <>
            <div className="sidebar-group">
              <span className="sidebar-group-header">Issuer Operations</span>
              
              <NavLink to="/issuer" end className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <LayoutDashboard className="nav-link-icon" />
                  <span>Issuer Dashboard</span>
                </div>
              </NavLink>

              <NavLink to="/issuer/issue-asset" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <Send className="nav-link-icon" />
                  <span>Issue Asset</span>
                </div>
                <span className="nav-badge badge-success">DIRECT</span>
              </NavLink>

              <NavLink to="/issuer/return-asset" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <RotateCcw className="nav-link-icon" />
                  <span>Return Asset</span>
                </div>
              </NavLink>

              <NavLink to="/issuer/pending-requests" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <Clock className="nav-link-icon" />
                  <span>Pending Requests</span>
                </div>
              </NavLink>

              <NavLink to="/issuer/verify" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <QrCode className="nav-link-icon" />
                  <span>QR / Barcode Verify</span>
                </div>
                <span className="nav-badge badge-cyan">SCAN</span>
              </NavLink>

              <NavLink to="/issuer/employee-search" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <UserCheck className="nav-link-icon" />
                  <span>Employee Search</span>
                </div>
              </NavLink>
            </div>

            <div className="sidebar-group">
              <span className="sidebar-group-header">History &amp; Workshop</span>
              
              <NavLink to="/issuer/issue-history" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <FileText className="nav-link-icon" />
                  <span>Issue History</span>
                </div>
              </NavLink>

              <NavLink to="/issuer/return-history" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <History className="nav-link-icon" />
                  <span>Return History</span>
                </div>
              </NavLink>

              <NavLink to="/maintenance" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <Wrench className="nav-link-icon" />
                  <span>Maintenance Desk</span>
                </div>
              </NavLink>

              <NavLink to="/reports" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <div className="nav-link-left">
                  <FileSpreadsheet className="nav-link-icon" />
                  <span>Reports &amp; Export</span>
                </div>
              </NavLink>
            </div>
          </>
        )}

        {/* ================= EMPLOYEE NAVIGATION ================= */}
        {role === 'EMPLOYEE' && (
          <div className="sidebar-group">
            <span className="sidebar-group-header">Employee Self-Service</span>
            
            <NavLink to="/employee" end className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <div className="nav-link-left">
                <LayoutDashboard className="nav-link-icon" />
                <span>My Dashboard</span>
              </div>
            </NavLink>

            <NavLink to="/employee/request-asset" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <div className="nav-link-left">
                <PlusCircle className="nav-link-icon" />
                <span>Request Asset</span>
              </div>
              <span className="nav-badge badge-primary">NEW</span>
            </NavLink>

            <NavLink to="/employee/my-assets" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <div className="nav-link-left">
                <Package className="nav-link-icon" />
                <span>View My Assets</span>
              </div>
            </NavLink>

            <NavLink to="/employee/return-request" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <div className="nav-link-left">
                <CornerUpLeft className="nav-link-icon" />
                <span>Return Request</span>
              </div>
            </NavLink>

            <NavLink to="/employee/complaints" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <div className="nav-link-left">
                <MessageSquareWarning className="nav-link-icon" />
                <span>Issue &amp; Complaints</span>
              </div>
            </NavLink>
          </div>
        )}

        {/* ================= GENERAL & ACCOUNT ================= */}
        <div className="sidebar-group">
          <span className="sidebar-group-header">Account &amp; System</span>
          
          <NavLink to="/profile" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <div className="nav-link-left">
              <UserCog className="nav-link-icon" />
              <span>Profile &amp; Security</span>
            </div>
          </NavLink>

          {role === 'ADMIN' && (
            <NavLink to="/settings" className={({ isActive }) => `enhanced-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <div className="nav-link-left">
                <Settings className="nav-link-icon" />
                <span>System Settings</span>
              </div>
            </NavLink>
          )}
        </div>
      </div>

      {/* User Footer Card & Quick Logout */}
      <div className="sidebar-footer">
        <NavLink to="/profile" className="sidebar-user-card" onClick={onClose}>
          <div className="user-avatar-initials">
            {getInitials(username)}
          </div>
          <div className="user-info-text">
            <span className="user-display-name">{username}</span>
            <span className="user-role-label">
              {role === 'ADMIN' ? '🛡️ Administrator' :
               role === 'ASSET_ISSUER' ? '📦 Asset Issuer' : '👨‍💻 Employee'}
            </span>
          </div>
        </NavLink>

        <button 
          onClick={handleLogout} 
          className="logout-action-btn"
          title="Sign out of your session"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
