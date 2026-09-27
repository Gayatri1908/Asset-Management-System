import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import {
  ShieldCheck, User, Lock, Eye, EyeOff, LogIn, KeyRound,
  RotateCcw, AlertCircle, CheckCircle2, Lock as LockIcon,
} from "lucide-react";
import { AuthService } from "../../services/api";
import Modal from "../../components/common/Modal";
import "./Login.css";

const emptyForm = { username: "", password: "" };

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [visible, setVisible] = useState(false);
  const [banner, setBanner] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function validate() {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.password.trim()) e.password = "Password is required";
    return e;
  }

  async function handleLogin() {
    setSession(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setBanner({ type: "error", text: "Please fill in both fields to continue." });
      return;
    }

    setLoading(true);
    setBanner(null);

    try {
      const response = await AuthService.login({
        username: form.username,
        password: form.password
      });

      if (response && response.token) {
        const { token, user } = response;
        const sessionInfo = {
          username: user.name || user.username || form.username,
          role: user.role,
          token,
          issuedAt: new Date().toLocaleTimeString()
        };

        setSession(sessionInfo);
        setBanner({ type: "success", text: `Welcome back, ${sessionInfo.username}. Session created and dashboard is ready.` });

        if (onLoginSuccess) onLoginSuccess(sessionInfo);

        sessionStorage.setItem("session", JSON.stringify(sessionInfo));

        // Redirect based on role
        setTimeout(() => {
          if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') navigate("/admin");
          else if (user.role === 'ROLE_ASSET_ISSUER' || user.role === 'ASSET_ISSUER') navigate("/issuer");
          else if (user.role === 'ROLE_EMPLOYEE' || user.role === 'EMPLOYEE') navigate("/employee");
          else navigate("/");
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setBanner({ type: "error", text: "Invalid username or password. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetForm, setResetForm] = useState({ username: "", newPassword: "", confirmPassword: "" });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState(null);

  function handleForgotPassword() {
    setResetForm({ username: form.username || "", newPassword: "", confirmPassword: "" });
    setResetMsg(null);
    setIsResetModalOpen(true);
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    if (!resetForm.username.trim()) {
      setResetMsg({ type: "error", text: "Please enter your username." });
      return;
    }
    if (!resetForm.newPassword || resetForm.newPassword.length < 6) {
      setResetMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setResetLoading(true);
    setResetMsg(null);
    try {
      await AuthService.resetPassword({
        username: resetForm.username.trim(),
        newPassword: resetForm.newPassword
      });
      setResetMsg({ type: "success", text: "Password reset successful! You may now login." });
      setForm((f) => ({ ...f, username: resetForm.username, password: resetForm.newPassword }));
      setTimeout(() => {
        setIsResetModalOpen(false);
      }, 1500);
    } catch (err) {
      setResetMsg({ type: "error", text: err?.response?.data?.message || "Failed to reset password. User not found." });
    } finally {
      setResetLoading(false);
    }
  }

  function handleQuickLogin(user, pw) {
    setForm({ username: user, password: pw });
    setBanner(null);
  }

  function handleClear() {
    setForm(emptyForm);
    setErrors({});
    setBanner(null);
    setSession(null);
  }

  return (
    <div className="am-login-root">
      <div className="am-card am-login-card">
        <div className="am-login-header">
          <div className="am-eyebrow">
          </div>

          <h1 className="am-heading am-title">Sign in to your account</h1>
          <p className="am-subtitle">Enter your credentials to access the dashboard.</p>
        </div>

        {banner && (
          <div className={`am-banner ${banner.type === "success" ? "am-banner-success" : "am-banner-error"}`}>
            {banner.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {banner.text}
          </div>
        )}

        <div className="am-field">
          <label className="am-label">Username<span className="req">*</span></label>
          <div className="am-input-wrap">
            <User size={15} className="am-icon" />
            <input
              className={`am-input ${errors.username ? "err" : ""}`}
              type="text"
              value={form.username}
              onChange={set("username")}
              placeholder="Enter your username"
              autoComplete="username"
              disabled={loading}
            />
          </div>
          {errors.username && <p className="am-err-msg"><AlertCircle size={12} />{errors.username}</p>}
        </div>

        <div className="am-field">
          <label className="am-label">Password<span className="req">*</span></label>
          <div className="am-input-wrap">
            <Lock size={15} className="am-icon" />
            <input
              className={`am-input pw ${errors.password ? "err" : ""}`}
              type={visible ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />
            <span className="am-toggle-visibility" onClick={() => setVisible((v) => !v)}>
              {visible ? <EyeOff size={15} /> : <Eye size={15} />}
            </span>
          </div>
          {errors.password && <p className="am-err-msg"><AlertCircle size={12} />{errors.password}</p>}
        </div>

        <div className="am-login-actions">
          <button className="am-btn-primary am-btn-full" onClick={handleLogin} disabled={loading}>
            {loading ? "Authenticating..." : <><LogIn size={14} />Login</>}
          </button>
          <div className="am-login-secondary-actions">
            <button className="am-btn-link" onClick={handleForgotPassword}>
              <KeyRound size={13} />Forgot Password
            </button>
            <button className="am-btn-ghost" onClick={handleClear}>
              <RotateCcw size={13} />Clear
            </button>
          </div>
        </div>

        {session && (
          <div className="am-session-panel">
            <div className="am-session-row">
              <LockIcon size={13} />
              <span>Password verified &amp; encrypted match confirmed</span>
            </div>
            <div className="am-session-row">
              <ShieldCheck size={13} />
              <span>Session created for <strong>{session.username}</strong> ({session.role}) at {session.issuedAt}</span>
            </div>
            <div className="am-session-token">
              <span className="am-session-token-label am-mono">JWT</span>
              <span className="am-mono am-session-token-value">{session.token}</span>
            </div>
          </div>
        )}

        {/* Quick Role Fill Pills */}
        <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
            Quick Demo Login:
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin("admin", "Admin@123")}
              className="am-btn-ghost"
              style={{ fontSize: '11px', padding: '0.3rem 0.6rem' }}
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("issuer", "Admin@123")}
              className="am-btn-ghost"
              style={{ fontSize: '11px', padding: '0.3rem 0.6rem' }}
            >
              📦 Issuer
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("employee1", "Admin@123")}
              className="am-btn-ghost"
              style={{ fontSize: '11px', padding: '0.3rem 0.6rem' }}
            >
              👨‍💻 Employee
            </button>
          </div>
        </div>

        <div className="am-login-footer">
          <span>New user?</span>
          <Link to="/register" className="am-btn-link">Register here</Link>
        </div>
      </div>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Account Password"
      >
        <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '13px' }}>
          {resetMsg && (
            <div className={`am-banner ${resetMsg.type === "success" ? "am-banner-success" : "am-banner-error"}`}>
              {resetMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {resetMsg.text}
            </div>
          )}

          <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>
            Enter your system username and specify a new secure password.
          </p>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>Username</label>
            <input
              type="text"
              required
              value={resetForm.username}
              onChange={(e) => setResetForm({ ...resetForm, username: e.target.value })}
              placeholder="e.g. employee1"
              className="form-control"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>New Password</label>
            <input
              type="password"
              required
              value={resetForm.newPassword}
              onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
              placeholder="Minimum 6 characters"
              className="form-control"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>Confirm New Password</label>
            <input
              type="password"
              required
              value={resetForm.confirmPassword}
              onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className="form-control"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetLoading}
              className="btn btn-primary btn-sm"
            >
              {resetLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}