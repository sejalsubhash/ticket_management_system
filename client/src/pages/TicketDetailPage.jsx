import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import CommentSection from '../components/Tickets/CommentSection';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data.ticket);
      setComments(res.data.comments || []);
    } catch (err) {
      toast.error('Ticket not found');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await api.put(`/tickets/${id}`, { status: newStatus });
      setTicket({ ...ticket, status: newStatus });
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this ticket?')) return;
    try {
      await api.delete(`/tickets/${id}`);
      toast.success('Ticket deleted');
      navigate('/tickets');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleAddComment = async (text) => {
    try {
      const res = await api.post(`/tickets/${id}/comments`, { text });
      setComments([...comments, res.data.comment]);
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  if (loading) return <Loading />;
  if (!ticket) return null;

  return (
    <div className="page-container">
      <button onClick={() => navigate('/tickets')} className="btn btn-secondary" style={{ marginBottom: '16px' }}>
        <FiArrowLeft /> Back to Tickets
      </button>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>{ticket.title}</h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <span className="badge badge-open">{ticket.category}</span>
            </div>
          </div>
          {user?.role === 'admin' && (
            <button onClick={handleDelete} className="btn btn-danger btn-sm"><FiTrash2 /> Delete</button>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: '1.8' }}>{ticket.description}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', fontSize: '0.875rem' }}>
          <div><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
          <div><strong>Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}</div>
          <div><strong>Created By:</strong> {ticket.createdBy}</div>
          <div><strong>Assigned To:</strong> {ticket.assignedTo || 'Unassigned'}</div>
        </div>

        <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>Update Status</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${ticket.status === s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleStatusChange(s)}
                disabled={updating || ticket.status === s}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CommentSection comments={comments} onAddComment={handleAddComment} />
    </div>
  );
}
