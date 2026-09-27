import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ActivityLogService } from '../services/api';
import { History, Search, Filter, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await ActivityLogService.getAll();
      const data = res?.data || res || [];
      // Sort newest first
      data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setLogs(data);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const text = `${log.action || ''} ${log.details || ''} ${log.user?.username || ''} ${log.user?.name || ''}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchAction = actionFilter === 'ALL' || (log.action && log.action.toUpperCase().includes(actionFilter));
    return matchSearch && matchAction;
  });

  const getActionBadge = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('ISSUE')) return 'badge badge-info';
    if (act.includes('RETURN')) return 'badge badge-success';
    if (act.includes('MAINTENANCE')) return 'badge badge-warning';
    if (act.includes('DELETE') || act.includes('DAMAGE')) return 'badge badge-danger';
    return 'badge badge-primary';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History style={{ color: 'var(--primary-color)' }} /> Enterprise Audit Trail & History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Tamper-evident chronological activity log tracking all asset transactions, approvals, and physical inspections.
          </p>
        </div>
        <button onClick={fetchLogs} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {/* Toolbar */}
      <div className="table-toolbar">
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            placeholder="Search by action, asset code, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{ maxWidth: '350px' }}
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="search-input"
            style={{ width: 'auto' }}
          >
            <option value="ALL">All Actions</option>
            <option value="ISSUE">Issue Operations</option>
            <option value="RETURN">Return Operations</option>
            <option value="MAINTENANCE">Maintenance Events</option>
            <option value="SYSTEM">System Events</option>
          </select>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Total logged entries: <strong>{filteredLogs.length}</strong>
        </span>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading audit logs...</div>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>User / Actor</th>
                <th>Action Type</th>
                <th>Operation Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No activity logs recorded.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td><code>#{log.id}</code></td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recent'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{log.user?.name || log.user?.username || 'System Administrator'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.user?.role || 'SYSTEM'}</div>
                    </td>
                    <td>
                      <span className={getActionBadge(log.action)}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-main)', maxWidth: '450px' }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
