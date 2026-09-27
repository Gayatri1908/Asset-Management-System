import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { EmployeePortalService } from '../../services/api';


export default function Complaint() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [assetId, setAssetId] = useState('');
  const [issueType, setIssueType] = useState('Hardware');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Low');

  const [availableAssets, setAvailableAssets] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [comps, assets] = await Promise.all([
        EmployeePortalService.getMyComplaints(),
        EmployeePortalService.getMyAssets()
      ]);
      setComplaints(comps || []);
      setAvailableAssets(assets?.map(a => a.asset) || []);
    } catch (err) {
      toast.error('Failed to load complaints data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await EmployeePortalService.fileComplaint({
        assetId: parseInt(assetId),
        issueType,
        description,
        urgency
      });
      toast.success('Complaint submitted successfully');
      setAssetId('');
      setDescription('');
      fetchData();
    } catch (err) {
      toast.error('Error submitting complaint');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem' }}>Complaints</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem' }}>File a New Complaint</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Asset</label>
              <select className="form-control" value={assetId} onChange={(e) => setAssetId(e.target.value)} required>
                <option value="">Select an Asset...</option>
                {availableAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.name} ({asset.assetCode})</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Issue Type</label>
              <select className="form-control" value={issueType} onChange={(e) => setIssueType(e.target.value)}>
                <option value="Hardware">Hardware Issue</option>
                <option value="Software">Software Issue</option>
                <option value="Network">Network Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Urgency</label>
              <select className="form-control" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Description</label>
              <textarea 
                className="form-control" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={4} 
                required 
                placeholder="Describe the issue in detail..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}>
              Submit Complaint
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem' }}>My Complaints History</h3>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : complaints.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You have no past complaints.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {complaints.map(c => (
                <div key={c.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-main)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-main)' }}>{c.asset?.name || 'Unknown Asset'}</strong>
                    <span className={`badge badge-${c.status === 'Resolved' ? 'success' : c.status === 'In Progress' ? 'warning' : 'danger'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Type: {c.issueType} | Urgency: {c.urgency} | Date: {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-main)' }}>{c.description}</p>
                  {c.resolutionRemarks && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '3px solid var(--success-color)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <strong>Resolution:</strong> {c.resolutionRemarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
