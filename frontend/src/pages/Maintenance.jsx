import React, { useState, useEffect } from 'react';
import { MaintenanceService, AssetService } from '../services/api';
import Modal from '../components/common/Modal';
import { toast } from 'react-hot-toast';
import { Wrench, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Plus, Search, RefreshCw, DollarSign, Calendar } from 'lucide-react';

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [form, setForm] = useState({
    asset: { id: 1 },
    description: '',
    cost: 3500,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'IN_PROGRESS'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintRes, assetRes] = await Promise.all([
        MaintenanceService.getAll(),
        AssetService.getAll()
      ]);

      const logList = Array.isArray(maintRes) ? maintRes : (maintRes?.content || maintRes?.data || []);
      const assetList = Array.isArray(assetRes) ? assetRes : (assetRes?.content || assetRes?.data || []);

      setLogs(logList || []);
      setAssets(assetList || []);

      if (assetList && assetList.length > 0) {
        setForm(f => ({ ...f, asset: { id: assetList[0].id } }));
      }
    } catch (err) {
      console.error("Maintenance fetch error:", err);
      toast.error('Failed to fetch maintenance logs');
      setLogs([]);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await MaintenanceService.create(form);
      toast.success(`Maintenance ticket created for Asset #${form.asset.id}!`);
      fetchData();
      setIsModalOpen(false);
      setForm({
        asset: { id: assets[0]?.id || 1 },
        description: '',
        cost: 3500,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'IN_PROGRESS'
      });
    } catch (err) {
      toast.error('Failed to create maintenance ticket');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await MaintenanceService.updateStatus(id, newStatus);
      if (newStatus === 'COMPLETED') {
        toast.success(`Ticket marked COMPLETED! Associated asset restored to AVAILABLE status.`, { duration: 4000 });
      } else {
        toast.success(`Maintenance ticket status updated to ${newStatus}`);
      }
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const logArray = Array.isArray(logs) ? logs : [];
  const assetArray = Array.isArray(assets) ? assets : [];

  const filteredLogs = logArray.filter(log => {
    if (!log) return false;
    const q = searchTerm.toLowerCase();
    const assetName = (log.asset?.name || log.asset?.assetName || '').toLowerCase();
    const assetCode = (log.asset?.assetCode || '').toLowerCase();
    const desc = (log.description || '').toLowerCase();
    const matchesSearch = !searchTerm || assetName.includes(q) || assetCode.includes(q) || desc.includes(q);
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'badge-success';
      case 'IN_PROGRESS':
        return 'badge-primary';
      case 'SCHEDULED':
        return 'badge-warning';
      case 'CANCELLED':
        return 'badge-danger';
      default:
        return 'badge-default';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '8px', color: '#f59e0b' }}>
              <Wrench size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Maintenance &amp; Repair Desk</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '0.2rem' }}>
                Diagnostic tickets, repair scheduling, servicing expenses, and automated inventory restoration.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchData}
            className="btn-icon"
            title="Refresh logs"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={15} /> Open Maintenance Ticket
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '500px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by asset name, code, or description..."
              className="search-input"
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontSize: '12px',
              outline: 'none'
            }}
          >
            <option value="ALL">All Statuses ({logArray.length})</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Maintenance Records Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading maintenance records...
            </div>
          ) : (
            <table className="simple-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Asset Details</th>
                  <th>Reported Problem</th>
                  <th>Repair Cost</th>
                  <th>Lifecycle Status</th>
                  <th style={{ textAlign: 'right' }}>Log Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No maintenance records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', fontSize: '12px' }}>
                          MNT-0{log.id}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {log.asset?.name || log.asset?.assetName || `Asset #${log.asset?.id || log.id}`}
                        </div>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {log.asset?.assetCode || `AST-00${log.asset?.id}`} • {log.asset?.category || 'Hardware'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: 'var(--text-main)', maxWidth: '280px', lineHeight: 1.4 }}>
                          {log.description || 'Routine diagnostic and preventive servicing'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          ₹{Number(log.cost ?? 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <select
                          value={log.status}
                          onChange={(e) => handleUpdateStatus(log.id, e.target.value)}
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            outline: 'none',
                            backgroundColor: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed (Restore to Available)</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                          {log.startDate ? new Date(log.startDate).toLocaleDateString() : '—'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Maintenance Ticket Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Open Hardware Maintenance Ticket">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '13px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Target Asset</label>
            <select
              value={form.asset.id}
              onChange={(e) => setForm({ ...form, asset: { id: parseInt(e.target.value) } })}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            >
              {assetArray.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetCode || `AST-${a.id}`} - {a.name || a.assetName || 'Asset'} ({a.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Problem / Issue Description</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Display hinge cracked, battery health below threshold, or cooling fan failure detected."
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Estimated Cost (₹ INR)</label>
              <input
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Diagnostic Start Date</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-icon"
              style={{ padding: '0.6rem 1.2rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '0.6rem 1.4rem' }}
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
