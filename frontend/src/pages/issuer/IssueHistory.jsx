import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { IssuerService } from '../../services/api';
import { ClipboardList } from 'lucide-react';

export default function IssueHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await IssuerService.getIssueHistory();
        setHistory(res || []);
      } catch (err) {
        toast.error('Failed to load issue history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ClipboardList size={24} style={{ color: 'var(--primary)' }} /> Issue History
      </h1>
      
      <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <p>No issue history found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="simple-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Asset</th>
                  <th>Employee</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td><code>ISS-{h.id}</code></td>
                    <td style={{ fontWeight: 600 }}>
                      <div>{h.assetName || h.asset?.name || h.asset?.assetName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.assetCode || h.asset?.assetCode}</div>
                    </td>
                    <td>{h.employeeName || h.employee?.user?.name || h.employee?.email}</td>
                    <td style={{ fontSize: '13px' }}>{h.issueDate ? new Date(h.issueDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge badge-${(h.status || h.issueStatus) === 'ISSUED' ? 'success' : 'secondary'}`}>
                        {h.status || h.issueStatus || 'ISSUED'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{h.remarks || 'Standard Assignment'}</td>
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
