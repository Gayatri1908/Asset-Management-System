import React, { useState, useEffect } from 'react';
import { AuthService } from '../services/api';
import { toast } from 'react-hot-toast';
import { User, Lock, Mail, Phone, ShieldCheck, KeyRound, Building, Briefcase, Calendar, Edit3, CheckCircle2 } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState({
    username: 'admin',
    fullName: 'Rajesh Kumar Sharma',
    email: 'admin@aims.in',
    role: 'ROLE_ADMIN',
    phone: '+91 98765 43210',
    department: 'IT Infrastructure & Administration',
    designation: 'Lead Enterprise Administrator',
    employeeCode: 'ADM-001',
    createdAt: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPw, setUpdatingPw] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await AuthService.getProfile();
      if (data) {
        setProfile(data);
        setEditForm({
          fullName: data.fullName || data.name || data.username || '',
          phone: data.phone || ''
        });
      }
    } catch (err) {
      console.error("Profile load error:", err);
      const session = JSON.parse(sessionStorage.getItem('session') || '{}');
      if (session && session.username) {
        setProfile(prev => ({
          ...prev,
          username: session.username,
          fullName: session.username,
          role: session.role || 'ROLE_ADMIN',
          email: `${session.username.toLowerCase()}@aims.in`
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await AuthService.updateProfile(editForm);
      setProfile(prev => ({
        ...prev,
        fullName: updated?.fullName || editForm.fullName,
        phone: updated?.phone || editForm.phone
      }));
      setIsEditing(false);
      toast.success('Profile details saved successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    try {
      setUpdatingPw(true);
      await AuthService.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new
      });
      toast.success('Security password successfully changed!');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setUpdatingPw(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    const r = (role || '').toUpperCase();
    if (r.includes('ADMIN')) return 'badge-role-admin';
    if (r.includes('ISSUER')) return 'badge-role-issuer';
    return 'badge-role-employee';
  };

  const getRoleDisplayName = (role) => {
    const r = (role || '').toUpperCase();
    if (r.includes('ADMIN')) return '🛡️ Administrator';
    if (r.includes('ISSUER')) return '📦 Asset Issuer';
    return '👨‍💻 Employee';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="profile-page-container">
      {/* Top Header Card */}
      <div className="card profile-header-card">
        <div className="profile-header-left">
          <div className="profile-header-icon">
            <User size={22} />
          </div>
          <div>
            <h1 className="profile-title">User Profile &amp; Account Security</h1>
            <p className="profile-subtitle">
              Manage your credentials, role privileges, and security authentication parameters.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditForm({ fullName: profile.fullName || profile.name || profile.username, phone: profile.phone || '' });
            setIsEditing(!isEditing);
          }}
          className="btn-icon"
          style={{ padding: '0.55rem 1rem' }}
        >
          <Edit3 size={14} />
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* User Hero Identity Card */}
      <div className="card profile-hero-card">
        <div className="profile-avatar-large">
          {getInitials(profile.fullName || profile.name || profile.username)}
        </div>

        <div className="profile-hero-content">
          <div className="profile-user-name-row">
            <h2 className="profile-user-name">
              {profile.fullName || profile.name || profile.username}
            </h2>
            <span className={`profile-role-badge ${getRoleBadgeClass(profile.role)}`}>
              {getRoleDisplayName(profile.role)}
            </span>
          </div>

          <div className="profile-meta-grid">
            <div className="profile-meta-item">
              <Mail className="profile-meta-icon" />
              <span>{profile.email || `${profile.username}@example.com`}</span>
            </div>

            <div className="profile-meta-item">
              <Phone className="profile-meta-icon" />
              <span>{profile.phone || '+1 (555) 987-6543'}</span>
            </div>

            <div className="profile-meta-item">
              <Briefcase className="profile-meta-icon" />
              <span>Username: <strong>{profile.username}</strong></span>
            </div>

            <div className="profile-meta-item">
              <ShieldCheck className="profile-meta-icon" style={{ color: 'var(--success-color)' }} />
              <span>RBAC Token: <strong style={{ color: 'var(--success-color)' }}>Verified Active</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Personal Details Panel */}
      {isEditing && (
        <div className="card profile-section-card">
          <div className="profile-section-header">
            <User size={18} style={{ color: '#818cf8' }} />
            <h3 className="profile-section-title">Edit Profile Information</h3>
          </div>

          <form onSubmit={handleProfileSave}>
            <div className="profile-form-grid-2">
              <div className="profile-form-field">
                <label>Full Display Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="e.g. Rajesh Kumar Sharma"
                  className="profile-input"
                />
              </div>

              <div className="profile-form-field">
                <label>Contact Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="profile-input"
                />
              </div>
            </div>

            <div className="profile-form-actions">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-icon"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Card */}
      <div className="card profile-section-card">
        <div className="profile-section-header">
          <KeyRound size={18} style={{ color: '#f59e0b' }} />
          <div>
            <h3 className="profile-section-title">Change Password</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '0.15rem' }}>
              Enter your current authentication password to set a new cryptographic password.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange}>
          <div className="profile-form-grid-3">
            <div className="profile-form-field">
              <label>Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                placeholder="••••••••"
                className="profile-input"
              />
            </div>

            <div className="profile-form-field">
              <label>New Password</label>
              <input
                type="password"
                required
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                placeholder="••••••••"
                className="profile-input"
              />
            </div>

            <div className="profile-form-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                placeholder="••••••••"
                className="profile-input"
              />
            </div>
          </div>

          <div className="profile-form-actions">
            <button
              type="submit"
              disabled={updatingPw}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#d97706', borderColor: '#b45309' }}
            >
              <Lock size={14} />
              {updatingPw ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
