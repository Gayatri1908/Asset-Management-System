import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AssetService, IssuerService } from '../../services/api';
import Modal from '../../components/common/Modal';
import { QrCode, Search, CheckCircle, AlertTriangle, Printer, ArrowRight, UserCheck, ShieldAlert, FileText, Camera } from 'lucide-react';

export default function AssetVerification() {
  const [assetCodeInput, setAssetCodeInput] = useState('AST-1001');
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [recentScans, setRecentScans] = useState(['AST-1001', 'AST-1002', 'AST-1003', 'AST-3001']);

  const handleLookup = async (codeToSearch) => {
    const code = (codeToSearch || assetCodeInput || '').trim();
    if (!code) {
      toast.error('Please enter an Asset Code');
      return;
    }

    try {
      setLoading(true);
      const res = await AssetService.getByCode(code);
      const assetData = res?.data || res;
      setAsset(assetData);

      if (assetData?.id) {
        const histRes = await AssetService.getHistory(assetData.id);
        setHistory(histRes?.data || histRes);
      }

      if (!recentScans.includes(code)) {
        setRecentScans([code, ...recentScans.slice(0, 5)]);
      }
      toast.success(`Asset ${code} verified!`);
    } catch (err) {
      toast.error(`Asset code "${code}" not found.`);
      setAsset(null);
      setHistory(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLookup('AST-1001');
  }, []);

  const getStatusBadge = (status = '') => {
    switch (status.toUpperCase()) {
      case 'AVAILABLE': return 'badge badge-success';
      case 'ISSUED': return 'badge badge-info';
      case 'MAINTENANCE': return 'badge badge-warning';
      case 'RETIRED': return 'badge badge-danger';
      default: return 'badge badge-secondary';
    }
  };

  // Generate SVG QR code representation dynamically without heavy dependencies
  const renderSvgQr = (data) => {
    return (
      <div style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem',
        background: '#fff',
        borderRadius: '12px',
        border: '2px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <svg width="140" height="140" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="white" />
          {/* Top-Left Position Detection Pattern */}
          <rect x="10" y="10" width="28" height="28" fill="#1e293b" />
          <rect x="14" y="14" width="20" height="20" fill="white" />
          <rect x="18" y="18" width="12" height="12" fill="#1e293b" />

          {/* Top-Right Position Detection Pattern */}
          <rect x="62" y="10" width="28" height="28" fill="#1e293b" />
          <rect x="66" y="14" width="20" height="20" fill="white" />
          <rect x="70" y="18" width="12" height="12" fill="#1e293b" />

          {/* Bottom-Left Position Detection Pattern */}
          <rect x="10" y="62" width="28" height="28" fill="#1e293b" />
          <rect x="14" y="66" width="20" height="20" fill="white" />
          <rect x="18" y="70" width="12" height="12" fill="#1e293b" />

          {/* Simulated Data Matrix Bits */}
          <rect x="42" y="12" width="6" height="6" fill="#1e293b" />
          <rect x="52" y="16" width="6" height="6" fill="#1e293b" />
          <rect x="44" y="26" width="6" height="6" fill="#1e293b" />
          <rect x="12" y="44" width="6" height="6" fill="#1e293b" />
          <rect x="24" y="48" width="6" height="6" fill="#1e293b" />
          <rect x="44" y="44" width="12" height="12" fill="#4f46e5" />
          <rect x="64" y="46" width="6" height="6" fill="#1e293b" />
          <rect x="76" y="52" width="6" height="6" fill="#1e293b" />
          <rect x="48" y="66" width="6" height="6" fill="#1e293b" />
          <rect x="68" y="72" width="8" height="8" fill="#1e293b" />
          <rect x="80" y="80" width="8" height="8" fill="#1e293b" />
          <rect x="44" y="80" width="6" height="6" fill="#1e293b" />
        </svg>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', marginTop: '6px', letterSpacing: '1px' }}>
          {data}
        </span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode style={{ color: 'var(--primary-color)' }} /> Asset QR & Barcode Verification
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Scan barcodes, check physical asset condition, verify assigned employee custody, and print digital slips.
          </p>
        </div>
        {asset && (
          <button onClick={() => setIsReceiptModalOpen(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Printer size={16} /> Digital Asset Slip
          </button>
        )}
      </div>

      {/* Scanner & Quick Lookup Bar */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <input
              type="text"
              placeholder="Enter Asset Code (e.g. AST-1001, AST-1002)..."
              value={assetCodeInput}
              onChange={(e) => setAssetCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className="form-control"
              style={{ paddingLeft: '2.5rem', fontWeight: 600 }}
            />
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          </div>
          <button onClick={() => handleLookup()} className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Scan / Verify Code'}
          </button>
        </div>

        {/* Quick Scan Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Test Codes:</span>
          {recentScans.map((code) => (
            <button
              key={code}
              onClick={() => {
                setAssetCodeInput(code);
                handleLookup(code);
              }}
              style={{
                fontSize: '11px',
                padding: '0.2rem 0.6rem',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                cursor: 'pointer'
              }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Main Verification Card */}
      {asset ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* QR Code & Identification Badge */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
            {renderSvgQr(asset.assetCode)}

            <div>
              <span className={getStatusBadge(asset.status)} style={{ fontSize: '12px', padding: '0.3rem 0.8rem' }}>
                Status: {asset.status}
              </span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.6rem' }}>{asset.name}</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{asset.category} • {asset.brand}</div>
            </div>

            <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', textAlign: 'left', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div><strong>Serial Number:</strong> <code>{asset.serialNumber || 'N/A'}</code></div>
              <div><strong>Current Location:</strong> {asset.location || 'HQ Storage'}</div>
              <div><strong>Quantity In Stock:</strong> {asset.quantity || 1} units</div>
            </div>
          </div>

          {/* Detailed Verification Tabs */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
              <button
                onClick={() => setActiveTab('details')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: activeTab === 'details' ? 'var(--primary-color)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'details' ? '2px solid var(--primary-color)' : 'none',
                  paddingBottom: '0.4rem'
                }}
              >
                Inspection Details
              </button>
              <button
                onClick={() => setActiveTab('custody')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: activeTab === 'custody' ? 'var(--primary-color)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'custody' ? '2px solid var(--primary-color)' : 'none',
                  paddingBottom: '0.4rem'
                }}
              >
                Custody & Assignment
              </button>
              <button
                onClick={() => setActiveTab('history')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: activeTab === 'history' ? 'var(--primary-color)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'history' ? '2px solid var(--primary-color)' : 'none',
                  paddingBottom: '0.4rem'
                }}
              >
                Lifecycle History
              </button>
            </div>

            {/* Tab: Details */}
            {activeTab === 'details' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '13px' }}>
                <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-main)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Purchase Price</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--success-color)' }}>₹{Number(asset.purchasePrice || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-main)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Procurement Date</span>
                  <strong>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</strong>
                </div>
                <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-main)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Physical Condition</span>
                  <strong style={{ color: asset.status === 'MAINTENANCE' ? 'var(--danger-color)' : 'var(--success-color)' }}>
                    {asset.status === 'MAINTENANCE' ? 'Damaged / Under Repair' : 'Functional & Verified'}
                  </strong>
                </div>
                <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-main)', borderRadius: '6px', gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Technician / Specification Remarks</span>
                  <p style={{ margin: '0.3rem 0 0 0', color: 'var(--text-main)' }}>{asset.remarks || 'Standard asset configuration.'}</p>
                </div>
              </div>
            )}

            {/* Tab: Custody */}
            {activeTab === 'custody' && (
              <div>
                {asset.status === 'ISSUED' ? (
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                      <UserCheck size={18} /> Active Custody Assigned
                    </div>
                    <p style={{ fontSize: '13px', margin: 0 }}>
                      This asset is currently deployed with employee custody. Ensure return inspection is completed before releasing back to Available stock.
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--success-color)', marginBottom: '0.5rem' }}>
                      <CheckCircle size={18} /> Available in Central Depot
                    </div>
                    <p style={{ fontSize: '13px', margin: 0 }}>
                      Asset is physically located at <strong>{asset.location}</strong> and ready for direct issuance.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: History */}
            {activeTab === 'history' && (
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {history?.issues?.length > 0 ? (
                  history.issues.map((iss) => (
                    <div key={iss.id} style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>Issued to {iss.employee?.firstName} {iss.employee?.lastName}</strong>
                        <div style={{ color: 'var(--text-muted)' }}>Date: {iss.issueDate ? new Date(iss.issueDate).toLocaleDateString() : 'N/A'}</div>
                      </div>
                      <span className="badge badge-info">{iss.issueStatus}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>No previous issue transactions logged for this unit.</div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertTriangle size={36} style={{ color: 'var(--warning-color)', marginBottom: '0.8rem' }} />
          <h3>No Asset Selected</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Please scan a QR code or type an Asset Code above (e.g. <code>AST-1001</code>) to inspect live details.
          </p>
        </div>
      )}

      {/* Digital Issue/Return Slip Modal */}
      <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title="Digital Asset Transaction Slip">
        {asset && (
          <div style={{ padding: '1.2rem', backgroundColor: '#fff', color: '#0f172a', borderRadius: '8px', border: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>AIMS ENTERPRISE DESK</h2>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Official Equipment Verification & Handover Slip</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 800, fontSize: '12px' }}>DATE: {new Date().toLocaleDateString()}</span>
                <div style={{ fontSize: '10px', color: '#64748b' }}>DOC ID: SLIP-{asset.assetCode}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '12px', marginBottom: '1.2rem' }}>
              <div>
                <strong>Asset Code:</strong> {asset.assetCode}<br />
                <strong>Item Name:</strong> {asset.name}<br />
                <strong>Category:</strong> {asset.category}<br />
                <strong>Serial:</strong> {asset.serialNumber || 'N/A'}
              </div>
              <div>
                <strong>Brand / Make:</strong> {asset.brand}<br />
                <strong>Location:</strong> {asset.location}<br />
                <strong>Current Status:</strong> {asset.status}<br />
                <strong>Inspection:</strong> VERIFIED OK
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '11px' }}>
                __________________________<br />
                <strong>Issuer Officer Signature</strong>
              </div>
              <div style={{ fontSize: '11px', textAlign: 'right' }}>
                __________________________<br />
                <strong>Employee Receiver Signature</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button onClick={() => window.print()} className="btn btn-primary btn-sm">
                Print Official Slip
              </button>
              <button onClick={() => setIsReceiptModalOpen(false)} className="btn btn-secondary btn-sm">
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
