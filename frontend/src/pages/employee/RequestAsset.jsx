import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { EmployeePortalService } from '../../services/api';
import { Send, Package } from 'lucide-react';

export default function RequestAsset() {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await EmployeePortalService.getAvailableAssets();
        setAssets(res || []);
      } catch (err) {
        toast.error('Failed to load available assets');
      }
    };
    fetchAssets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await EmployeePortalService.requestAsset({ assetId: parseInt(selectedAsset), remarks });
      toast.success('Asset request submitted successfully');
      setSelectedAsset('');
      setRemarks('');
    } catch (err) {
      toast.error('Failed to submit asset request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Send size={24} style={{ color: 'var(--primary)' }} /> Request New Asset
      </h1>
      <div className="card" style={{ padding: '2rem', borderRadius: '12px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Select Asset</label>
            <select className="form-control" value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)} required>
              <option value="">Choose an available asset...</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.assetCode})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Reason for Request</label>
            <textarea 
              className="form-control" 
              value={remarks} 
              onChange={e => setRemarks(e.target.value)} 
              rows={4} 
              required 
              placeholder="Why do you need this asset?"
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={18} /> {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
