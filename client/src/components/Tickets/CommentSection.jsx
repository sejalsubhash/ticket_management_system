import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

export default function CommentSection({ comments, onAddComment }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await onAddComment(text);
      setText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Comments ({comments.length})</h3>

      <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
        {comments.length === 0 && <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>No comments yet.</p>}
        {comments.map((c) => (
          <div key={c.id} style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ fontSize: '0.875rem' }}>{c.userName}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <p style={{ fontSize: '0.875rem' }}>{c.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !text.trim()}>
          <FiSend />
        </button>
      </form>
    </div>
  );
}
