import React, { useState, useEffect } from 'react';
import { AssetService } from '../services/api';
import { toast } from 'react-hot-toast';

export default function LowStockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const res = await AssetService.getAll();
        const assets = res?.content || res || [];
        
        // Compute low stock (assuming threshold is 5 for all items for now)
        const lowStock = assets.filter(a => (a.quantity || 1) < 5).map(a => {
          const qty = a.quantity || 1;
          return {
            id: a.id,
            item: a.name || 'Unknown Asset',
            threshold: 5,
            count: qty,
            urgency: qty <= 2 ? 'Critical' : 'Warning'
          };
        });
        
        setAlerts(lowStock);
      } catch (err) {
        toast.error('Failed to load low stock data');
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
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Low Stock Inventory Alerts</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Items requiring immediate replenishment or purchase order creation.</p>
        </div>
        <button onClick={() => toast.success('Reorder requests generated!')} className="btn btn-primary">
          Reorder All Critical Stock
        </button>
      </div>

      <div className="grid-charts">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading low stock alerts...</div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No low stock alerts. Stock is healthy!</div>
        ) : (
          alerts.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className={`badge ${item.urgency === 'Critical' ? 'badge-danger' : 'badge-warning'}`} style={{ marginBottom: '0.4rem' }}>
                  {item.urgency} Threshold
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>{item.item}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Threshold: {item.threshold} units</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger-color)', display: 'block' }}>{item.count} Left</span>
                <button onClick={() => toast.success(`PO created for ${item.item}`)} className="btn btn-secondary btn-sm" style={{ marginTop: '0.4rem' }}>
                  Create PO
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
