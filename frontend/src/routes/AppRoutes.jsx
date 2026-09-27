import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';

import AdminDashboard from '../pages/AdminDashboard';
import IssuerDashboard from '../pages/IssuerDashboard';
import EmployeeDashboard from '../pages/EmployeeDashboard';

import Assets from '../pages/Assets';
import AssetDetails from '../pages/AssetDetails';
import Inventory from '../pages/Inventory';
import Categories from '../pages/Categories';
import Vendors from '../pages/Vendors';
import LowStockAlerts from '../pages/LowStockAlerts';
import WarrantyAlerts from '../pages/WarrantyAlerts';
import Maintenance from '../pages/Maintenance';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';

// New Issuer Pages
import IssueAsset from '../pages/issuer/IssueAsset';
import ReturnAsset from '../pages/issuer/ReturnAsset';
import PendingRequests from '../pages/issuer/PendingRequests';
import EmployeeSearch from '../pages/issuer/EmployeeSearch';
import IssueHistory from '../pages/issuer/IssueHistory';
import ReturnHistory from '../pages/issuer/ReturnHistory';
import AssetVerification from '../pages/issuer/AssetVerification';

// New Employee Pages
import RequestAsset from '../pages/employee/RequestAsset';
import ViewMyAssets from '../pages/employee/ViewMyAssets';
import ReturnRequest from '../pages/employee/ReturnRequest';
import Complaint from '../pages/employee/Complaint';

// Admin & Enterprise Management Pages
import Employees from '../pages/Employees';
import Issuers from '../pages/Issuers';
import Departments from '../pages/Departments';
import Reports from '../pages/Reports';
import AuditLogs from '../pages/AuditLogs';

function ProtectedRoute({ children }) {
  const session = JSON.parse(sessionStorage.getItem('session') || 'null');
  if (!session || !session.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleRoute({ children, allowedRoles }) {
  const session = JSON.parse(sessionStorage.getItem('session') || 'null');
  if (!session || !session.token) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(session.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const session = JSON.parse(sessionStorage.getItem('session') || 'null');
  if (session && session.token) {
    if (session.role === 'ROLE_ADMIN' || session.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (session.role === 'ROLE_ASSET_ISSUER' || session.role === 'ASSET_ISSUER') return <Navigate to="/issuer" replace />;
    if (session.role === 'ROLE_EMPLOYEE' || session.role === 'EMPLOYEE') return <Navigate to="/employee" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={
          <PublicRoute>
            <Navigate to="/login" replace />
          </PublicRoute>
        } />

        {/* ADMIN ROUTES */}
        <Route path="admin" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}><AdminDashboard /></RoleRoute>} />
        
        {/* ISSUER ROUTES */}
        <Route path="issuer">
          <Route index element={<RoleRoute allowedRoles={['ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><IssuerDashboard /></RoleRoute>} />
          <Route path="issue-asset" element={<RoleRoute allowedRoles={['ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><IssueAsset /></RoleRoute>} />
          <Route path="return-asset" element={<RoleRoute allowedRoles={['ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><ReturnAsset /></RoleRoute>} />
          <Route path="pending-requests" element={<RoleRoute allowedRoles={['ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><PendingRequests /></RoleRoute>} />
          <Route path="employee-search" element={<RoleRoute allowedRoles={['ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><EmployeeSearch /></RoleRoute>} />
          <Route path="issue-history" element={<RoleRoute allowedRoles={['ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><IssueHistory /></RoleRoute>} />
          <Route path="return-history" element={<RoleRoute allowedRoles={['ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><ReturnHistory /></RoleRoute>} />
          <Route path="verify" element={<RoleRoute allowedRoles={['ASSET_ISSUER', 'ROLE_ASSET_ISSUER', 'ADMIN', 'ROLE_ADMIN']}><AssetVerification /></RoleRoute>} />
        </Route>
        
        {/* EMPLOYEE ROUTES */}
        <Route path="employee">
          <Route index element={<RoleRoute allowedRoles={['EMPLOYEE', 'ROLE_EMPLOYEE']}><EmployeeDashboard /></RoleRoute>} />
          <Route path="request-asset" element={<RoleRoute allowedRoles={['EMPLOYEE', 'ROLE_EMPLOYEE']}><RequestAsset /></RoleRoute>} />
          <Route path="my-assets" element={<RoleRoute allowedRoles={['EMPLOYEE', 'ROLE_EMPLOYEE']}><ViewMyAssets /></RoleRoute>} />
          <Route path="return-request" element={<RoleRoute allowedRoles={['EMPLOYEE', 'ROLE_EMPLOYEE']}><ReturnRequest /></RoleRoute>} />
          <Route path="complaints" element={<RoleRoute allowedRoles={['EMPLOYEE', 'ROLE_EMPLOYEE']}><Complaint /></RoleRoute>} />
        </Route>

        {/* SHARED/OTHER ROUTES */}
        <Route path="assets" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN', 'ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><Assets /></RoleRoute>} />
        <Route path="assets/:id" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN', 'ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><AssetDetails /></RoleRoute>} />
        <Route path="inventory" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN', 'ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><Inventory /></RoleRoute>} />
        <Route path="categories" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}><Categories /></RoleRoute>} />
        <Route path="vendors" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}><Vendors /></RoleRoute>} />
        <Route path="low-stock-alerts" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN', 'ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><LowStockAlerts /></RoleRoute>} />
        <Route path="warranty-alerts" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN', 'ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><WarrantyAlerts /></RoleRoute>} />
        <Route path="maintenance" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN', 'ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><Maintenance /></RoleRoute>} />
        
        {/* ADMIN & ENTERPRISE ROUTES */}
        <Route path="employees" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}><Employees /></RoleRoute>} />
        <Route path="issuers" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}><Issuers /></RoleRoute>} />
        <Route path="departments" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}><Departments /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN', 'ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><Reports /></RoleRoute>} />
        <Route path="audit-logs" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}><AuditLogs /></RoleRoute>} />
        <Route path="verify" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN', 'ASSET_ISSUER', 'ROLE_ASSET_ISSUER']}><AssetVerification /></RoleRoute>} />
        
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<RoleRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}><Settings /></RoleRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
