import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { EmployeePortalService } from '../../services/api';
import { CheckCircle } from 'lucide-react';

export default function ReturnRequest() {
  const [loading, setLoading] = useState(false);
  const [myAssets, setMyAssets] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [returnCondition, setReturnCondition] = useState('Good');
  const [remarks, setRemarks] = useState('');

  const fetchAssets = async () => {
    try {
      const res = await EmployeePortalService.getMyAssets();
      setMyAssets(res?.filter(i => i.issueStatus === 'ISSUED') || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await EmployeePortalService.returnAsset({ 
        issueId: parseInt(selectedIssue), 
        returnCondition, 
        remarks 
      });
      toast.success('Return request submitted successfully');
      setSelectedIssue('');
      setRemarks('');
      fetchAssets();
    } catch (err) {
      toast.error('Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem' }}>Initiate Return Request</h1>
      <div className="card" style={{ padding: '2rem', borderRadius: '12px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Select Assigned Asset</label>
            <select className="form-control" value={selectedIssue} onChange={e => setSelectedIssue(e.target.value)} required>
              <option value="">Choose an asset to return...</option>
              {myAssets.map(issue => (
                <option key={issue.id} value={issue.id}>{issue.asset?.name} (Issue ID: {issue.id})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Return Condition</label>
            <select className="form-control" value={returnCondition} onChange={e => setReturnCondition(e.target.value)} required>
              <option value="Good">Good / Working</option>
              <option value="Damaged">Damaged / Needs Repair</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Additional Remarks</label>
            <textarea 
              className="form-control" 
              value={remarks} 
              onChange={e => setRemarks(e.target.value)} 
              rows={3} 
              placeholder="Any details about the return..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} /> {loading ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
