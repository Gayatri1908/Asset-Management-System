import React from 'react';

export default function KpiCard({ title, count, change, isPositive }) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-value">
        {typeof count === 'number' ? count.toLocaleString() : count}
      </div>
      <div className={`card-change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '▲' : '▼'} {change}
      </div>
    </div>
  );
}
