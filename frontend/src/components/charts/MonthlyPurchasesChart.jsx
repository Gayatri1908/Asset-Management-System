import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function MonthlyPurchasesChart({ data = [] }) {
  const total = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const formattedTotal = total >= 100000 
    ? `₹${(total / 100000).toFixed(2)}L Total` 
    : `₹${total.toLocaleString('en-IN')} Total`;

  return (
    <div className="chart-card">
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="chart-title">Monthly Asset Purchases</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Real-time spending & volume trend</p>
        </div>
        <span className="badge badge-success">
          {formattedTotal}
        </span>
      </div>

      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Purchase Value']}
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
