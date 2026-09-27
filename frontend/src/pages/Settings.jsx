import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem('aims_company_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'AIMS Enterprise Solutions Pvt. Ltd.',
      taxId: 'GSTIN-29AAACA1234F1Z5',
      address: 'Tech Park, Whitefield, Bengaluru, Karnataka 560066'
    };
  });

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('aims_company_settings', JSON.stringify(companyInfo));
    toast.success('Organization settings saved!');
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>System Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Company info, themes, and system configurations.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Organization Details</h3>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tax ID / EIN</label>
              <input
                type="text"
                value={companyInfo.taxId}
                onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
                className="form-control"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">HQ Address</label>
            <input
              type="text"
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
              className="form-control"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary">Save Info</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Display & Appearance</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>Current Theme: <strong>{theme === 'dark' ? 'Black Dark Mode' : 'Light Mode'}</strong></span>
          <button onClick={toggleTheme} className="btn btn-secondary btn-sm">
            Switch Theme
          </button>
        </div>
      </div>
    </div>
  );
}
