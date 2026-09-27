import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserService } from '../services/api';
import Modal from '../components/common/Modal';
import { ShieldCheck, Plus, Search, UserCheck, Activity, Phone, Mail } from 'lucide-react';

export default function Issuers() {
  const [issuers, setIssuers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    password: 'Admin@123'
  });

  const fetchIssuers = async () => {
    try {
      setLoading(true);
      const res = await UserService.getUsers({ role: 'ROLE_ASSET_ISSUER' });
      const data = res?.data || res || [];
      setIssuers(data);
    } catch (err) {
      toast.error('Failed to load asset issuers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuers();
  }, []);

  const handleCreateIssuer = async (e) => {
    e.preventDefault();
    try {
      await UserService.createIssuer(form);
      toast.success(`Asset Issuer "${form.username}" created!`);
      setIsAddModalOpen(false);
      setForm({ username: '', name: '', email: '', phone: '', password: 'Admin@123' });
      fetchIssuers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create asset issuer');
    }
  };

  const handleToggleStatus = async (issuer) => {
    try {
      await UserService.toggleStatus(issuer.id);
      toast.success(`Issuer status updated!`);
      fetchIssuers();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const filteredIssuers = issuers.filter((u) => {
    const text = `${u.name || ''} ${u.username || ''} ${u.email || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck style={{ color: 'var(--primary-color)' }} /> Asset Issuer Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Control personnel authorized to physically issue, verify, inspect, and receive inventory assets.
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
          + Add New Issuer
        </button>
      </div>

      {/* Toolbar */}
      <div className="table-toolbar">
        <input
          type="text"
          placeholder="Search issuers by username or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          style={{ maxWidth: '350px' }}
        />
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Active Issuers: <strong>{issuers.filter(i => i.isActive !== false).length}</strong>
        </span>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading asset issuers...</div>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Issuer Officer</th>
                <th>Username</th>
                <th>Contact</th>
                <th>Activity (Issues Processed)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssuers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No asset issuers found.</td>
                </tr>
              ) : (
                filteredIssuers.map((issuer) => (
                  <tr key={issuer.id}>
                    <td><code>ISS-{String(issuer.id).padStart(3, '0')}</code></td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{issuer.name || issuer.username}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Authorized Officer</div>
                    </td>
                    <td><code>@{issuer.username}</code></td>
                    <td>
                      <div style={{ fontSize: '12px' }}>{issuer.email}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{issuer.phone || 'N/A'}</div>
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Activity size={12} /> {issuer.activityCount || 1} Actions
                      </span>
                    </td>
                    <td>
                      <span className={issuer.isActive !== false ? 'badge badge-success' : 'badge badge-danger'}>
                        {issuer.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(issuer)}
                        className={`btn btn-sm ${issuer.isActive !== false ? 'btn-danger' : 'btn-success'}`}
                      >
                        {issuer.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Asset Issuer">
        <form onSubmit={handleCreateIssuer}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="form-control"
                placeholder="e.g. issuer2"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="form-control"
                placeholder="e.g. Robert Vance"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Temporary Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="form-control"
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Default: Admin@123</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.2rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Issuer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
