import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DepartmentBarChart({ data = [] }) {
  return (
    <div className="chart-card">
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="chart-title">Assets by Department</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Allocation across teams</p>
        </div>
        <span className="badge">
          {data.length} Departments
        </span>
      </div>

      <div className="chart-container" style={{ width: '100%', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis dataKey="department" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip
              formatter={(value) => [`${value} Assets`, 'Allocated']}
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                borderColor: '#374151',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="assets" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
