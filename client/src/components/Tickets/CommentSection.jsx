import { useState } from 'react';
import { FiSend, FiPaperclip } from 'react-icons/fi';

export default function CommentSection({ comments, onAddComment }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', text);
      files.forEach(file => formData.append('files', file));
      await onAddComment(formData);
      setText('');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Comments ({comments.length})</h3>

      <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
        {comments.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No comments yet.</p>}
        {comments.map((c) => (
          <div key={c.id} style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ fontSize: '0.875rem' }}>{c.userName}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <p style={{ fontSize: '0.875rem' }}>{c.text}</p>
            {c.attachments && c.attachments.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {c.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={`/uploads/${file.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    <FiPaperclip /> {file.originalname}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            disabled={loading}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || (!text.trim() && files.length === 0)}>
            {loading ? <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span> : <FiSend />}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <FiPaperclip /> Attach files
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.csv,.xlsx"
              style={{ display: 'none' }}
            />
          </label>
          {files.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {files.length} file(s) selected
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
