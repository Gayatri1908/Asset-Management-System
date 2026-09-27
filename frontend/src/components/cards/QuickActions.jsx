import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions({ onOpenAddAsset, onOpenAddCategory, onOpenAddVendor }) {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ marginBottom: '1.8rem' }}>
      <div className="card-title" style={{ marginBottom: '0.8rem' }}>Quick Actions</div>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button onClick={onOpenAddAsset} className="btn btn-primary btn-sm">+ Add New Asset</button>
        <button onClick={onOpenAddCategory} className="btn btn-secondary btn-sm">+ Add Category</button>
        <button onClick={onOpenAddVendor} className="btn btn-secondary btn-sm">+ Add Vendor</button>
        <button onClick={() => navigate('/inventory')} className="btn btn-secondary btn-sm">View Inventory</button>
      </div>
    </div>
  );
}
