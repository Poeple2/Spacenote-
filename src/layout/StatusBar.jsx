import React from 'react';

const statuses = [
  { label: 'Perfect/Completed',   bg: '#2563eb', color: '#fff' },
  { label: 'Very Good/Done',      bg: '#16a34a', color: '#fff' },
  { label: 'Good / Achieved',     bg: '#15803d', color: '#fff' },
  { label: 'Scheduled',           bg: '#ffffff', color: '#000', border: '1px solid #333' },
  { label: 'En cours/ Not Bad',   bg: '#facc15', color: '#333' },
  { label: 'Pending',             bg: '#ca8a04', color: '#fff' },
  { label: 'Under review',        bg: '#000000', color: '#fff' },
  { label: 'Closed / Bad',        bg: '#dc2626', color: '#fff' },
  { label: 'Cancelled / Problem', bg: '#b91c1c', color: '#fff' },
];

export default function StatusBar() {
  return (
    <footer className="status-bar">
      {statuses.map((s, i) => (
        <div
          key={i}
          className="status-item"
          style={{
            backgroundColor: s.bg,
            color: s.color,
            border: s.border || 'none',
          }}
        >
          {s.label}
        </div>
      ))}
    </footer>
  );
}
