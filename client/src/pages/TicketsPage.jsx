import { useState, useEffect } from 'react';
import api from '../services/api';
import TicketList from '../components/Tickets/TicketList';
import CreateTicketModal from '../components/Tickets/CreateTicketModal';
import BulkImportModal from '../components/Tickets/BulkImportModal';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { FiPlus, FiUpload, FiDownload, FiSearch } from 'react-icons/fi';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', category: '', startDate: '', endDate: '' });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await api.get('/tickets', { params });
      setTickets(res.data.tickets || []);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [filters]);

  const handleCreate = async (formData) => {
    try {
      await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Ticket created');
      setShowCreate(false);
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create ticket');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('format', 'csv');

      const res = await api.get(`/tickets/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tickets.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Tickets exported');
    } catch (err) {
      toast.error('Failed to export tickets');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Tickets</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            <FiDownload /> Export
          </button>
          <button className="btn btn-secondary" onClick={() => setShowImport(true)}>
            <FiUpload /> Import
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <FiPlus /> New Ticket
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search tickets..."
            style={{ width: '100%', padding: '6px 12px 6px 32px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
          <option value="network">Network</option>
          <option value="access">Access</option>
          <option value="email">Email</option>
          <option value="other">Other</option>
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          style={{ padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          style={{ padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        />
        {loading && <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>}
      </div>

      {loading && tickets.length === 0 ? <Loading /> : <TicketList tickets={tickets} />}

      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}
      {showImport && <BulkImportModal onClose={() => setShowImport(false)} onComplete={fetchTickets} />}
    </div>
  );
}
