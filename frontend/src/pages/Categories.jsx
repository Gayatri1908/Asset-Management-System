import React, { useState, useEffect } from 'react';
import { CategoryService } from '../services/api';
import Modal from '../components/common/Modal';
import { toast } from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({ name: '', description: '', status: 'ACTIVE' });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await CategoryService.getAll();
      setCategories(data || []);
    } catch (err) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingCategory) {
        await CategoryService.update(editingCategory.id, formData);
        toast.success(`Category "${formData.name}" updated!`);
      } else {
        await CategoryService.create(formData);
        toast.success(`Category "${formData.name}" created!`);
      }
      fetchCategories();
      setIsAddOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', status: 'ACTIVE' });
    } catch (err) {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (cat) => {
    if (window.confirm(`Are you sure you want to delete ${cat.name}?`)) {
      try {
        await CategoryService.delete(cat.id);
        toast.success(`Category "${cat.name}" removed.`);
        fetchCategories();
      } catch (err) {
        toast.error('Failed to delete category. It might be in use.');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Category Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Organize asset taxonomies and hardware categories.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', description: '', status: 'ACTIVE' });
            setIsAddOpen(true);
          }}
          className="btn btn-primary"
        >
          + Add Category
        </button>
      </div>

      <div className="table-container">
        {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}>Loading categories...</div> : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Asset Count</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No categories found.</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.id}>
                  <td><code>{cat.id}</code></td>
                  <td><strong>{cat.name}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{cat.description}</td>
                  <td><strong>{cat.totalAssets || 0}</strong></td>
                  <td>
                    <span className="badge badge-success">{cat.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setFormData({ name: cat.name, description: cat.description, status: cat.status });
                      }}
                      className="table-action-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
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
        isOpen={isAddOpen || !!editingCategory}
        onClose={() => {
          setIsAddOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              value={formData.status || 'ACTIVE'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="form-control"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditingCategory(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
