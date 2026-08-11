import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { FiEye } from 'react-icons/fi';

export default function TicketList({ tickets }) {
  if (!tickets.length) {
    return <div className="empty-state"><p>No tickets found.</p></div>;
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Category</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                {ticket.id?.slice(-8)}
              </td>
              <td><strong>{ticket.title}</strong></td>
              <td><StatusBadge status={ticket.status} /></td>
              <td><PriorityBadge priority={ticket.priority} /></td>
              <td>{ticket.category}</td>
              <td style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                {new Date(ticket.createdAt).toLocaleDateString()}
              </td>
              <td>
                <Link to={`/tickets/${ticket.id}`} className="btn btn-sm btn-secondary">
                  <FiEye /> View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
