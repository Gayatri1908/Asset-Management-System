import React, { useState, useEffect } from 'react';
import { DepartmentService } from '../services/api';
import { Users, Plus, MapPin, DollarSign, Box } from 'lucide-react';
import Modal from '../components/common/Modal';
import { toast } from 'react-hot-toast';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', headName: '', location: '', budget: 100000 });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await DepartmentService.getAll();
      setDepartments(data || []);
    } catch (err) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await DepartmentService.create(form);
      toast.success(`Department "${form.name}" registered!`);
      fetchDepartments();
      setIsModalOpen(false);
      setForm({ name: '', headName: '', location: '', budget: 100000 });
    } catch (err) {
      toast.error('Failed to create department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-500" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Department Allocation Directory</h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Organizational units, assigned asset counts, allocated budgets, and department heads.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading departments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No departments found.</div>
          ) : departments.map((dept) => (
            <div
              key={dept.id}
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded-md">
                  DEP-0{dept.id}
                </span>
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-500" /> {dept.employeeCount || 0} Employees
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 dark:text-white">{dept.name}</h3>

              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between">
                  <span className="text-gray-400">Department Head:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{dept.headName || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Budget Allocated:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{dept.budget?.toLocaleString('en-IN') || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Department"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Department Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Research & Development"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Department Lead / Manager</label>
            <input
              type="text"
              required
              value={form.headName}
              onChange={(e) => setForm({ ...form, headName: e.target.value })}
              placeholder="e.g. Vikram Malhotra"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Budget (₹ INR)</label>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 rounded-xl font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold">
              Create Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
