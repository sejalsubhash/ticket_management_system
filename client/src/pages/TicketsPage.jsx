import { useState, useEffect } from 'react';
import api from '../services/api';
import TicketList from '../components/Tickets/TicketList';
import CreateTicketModal from '../components/Tickets/CreateTicketModal';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      const res = await api.get('/tickets', { params });
      setTickets(res.data.tickets || []);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [filters]);

  const handleCreate = async (data) => {
    try {
      await api.post('/tickets', data);
      toast.success('Ticket created');
      setShowCreate(false);
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create ticket');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Tickets</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <FiPlus /> New Ticket
        </button>
      </div>

      <div className="filter-bar">
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
      </div>

      {loading ? <Loading /> : <TicketList tickets={tickets} />}

      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}
    </div>
  );
}
