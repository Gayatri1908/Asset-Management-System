import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { IssuerService } from '../../services/api';
import { ClipboardList } from 'lucide-react';

export default function ReturnHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await IssuerService.getReturnHistory();
        setHistory(res || []);
      } catch (err) {
        toast.error('Failed to load return history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ClipboardList size={24} style={{ color: 'var(--primary)' }} /> Return History
      </h1>
      
      <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <p>No return history found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="simple-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Asset</th>
                  <th>Employee</th>
                  <th>Return Date</th>
                  <th>Condition</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => {
                  const cond = (h.conditionAfterReturn || h.returnCondition || 'GOOD').toUpperCase();
                  const condClass = cond === 'GOOD' ? 'success' : cond.includes('DAMAGED') ? 'danger' : 'warning';
                  return (
                    <tr key={h.id}>
                      <td><code>RET-{h.id}</code></td>
                      <td style={{ fontWeight: 600 }}>
                        <div>{h.assetName || h.issue?.asset?.name || h.issue?.asset?.assetName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.assetCode || h.issue?.asset?.assetCode}</div>
                      </td>
                      <td>{h.employeeName || h.issue?.employee?.user?.name || h.issue?.employee?.email}</td>
                      <td style={{ fontSize: '13px' }}>{h.returnDate ? new Date(h.returnDate).toLocaleDateString() : (h.createdAt ? new Date(h.createdAt).toLocaleDateString() : '—')}</td>
                      <td>
                        <span className={`badge badge-${condClass}`}>
                          {h.conditionAfterReturn || h.returnCondition || 'GOOD'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{h.damageRemarks || h.remarks || 'None'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
