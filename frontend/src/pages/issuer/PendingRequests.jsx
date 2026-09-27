import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { IssuerService } from '../../services/api';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reqs = await IssuerService.getPendingRequests();
      setRequests(reqs || []);
    } catch (err) {
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessRequest = async (id, status) => {
    try {
      await IssuerService.processRequest(id, { status, remarks: 'Processed by Issuer' });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (err) {
      toast.error('Error processing request');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Clock size={24} style={{ color: 'var(--primary)' }} /> Pending Requests
      </h1>
      
      <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <p>No pending requests.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="simple-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Asset</th>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td>REQ-{r.id}</td>
                    <td style={{ fontWeight: 500 }}>{r.asset?.name}</td>
                    <td>
                      <div>{r.employee?.user?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.remarks || 'No remarks'}</div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-primary btn-sm" 
                          style={{ backgroundColor: 'var(--success-color)', border: 'none', color: '#fff' }}
                          onClick={() => handleProcessRequest(r.id, 'APPROVED')}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button 
                          className="btn-danger btn-sm" 
                          onClick={() => handleProcessRequest(r.id, 'REJECTED')}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
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
