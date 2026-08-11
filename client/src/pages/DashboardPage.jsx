import { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/common/Loading';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiTag, FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi';

const COLORS = ['#0891b2', '#d97706', '#16a34a', '#6b7280'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets/dashboard')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!stats) return <div className="page-container"><p>Failed to load dashboard.</p></div>;

  const statusData = Object.entries(stats.byStatus || {}).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  const priorityData = Object.entries(stats.byPriority || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><FiTag /></div>
          <div className="stat-info"><h3>{stats.total}</h3><p>Total Tickets</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}><FiClock /></div>
          <div className="stat-info"><h3>{stats.byStatus?.open || 0}</h3><p>Open</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}><FiAlertTriangle /></div>
          <div className="stat-info"><h3>{stats.byStatus?.in_progress || 0}</h3><p>In Progress</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}><FiCheckCircle /></div>
          <div className="stat-info"><h3>{stats.byStatus?.resolved || 0}</h3><p>Resolved</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Tickets by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--gray-500)' }}>No data</p>}
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Tickets by Priority</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--gray-500)' }}>No data</p>}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Recent Tickets</h3>
        {stats.recent?.length > 0 ? (
          <table className="table">
            <thead>
              <tr><th>Title</th><th>Status</th><th>Priority</th><th>Created</th></tr>
            </thead>
            <tbody>
              {stats.recent.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.title}</strong></td>
                  <td><span className={`badge badge-${t.status}`}>{t.status?.replace('_', ' ')}</span></td>
                  <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--gray-500)' }}>No tickets yet.</p>}
      </div>
    </div>
  );
}
