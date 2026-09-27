import React, { useState, useEffect } from 'react';
import { AssetService } from '../services/api';
import { toast } from 'react-hot-toast';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const res = await AssetService.getAll();
        const assets = res?.content || res || [];
        
        // Compute inventory matrix by category
        const matrix = {};
        assets.forEach(asset => {
          const cat = asset.category || 'Uncategorized';
          if (!matrix[cat]) {
            matrix[cat] = { name: cat, total: 0, available: 0, issued: 0, reserved: 0, damaged: 0, maintenance: 0 };
          }
          matrix[cat].total += (asset.quantity || 1);
          
          const status = (asset.status || 'AVAILABLE').toUpperCase();
          if (status === 'AVAILABLE') matrix[cat].available += (asset.quantity || 1);
          else if (status === 'ISSUED') matrix[cat].issued += (asset.quantity || 1);
          else if (status === 'RESERVED') matrix[cat].reserved += (asset.quantity || 1);
          else if (status === 'DAMAGED') matrix[cat].damaged += (asset.quantity || 1);
          else if (status === 'MAINTENANCE') matrix[cat].maintenance += (asset.quantity || 1);
          else matrix[cat].available += (asset.quantity || 1); // default fallback
        });
        
        setInventory(Object.values(matrix));
      } catch (err) {
        toast.error('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Inventory Status Matrix</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Real-time stock breakdown across hardware categories.</p>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading inventory...</div>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>Asset Category</th>
                <th style={{ textAlign: 'center' }}>Total Quantity</th>
                <th style={{ textAlign: 'center' }}>Available</th>
                <th style={{ textAlign: 'center' }}>Issued</th>
                <th style={{ textAlign: 'center' }}>Reserved</th>
                <th style={{ textAlign: 'center' }}>Damaged</th>
                <th style={{ textAlign: 'center' }}>Maintenance</th>
                <th style={{ textAlign: 'right' }}>Stock Availability</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No inventory data available.</td></tr>
              )}
              {inventory.map((row, idx) => {
                const availPercent = row.total === 0 ? 0 : Math.round((row.available / row.total) * 100);
                return (
                  <tr key={idx}>
                    <td><strong>{row.name}</strong></td>
                    <td style={{ textAlign: 'center' }}><strong>{row.total}</strong></td>
                    <td style={{ textAlign: 'center', color: 'var(--success-color)', fontWeight: 700 }}>{row.available}</td>
                    <td style={{ textAlign: 'center' }}>{row.issued}</td>
                    <td style={{ textAlign: 'center' }}>{row.reserved}</td>
                    <td style={{ textAlign: 'center', color: 'var(--danger-color)' }}>{row.damaged}</td>
                    <td style={{ textAlign: 'center', color: 'var(--warning-color)' }}>{row.maintenance}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${availPercent < 20 ? 'badge-danger' : 'badge-success'}`}>
                        {availPercent}% Available
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
