import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { EmployeeService, DepartmentService, AssetService } from '../services/api';
import Modal from '../components/common/Modal';
import { Users, Plus, Search, Building2, Phone, Mail, Shield, CheckCircle2, XCircle, Package } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    password: 'Admin@123'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes, assetRes] = await Promise.all([
        EmployeeService.getAll(),
        DepartmentService.getAll(),
        AssetService.getAll()
      ]);
      setEmployees(empRes?.content || empRes || []);
      setDepartments(deptRes || []);
      setAllAssets(assetRes?.content || assetRes || []);
    } catch (err) {
      toast.error('Failed to load employee records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await EmployeeService.create({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        department: form.department,
        designation: form.designation,
        password: form.password
      });
      toast.success(`Employee ${form.firstName} ${form.lastName} created!`);
      setIsAddModalOpen(false);
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: 'Engineering',
        designation: 'Software Engineer',
        password: 'Admin@123'
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      await EmployeeService.update(editingEmployee.id, {
        firstName: editingEmployee.firstName,
        lastName: editingEmployee.lastName,
        email: editingEmployee.email,
        phone: editingEmployee.phone,
        department: editingEmployee.department,
        designation: editingEmployee.designation
      });
      toast.success('Employee updated successfully!');
      setEditingEmployee(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to update employee');
    }
  };

  const handleToggleStatus = async (employee) => {
    try {
      const updated = {
        ...employee,
        isActive: !employee.isActive
      };
      await EmployeeService.update(employee.id, updated);
      toast.success(`Employee status changed to ${!employee.isActive ? 'Active' : 'Inactive'}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const dept = emp.department || '';
    const matchSearch = fullName.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    const matchDept = selectedDept === 'All' || dept === selectedDept;
    return matchSearch && matchDept;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users style={{ color: 'var(--primary-color)' }} /> Employee Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Manage staff profiles, department assignments, contact info, and issued equipment.
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
          + Add Employee
        </button>
      </div>

      {/* Toolbar */}
      <div className="table-toolbar">
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{ maxWidth: '320px' }}
          />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="search-input"
            style={{ width: 'auto' }}
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Total: <strong>{filteredEmployees.length}</strong> employees
        </span>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading employee records...</div>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee Name</th>
                <th>Contact</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No employee records found.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td><code>EMP-{String(emp.id).padStart(3, '0')}</code></td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.user?.username || emp.email}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>{emp.email}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.phone || 'N/A'}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{emp.department || 'General'}</span>
                    </td>
                    <td>{emp.designation || 'Staff'}</td>
                    <td>
                      <span className={emp.isActive !== false ? 'badge badge-success' : 'badge badge-danger'}>
                        {emp.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setViewingEmployee(emp)} className="btn btn-secondary btn-sm">
                          View
                        </button>
                        <button onClick={() => setEditingEmployee(emp)} className="btn btn-secondary btn-sm">
                          Edit
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(emp)} 
                          className={`btn btn-sm ${emp.isActive !== false ? 'btn-danger' : 'btn-success'}`}
                        >
                          {emp.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Employee">
        <form onSubmit={handleAddEmployee}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="form-control"
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
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="form-control"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Password</label>
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
              Register Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={!!editingEmployee} onClose={() => setEditingEmployee(null)} title="Edit Employee Details">
        {editingEmployee && (
          <form onSubmit={handleUpdateEmployee}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  required
                  value={editingEmployee.firstName}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, firstName: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  required
                  value={editingEmployee.lastName}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, lastName: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  required
                  value={editingEmployee.email}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  value={editingEmployee.phone || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  value={editingEmployee.department || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                  className="form-control"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  value={editingEmployee.designation || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.2rem' }}>
              <button type="button" onClick={() => setEditingEmployee(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Employee Modal */}
      <Modal isOpen={!!viewingEmployee} onClose={() => setViewingEmployee(null)} title="Employee Profile & Issued Assets">
        {viewingEmployee && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {viewingEmployee.firstName} {viewingEmployee.lastName}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                EMP-{String(viewingEmployee.id).padStart(3, '0')} • {viewingEmployee.designation} • {viewingEmployee.department}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.8rem', fontSize: '12px' }}>
                <div><strong>Email:</strong> {viewingEmployee.email}</div>
                <div><strong>Phone:</strong> {viewingEmployee.phone || 'N/A'}</div>
                <div><strong>Status:</strong> {viewingEmployee.isActive !== false ? 'Active' : 'Inactive'}</div>
                <div><strong>Joined:</strong> {viewingEmployee.createdAt ? new Date(viewingEmployee.createdAt).toLocaleDateString() : 'Active'}</div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Package size={16} /> Currently Assigned Assets
              </h4>
              <div style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px' }}>
                {allAssets.filter(a => a.status === 'ISSUED').length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {allAssets.filter(a => a.status === 'ISSUED').slice(0, 2).map((ast) => (
                      <div key={ast.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '4px' }}>
                        <div>
                          <strong>{ast.name}</strong> <code>({ast.assetCode})</code>
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Serial: {ast.serialNumber} • Location: {ast.location}</div>
                        </div>
                        <span className="badge badge-info">Issued</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>No hardware assets currently checked out.</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setViewingEmployee(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
