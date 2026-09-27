import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { EmployeePortalService } from '../../services/api';
import { Package } from 'lucide-react';

export default function ViewMyAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const res = await EmployeePortalService.getMyAssets();
        setAssets(res || []);
      } catch (err) {
        toast.error('Failed to load your assets');
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Package size={24} style={{ color: 'var(--primary)' }} /> My Assigned Assets
      </h1>
      
      <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : assets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <Package size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>You have no assigned assets.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="simple-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Asset ID</th>
                  <th>Category</th>
                  <th>Issued Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(issue => (
                  <tr key={issue.id}>
                    <td style={{ fontWeight: 600 }}>{issue.asset?.name || issue.asset?.assetName}</td>
                    <td><code>{issue.asset?.assetCode || `AST-${issue.asset?.id}`}</code></td>
                    <td><span className="badge badge-secondary">{issue.asset?.category}</span></td>
                    <td style={{ fontSize: '13px' }}>{issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: '13px' }}>{issue.expectedReturnDate ? new Date(issue.expectedReturnDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge badge-${issue.issueStatus === 'ISSUED' ? 'success' : 'secondary'}`}>
                        {issue.issueStatus || 'Issued'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
