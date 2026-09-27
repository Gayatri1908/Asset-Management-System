import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { IssuerService } from '../../services/api';
import { Search, User } from 'lucide-react';

export default function EmployeeSearch() {
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await IssuerService.searchEmployees(query);
      setEmployees(res || []);
      setHasSearched(true);
    } catch (err) {
      toast.error('Failed to search employees');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Search size={24} style={{ color: 'var(--primary)' }} /> Employee Search
      </h1>
      
      <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            className="form-control" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Search by name or email..." 
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {hasSearched && (
        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Search Results</h3>
          {employees.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No employees found matching "{query}".</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {employees.map(emp => (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-nav)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="var(--text-muted)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{emp.fullName || emp.user?.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Staff Member'}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                      <code>{emp.employeeCode || `EMP-00${emp.id}`}</code> • {emp.email} • {emp.departmentName || emp.department || 'General'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
