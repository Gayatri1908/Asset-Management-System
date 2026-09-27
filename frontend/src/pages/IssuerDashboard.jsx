import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { IssuerService, AssetService } from '../services/api';
import KpiCard from '../components/cards/KpiCard';
import { ClipboardList, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Box, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function IssuerDashboard() {
  const [stats, setStats] = useState({
    availableAssets: 0,
    pendingRequests: 0,
    assetsIssuedToday: 0,
    pendingReturns: 0,
    returnedToday: 0,
    overdueReturns: 0
  });
  const [requests, setRequests] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const [reqs, rets, assets, issueHist, retHist] = await Promise.all([
        IssuerService.getPendingRequests(),
        IssuerService.getPendingReturns(),
        AssetService.getAll(),
        IssuerService.getIssueHistory(),
        IssuerService.getReturnHistory()
      ]);

      const assetList = assets || [];
      const issueList = issueHist || [];
      const retList = retHist || [];

      const availableCount = assetList.filter(a => (a.status || '').toUpperCase() === 'AVAILABLE').length;
      const issuedTodayCount = issueList.filter(i => i.issueDate === today).length;
      const returnedTodayCount = retList.filter(r => r.returnDate === today).length;
      const overdueCount = issueList.filter(i => (i.status || '').toUpperCase() === 'ISSUED' && i.expectedReturnDate && i.expectedReturnDate < today).length;

      setRequests(reqs || []);
      setReturns(rets || []);
      setStats({
        availableAssets: availableCount,
        pendingRequests: (reqs || []).length,
        assetsIssuedToday: issuedTodayCount,
        pendingReturns: (rets || []).length,
        returnedToday: returnedTodayCount,
        overdueReturns: overdueCount
      });
    } catch (err) {
      toast.error('Failed to load issuer data');
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

  const handleProcessReturn = async (id, status) => {
    try {
      await IssuerService.processReturn(id, { status, remarks: 'Processed by Issuer' });
      toast.success(`Return ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (err) {
      toast.error('Error processing return');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={24} style={{ color: 'var(--primary)' }} /> Issuer Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage pending asset requests and returns.</p>
        </div>
        <button onClick={fetchData} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* 6 Required Issuer KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <KpiCard 
          title="Available Assets" 
          count={stats.availableAssets} 
          change="Ready in stockroom" 
          isPositive={true} 
          icon={<Box size={20} />} 
        />
        <KpiCard 
          title="Pending Issue Requests" 
          count={stats.pendingRequests} 
          change="Awaiting fulfillment" 
          isPositive={true} 
          icon={<Clock size={20} />} 
        />
        <KpiCard 
          title="Assets Issued Today" 
          count={stats.assetsIssuedToday} 
          change="Checked out today" 
          isPositive={true} 
          icon={<ArrowUpRight size={20} />} 
        />
        <KpiCard 
          title="Pending Returns" 
          count={stats.pendingReturns} 
          change="Returns awaiting check-in" 
          isPositive={true} 
          icon={<ArrowDownLeft size={20} />} 
        />
        <KpiCard 
          title="Returned Today" 
          count={stats.returnedToday} 
          change="Received & inspected today" 
          isPositive={true} 
          icon={<CheckCircle size={20} />} 
        />
        <KpiCard 
          title="Overdue Returns" 
          count={stats.overdueReturns} 
          change="Past expected return date" 
          isPositive={false} 
          icon={<AlertCircle size={20} />} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} style={{ color: 'var(--primary)' }} /> Pending Asset Requests
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Clock size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No pending requests.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="simple-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>
                        <div>{r.asset?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>REQ-{r.id}</div>
                      </td>
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

        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} style={{ color: 'var(--warning-color)' }} /> Pending Asset Returns
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
          ) : returns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No pending returns.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="simple-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Employee</th>
                    <th>Condition</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>
                        <div>{r.issue?.asset?.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RET-{r.id}</div>
                      </td>
                      <td>
                        <div>{r.issue?.employee?.user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.remarks || 'No remarks'}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${r.returnCondition === 'Good' ? 'success' : r.returnCondition === 'Damaged' ? 'warning' : 'danger'}`}>
                          {r.returnCondition}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn-primary btn-sm" 
                            style={{ backgroundColor: 'var(--success-color)', border: 'none', color: '#fff' }}
                            onClick={() => handleProcessReturn(r.id, 'APPROVED')}
                          >
                            <CheckCircle size={14} /> Confirm
                          </button>
                          <button 
                            className="btn-danger btn-sm" 
                            onClick={() => handleProcessReturn(r.id, 'REJECTED')}
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
    </div>
  );
}
