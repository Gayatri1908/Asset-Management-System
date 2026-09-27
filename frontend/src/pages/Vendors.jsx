import React, { useState, useEffect } from 'react';
import { VendorService } from '../services/api';
import Modal from '../components/common/Modal';
import { toast } from 'react-hot-toast';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 'ACTIVE'
  });

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await VendorService.getAll();
      setVendors(data || []);
    } catch (err) {
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await VendorService.update(editingVendor.id, form);
        toast.success(`Vendor "${form.name}" updated!`);
      } else {
        await VendorService.create(form);
        toast.success(`Vendor "${form.name}" added.`);
      }
      fetchVendors();
      setIsModalOpen(false);
      setEditingVendor(null);
    } catch (err) {
      toast.error('Failed to save vendor');
    }
  };

  const handleDelete = async (vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.name}?`)) {
      try {
        await VendorService.delete(vendor.id);
        toast.success(`Vendor "${vendor.name}" deleted.`);
        fetchVendors();
      } catch (err) {
        toast.error('Failed to delete vendor. They might have associated records.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Vendor & Procurement Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Supplier contacts and procurement SLAs.</p>
        </div>
        <button
          onClick={() => {
            setForm({ name: '', contactPerson: '', phone: '', email: '', address: '', status: 'ACTIVE' });
            setEditingVendor(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          + Add Vendor
        </button>
      </div>

      <div className="table-container">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading vendors...</div> : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vendor Name</th>
                <th>Contact Person</th>
                <th>Phone / Email</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No vendors found.</td></tr>
              ) : vendors.map((vnd) => (
                <tr key={vnd.id}>
                  <td><code>{vnd.id}</code></td>
                  <td>
                    <strong>{vnd.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {vnd.address}</div>
                  </td>
                  <td>{vnd.contactPerson}</td>
                  <td>
                    <div>{vnd.phone}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{vnd.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-success">{vnd.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setEditingVendor(vnd);
                        setForm(vnd);
                        setIsModalOpen(true);
                      }}
                      className="table-action-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vnd)}
                      className="table-action-btn delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Vendor Name</label>
            <input
              type="text"
              required
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                value={form.contactPerson || ''}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={form.status || 'ACTIVE'}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="form-control"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="form-control"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Vendor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
