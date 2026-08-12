import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import CommentSection from '../components/Tickets/CommentSection';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiTrash2, FiPaperclip, FiDownload } from 'react-icons/fi';
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

  const handleAddComment = async (formData) => {
    try {
      const res = await api.post(`/tickets/${id}/comments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.8' }}>{ticket.description}</p>
        </div>

        <div className="ticket-meta">
          <div><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
          <div><strong>Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}</div>
          <div><strong>Created By:</strong> {ticket.createdBy}</div>
          <div><strong>Assigned To:</strong> {ticket.assignedTo || 'Unassigned'}</div>
        </div>

        {ticket.attachments && ticket.attachments.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FiPaperclip /> Attachments ({ticket.attachments.length})
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ticket.attachments.map((file, index) => (
                <a
                  key={index}
                  href={`/uploads/${file.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FiDownload /> {file.originalname}
                </a>
              ))}
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>Update Status</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${ticket.status === s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleStatusChange(s)}
                disabled={updating || ticket.status === s}
              >
                {updating && ticket.status !== s ? <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span> : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CommentSection comments={comments} onAddComment={handleAddComment} />
    </div>
  );
}
