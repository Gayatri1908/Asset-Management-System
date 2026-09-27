import { Link, useNavigate } from "react-router-dom";
import React, { useState, useMemo } from "react";
import {
  Boxes, User, Mail, Phone, Calendar, Building2, Briefcase, ShieldCheck,
  Lock, CheckCircle2, AlertCircle, RotateCcw, X, Save, Eye, EyeOff, Hash
} from "lucide-react";
import "./Register.css";

import { AuthService } from "../../services/api";

const DEPARTMENTS = ["Engineering", "IT Support & Infrastructure", "Product & UI/UX Design", "Human Resources", "Operations & Logistics"];
const ROLES = ["Employee", "Asset Issuer", "Admin"];
const TODAY = new Date().toISOString().split("T")[0];

function calcAge(dobStr) {
  if (!dobStr) return "";
  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age >= 0 ? age : "";
}

function passwordChecks(pw) {
  return {
    length: pw.length >= 6,
    upper: true,
    lower: true,
    number: true,
    special: true,
  };
}

const emptyForm = {
  firstName: "", lastName: "", email: "", phone: "",
  dob: "", gender: "", department: "Engineering", designation: "", joiningDate: "",
  role: "Employee", username: "", password: "", confirmPassword: "", status: "Active",
};

// Field config drives the form grid below
const FIELDS = [
  { key: "firstName", label: "First name", required: true, icon: User, placeholder: "Rahul" },
  { key: "lastName", label: "Last name", required: true, icon: User, placeholder: "Verma" },
  { key: "email", label: "Email", required: true, icon: Mail, type: "email", placeholder: "rahul.verma@aims.in" },
  { key: "phone", label: "Phone number", required: true, icon: Phone, placeholder: "10-digit number", maxLength: 10 },
  { key: "dob", label: "Date of birth", required: false, icon: Calendar, type: "date", max: TODAY },
  { key: "gender", label: "Gender", required: false, icon: User, type: "select", options: ["Male", "Female", "Other"] },
  { key: "department", label: "Department", required: true, icon: Building2, type: "select", options: DEPARTMENTS },
  { key: "designation", label: "Designation", required: true, icon: Briefcase, placeholder: "e.g. Senior Software Engineer" },
  { key: "role", label: "Role", required: true, icon: ShieldCheck, type: "select", options: ROLES },
  { key: "username", label: "Username", required: true, icon: User, placeholder: "Unique username" },
  { key: "password", label: "Password", required: true, icon: Lock, type: "password", placeholder: "Create a password" },
  { key: "confirmPassword", label: "Confirm password", required: true, icon: Lock, type: "password", placeholder: "Re-enter password" },
];

function Field({ label, required, icon: Icon, error, children }) {
  return (
    <div className="am-field">
      <label className="am-label">{label}{required && <span className="req">*</span>}</label>
      <div className="am-input-wrap">
        {Icon && <Icon size={15} className="am-icon" />}
        {children}
      </div>
      {error && <p className="am-err-msg"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [visiblePw, setVisiblePw] = useState({ password: false, confirmPassword: false });
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const age = useMemo(() => calcAge(form.dob), [form.dob]);
  const pwChecks = useMemo(() => passwordChecks(form.password), [form.password]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const togglePwVisible = (key) => setVisiblePw((v) => ({ ...v, [key]: !v[key] }));

  function validate() {
    const e = {};
    FIELDS.forEach(({ key, required }) => {
      if (required && !String(form[key]).trim()) e[key] = "Required field missing";
    });

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit phone number";

    if (form.password && form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }

    return e;
  }

  async function handleSave() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setBanner({ type: "error", text: "Please correct the errors in the form before submitting." });
      return;
    }

    try {
      setLoading(true);
      const roleMap = {
        "Admin": "ROLE_ADMIN",
        "Asset Issuer": "ROLE_ASSET_ISSUER",
        "Employee": "ROLE_EMPLOYEE"
      };

      await AuthService.register({
        username: form.username,
        password: form.password,
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: `+91 ${form.phone}`,
        role: roleMap[form.role] || "ROLE_EMPLOYEE",
        department: form.department,
        designation: form.designation
      });

      setBanner({ type: "success", text: "User profile registered successfully! Redirecting to login..." });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setBanner({ type: "error", text: err?.response?.data?.message || "Failed to register user. Username or email may already exist." });
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm(emptyForm);
    setErrors({});
    setBanner(null);
    setLastSaved(null);
  }

  function handleCancel() {
    setForm(emptyForm);
    setErrors({});
    setBanner(null);
  }

  function renderInput(f) {
    const value = f.key === "age" ? age : form[f.key];
    const hasError = !!errors[f.key];

    if (f.type === "select") {
      return (
        <select className={`am-select ${hasError ? "err" : ""}`} value={value} onChange={set(f.key)}>
          <option value="">Select {f.label.toLowerCase()}</option>
          {f.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      );
    }

    if (f.type === "password") {
      const visible = visiblePw[f.key];
      return (
        <>
          <input
            className={`am-input pw ${hasError ? "err" : ""}`}
            type={visible ? "text" : "password"}
            value={value}
            onChange={set(f.key)}
            placeholder={f.placeholder}
          />
          <span className="am-toggle-visibility" onClick={() => togglePwVisible(f.key)}>
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </span>
        </>
      );
    }

    return (
      <input
        className={`am-input ${hasError ? "err" : ""}`}
        type={f.type || "text"}
        value={value}
        disabled={f.disabled}
        maxLength={f.maxLength}
        max={f.max}
        placeholder={f.placeholder}
        onChange={f.disabled ? undefined : set(f.key)}
      />
    );
  }

  return (
    <div className="am-root">
      <div className="am-card am-form-card">
        <div className="am-header">
          <div>
            <div className="am-eyebrow">
            </div>
            <h1 className="am-heading am-title">New user registration</h1>
          </div>
          <div className="am-header-actions">
            <select className="am-select am-status-select" value={form.status} onChange={set("status")}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {banner && (
          <div className={`am-banner ${banner.type === "success" ? "am-banner-success" : "am-banner-error"}`}>
            {banner.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {banner.text}
            {banner.type === "success" && lastSaved && (
              <span className="am-mono am-banner-meta">
                {lastSaved.userId} &middot; {lastSaved.employeeId}
              </span>
            )}
          </div>
        )}

        <div className="am-grid">
          {FIELDS.map((f) => (
            <Field key={f.key} label={f.label} required={f.required} icon={f.icon} error={errors[f.key]}>
              {renderInput(f)}
            </Field>
          ))}
        </div>

        {form.password && (
          <div className="am-pw-checklist">
            {[
              ["8+ characters", pwChecks.length],
              ["Uppercase", pwChecks.upper],
              ["Lowercase", pwChecks.lower],
              ["Number", pwChecks.number],
              ["Special character", pwChecks.special],
            ].map(([label, ok]) => (
              <span key={label} className={`am-pw-check ${ok ? "ok" : ""}`}>
                <CheckCircle2 size={12} /> {label}
              </span>
            ))}
          </div>
        )}
        <div className="am-form-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="am-btn-link">Login here</Link>
        </div>

        <div className="am-form-actions">
          <button className="am-btn-ghost" onClick={handleCancel}><X size={14} />Cancel</button>
          <button className="am-btn-secondary" onClick={handleReset}><RotateCcw size={14} />Reset</button>
          <button className="am-btn-primary" onClick={handleSave}><Save size={14} />Save</button>
        </div>
      </div>
    </div>
  );
}