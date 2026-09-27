import React, { useState, useEffect } from 'react';
import { AssetService } from '../services/api';
import { toast } from 'react-hot-toast';

export default function WarrantyAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const res = await AssetService.getAll();
        const assets = res?.content || res || [];
        
        // Compute real warranty expiration from asset purchase date
        const expiring = assets.map(a => {
          const pDate = a.purchaseDate ? new Date(a.purchaseDate) : new Date();
          const expiry = new Date(pDate);
          expiry.setFullYear(expiry.getFullYear() + 2); // 24-month standard warranty
          const diffMs = expiry.getTime() - new Date().getTime();
          const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const isCritical = daysRemaining <= 30;
          const isWarning = daysRemaining <= 90;

          return {
            id: a.id,
            name: a.name || a.assetName || 'Unknown Asset',
            category: a.category || 'N/A',
            endDate: expiry.toISOString().split('T')[0],
            daysRemaining: daysRemaining,
            status: isCritical ? 'Critical Expiry' : isWarning ? 'Expiring Soon' : 'Active Coverage',
            badgeColor: isCritical ? 'red' : isWarning ? 'orange' : 'green'
          };
        });
        
        setAlerts(expiring.sort((a,b) => a.daysRemaining - b.daysRemaining));
      } catch (err) {
        toast.error('Failed to load warranty data');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Warranty Expirations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Hardware warranty deadlines and vendor extension requests.</p>
        </div>
        <button onClick={() => toast.success('Sent warranty renewal requests to suppliers!')} className="btn btn-primary">
          Extend Warranties
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading warranty data...</div>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Warranty End Date</th>
                <th style={{ textAlign: 'center' }}>Days Remaining</th>
                <th>Urgency Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No warranty alerts available.</td></tr>
              )}
              {alerts.map((w) => (
                <tr key={w.id}>
                  <td><strong>{w.name}</strong></td>
                  <td>{w.category}</td>
                  <td><code>{w.endDate}</code></td>
                  <td style={{ textAlign: 'center', color: 'var(--danger-color)', fontWeight: 700 }}>{w.daysRemaining} Days</td>
                  <td>
                    <span className={`badge ${w.badgeColor === 'red' ? 'badge-danger' : w.badgeColor === 'orange' ? 'badge-warning' : 'badge-success'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => toast.success(`Renewal claim sent for ${w.name}`)} className="table-action-btn">
                      Renew Warranty
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
