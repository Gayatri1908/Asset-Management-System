import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-body" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} className="btn-icon" style={{ border: 'none', fontSize: '1.2rem' }}>
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
