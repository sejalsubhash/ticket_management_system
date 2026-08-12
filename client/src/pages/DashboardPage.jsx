import { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/common/Loading';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiTag, FiAlertTriangle, FiCheckCircle, FiClock, FiFilter } from 'react-icons/fi';

const COLORS = ['#0891b2', '#d97706', '#16a34a', '#6b7280'];

// SLA definitions (in hours)
const SLA_HOURS = {
  critical: 4,
  high: 8,
  medium: 24,
  low: 72,
};

function getSLAStatus(ticket) {
  const createdAt = new Date(ticket.createdAt);
  const now = new Date();
  const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);
  const slaHours = SLA_HOURS[ticket.priority] || 24;
  const remaining = slaHours - hoursElapsed;
  
  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    return { status: 'met', text: 'Resolved', color: 'var(--success)' };
  }
  if (remaining < 0) {
    return { status: 'breached', text: `${Math.abs(Math.round(remaining))}h overdue`, color: 'var(--danger)' };
  }
  if (remaining < slaHours * 0.25) {
    return { status: 'warning', text: `${Math.round(remaining)}h left`, color: 'var(--warning)' };
  }
  return { status: 'ok', text: `${Math.round(remaining)}h left`, color: 'var(--success)' };
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      const res = await api.get('/tickets/dashboard', { params });
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!stats) return <div className="page-container"><p>Failed to load dashboard.</p></div>;

  const statusData = Object.entries(stats.byStatus || {}).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  const priorityData = Object.entries(stats.byPriority || {}).map(([name, value]) => ({ name, value }));

  // Calculate SLA stats
  const slaStats = {
    total: stats.recent?.length || 0,
    met: 0,
    warning: 0,
    breached: 0,
  };
  
  stats.recent?.forEach(ticket => {
    const sla = getSLAStatus(ticket);
    if (sla.status === 'met') slaStats.met++;
    else if (sla.status === 'warning') slaStats.warning++;
    else if (sla.status === 'breached') slaStats.breached++;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <FiFilter style={{ color: 'var(--text-muted)' }} />
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            style={{ padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            style={{ padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
          {(dateRange.startDate || dateRange.endDate) && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
            >
              Clear
            </button>
          )}
        </div>
      </div>

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

      <div className="charts-grid">
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Tickets by Status</h3>
          {Object.keys(stats.byStatus || {}).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Object.entries(stats.byStatus || {}).map(([name, value]) => ({ name: name.replace('_', ' '), value }))}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {Object.entries(stats.byStatus || {}).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)' }}>No data</p>}
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Tickets by Priority</h3>
          {Object.keys(stats.byPriority || {}).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={Object.entries(stats.byPriority || {}).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {Object.entries(stats.byPriority || {}).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-muted)' }}>No data</p>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>SLA Overview</h3>
        <div className="stats-grid" style={{ marginBottom: 0 }}>
          <div style={{ textAlign: 'center', padding: '12px', background: 'var(--success-light)', borderRadius: 'var(--radius)' }}>
            <h4 style={{ color: 'var(--success)', fontSize: '1.5rem', fontWeight: '700' }}>{slaStats.met}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SLA Met</p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: 'var(--warning-light)', borderRadius: 'var(--radius)' }}>
            <h4 style={{ color: 'var(--warning)', fontSize: '1.5rem', fontWeight: '700' }}>{slaStats.warning}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>At Risk</p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: 'var(--danger-light)', borderRadius: 'var(--radius)' }}>
            <h4 style={{ color: 'var(--danger)', fontSize: '1.5rem', fontWeight: '700' }}>{slaStats.breached}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Breached</p>
          </div>
        </div>
        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <p><strong>SLA Targets:</strong> Critical: 4h | High: 8h | Medium: 24h | Low: 72h</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Recent Tickets</h3>
        {stats.recent?.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr><th>Title</th><th>Status</th><th>Priority</th><th>SLA</th><th>Created</th></tr>
              </thead>
              <tbody>
                {stats.recent.map(t => {
                  const sla = getSLAStatus(t);
                  return (
                    <tr key={t.id}>
                      <td><strong>{t.title}</strong></td>
                      <td><span className={`badge badge-${t.status}`}>{t.status?.replace('_', ' ')}</span></td>
                      <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                      <td style={{ color: sla.color, fontSize: '0.75rem', fontWeight: '500' }}>{sla.text}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <p style={{ color: 'var(--text-muted)' }}>No tickets yet.</p>}
      </div>
    </div>
  );
}
