import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { EmployeePortalService } from '../services/api';
import KpiCard from '../components/cards/KpiCard';
import Modal from '../components/common/Modal';
import { Package, RefreshCw, Send, CheckCircle, Clock, Search, AlertCircle } from 'lucide-react';

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    myAssets: 0,
    myRequests: 0,
    activeComplaints: 0,
    pendingReturns: 0
  });
  const [availableAssets, setAvailableAssets] = useState([]);
  const [myAssets, setMyAssets] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [returnCondition, setReturnCondition] = useState('Good');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [avail, issued, reqs, dashStats] = await Promise.all([
        EmployeePortalService.getAvailableAssets(),
        EmployeePortalService.getMyAssets(),
        EmployeePortalService.getMyRequests(),
        EmployeePortalService.getDashboardStats()
      ]);
      setAvailableAssets(avail || []);
      setMyAssets(issued || []);
      setMyRequests(reqs || []);
      setStats(dashStats || { myAssets: 0, myRequests: 0, activeComplaints: 0, pendingReturns: 0 });
    } catch (err) {
      toast.error('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestAsset = async (e) => {
    e.preventDefault();
    try {
      await EmployeePortalService.requestAsset({ assetId: selectedAssetId, remarks });
      toast.success('Asset requested successfully');
      setIsRequestOpen(false);
      setRemarks('');
      fetchData();
    } catch (err) {
      toast.error('Error requesting asset');
    }
  };

  const handleReturnAsset = async (e) => {
    e.preventDefault();
    try {
      await EmployeePortalService.returnAsset({ issueId: selectedIssueId, returnCondition, remarks });
      toast.success('Asset return requested successfully');
      setIsReturnOpen(false);
      setRemarks('');
      setReturnCondition('Good');
      fetchData();
    } catch (err) {
      toast.error('Error returning asset');
    }
  };

  const openRequestModal = (assetId) => {
    setSelectedAssetId(assetId);
    setRemarks('');
    setIsRequestOpen(true);
  };

  const openReturnModal = (issueId) => {
    setSelectedIssueId(issueId);
    setRemarks('');
    setReturnCondition('Good');
    setIsReturnOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={24} style={{ color: 'var(--primary)' }} /> My Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>View your assets, submit requests, and file returns.</p>
        </div>
        <button onClick={fetchData} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* 5 Employee KPIs specified in requirements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <KpiCard 
          title="My Total Assets" 
          count={myAssets.length} 
          change="Lifetime assignments" 
          isPositive={true} 
          icon={<Package size={20} />} 
        />
        <KpiCard 
          title="Currently Issued" 
          count={myAssets.filter(i => (i.issueStatus || '').toUpperCase() === 'ISSUED').length} 
          change="In your active custody" 
          isPositive={true} 
          icon={<CheckCircle size={20} />} 
        />
        <KpiCard 
          title="Due for Return" 
          count={myAssets.filter(i => (i.issueStatus || '').toUpperCase() === 'ISSUED' && i.expectedReturnDate).length} 
          change="Scheduled for return" 
          isPositive={true} 
          icon={<Clock size={20} />} 
        />
        <KpiCard 
          title="Overdue" 
          count={myAssets.filter(i => (i.issueStatus || '').toUpperCase() === 'ISSUED' && i.expectedReturnDate && new Date(i.expectedReturnDate) < new Date()).length} 
          change="Past return deadline" 
          isPositive={false} 
          icon={<AlertCircle size={20} />} 
        />
        <KpiCard 
          title="Pending Requests" 
          count={myRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length} 
          change="Awaiting admin approval" 
          isPositive={true} 
          icon={<Send size={20} />} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} style={{ color: 'var(--success-color)' }} /> My Assets
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
          ) : myAssets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Package size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>You have no assets currently assigned.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="simple-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Asset ID</th>
                    <th>Issued Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myAssets.map(issue => (
                    <tr key={issue.id}>
                      <td style={{ fontWeight: 600 }}>{issue.asset?.name || issue.asset?.assetName}</td>
                      <td><code>{issue.asset?.assetCode || `AST-00${issue.asset?.id}`}</code></td>
                      <td>{issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : '—'}</td>
                      <td>{issue.expectedReturnDate ? new Date(issue.expectedReturnDate).toLocaleDateString() : '—'}</td>
                      <td>
                        <span className={`badge badge-${issue.issueStatus === 'ISSUED' ? 'success' : 'secondary'}`}>
                          {issue.issueStatus}
                        </span>
                      </td>
                      <td>
                        {issue.issueStatus === 'ISSUED' && (
                          <button 
                            className="btn-secondary btn-sm" 
                            onClick={() => openReturnModal(issue.id)}
                          >
                            Return
                          </button>
                        )}
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
            <Search size={18} style={{ color: 'var(--primary)' }} /> Available Catalog
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
          ) : availableAssets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <Search size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No assets are currently available in the catalog.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="simple-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availableAssets.map(asset => (
                    <tr key={asset.id}>
                      <td style={{ fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} />
                          </div>
                          <div>
                            <div>{asset.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{asset.assetCode}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary" style={{ fontSize: '11px' }}>{asset.category}</span>
                      </td>
                      <td>
                        <button 
                          className="btn-primary btn-sm" 
                          onClick={() => openRequestModal(asset.id)}
                        >
                          <Send size={12} /> Request
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      <Modal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} title="Request Asset">
        <form onSubmit={handleRequestAsset}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="am-label" style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Reason for Request</label>
            <textarea 
              className="form-control" 
              value={remarks} 
              onChange={e => setRemarks(e.target.value)} 
              required 
              rows={4}
              placeholder="Please explain why you need this asset..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary btn-sm" onClick={() => setIsRequestOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm">
              <Send size={16} /> Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Modal */}
      <Modal isOpen={isReturnOpen} onClose={() => setIsReturnOpen(false)} title="Return Asset">
        <form onSubmit={handleReturnAsset}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="am-label" style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Return Condition</label>
            <select 
              className="form-control" 
              value={returnCondition} 
              onChange={e => setReturnCondition(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="Good">🟢 Good / Working</option>
              <option value="Damaged">🟠 Damaged / Needs Repair</option>
              <option value="Lost">🔴 Lost</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="am-label" style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Additional Remarks</label>
            <textarea 
              className="form-control" 
              value={remarks} 
              onChange={e => setRemarks(e.target.value)} 
              rows={3}
              placeholder="Any details about the return..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary btn-sm" onClick={() => setIsReturnOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm">
              <CheckCircle size={16} /> Confirm Return
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
