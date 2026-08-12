import { useState } from 'react';
import { FiX, FiUpload, FiFileText } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function BulkImportModal({ onClose, onComplete }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.name.endsWith('.json') && !selected.name.endsWith('.csv')) {
      toast.error('Please upload a JSON or CSV file');
      return;
    }

    setFile(selected);
    setResults(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let data;
        if (selected.name.endsWith('.json')) {
          data = JSON.parse(event.target.result);
          if (!Array.isArray(data)) data = [data];
        } else {
          const lines = event.target.result.split('\n').filter(l => l.trim());
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          data = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((h, i) => { obj[h] = values[i]?.trim() || ''; });
            return obj;
          });
        }
        setPreview(data.slice(0, 5));
      } catch {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(selected);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        let tickets;
        if (file.name.endsWith('.json')) {
          tickets = JSON.parse(event.target.result);
          if (!Array.isArray(tickets)) tickets = [tickets];
        } else {
          const lines = event.target.result.split('\n').filter(l => l.trim());
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          tickets = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((h, i) => { obj[h] = values[i]?.trim() || ''; });
            return obj;
          });
        }

        try {
          const res = await api.post('/tickets/bulk', { tickets });
          setResults(res.data);
          if (res.data.imported > 0) {
            toast.success(`Imported ${res.data.imported} tickets`);
            onComplete();
          }
          if (res.data.failed > 0) {
            toast.error(`${res.data.failed} tickets failed to import`);
          }
        } catch (err) {
          toast.error(err.response?.data?.error || 'Import failed');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } catch {
      setLoading(false);
      toast.error('Failed to read file');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2><FiUpload /> Bulk Import Tickets</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}><FiX /></button>
        </div>

        {!results ? (
          <>
            <div className="form-group">
              <label>Upload JSON or CSV file</label>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileChange}
                style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <p><strong>JSON format:</strong> Array of objects with title, description, priority, category</p>
              <p><strong>CSV format:</strong> Headers: title, description, priority, category</p>
            </div>

            {preview.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Preview (first 5 rows)</h4>
                <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
                  <table className="table" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Priority</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((t, i) => (
                        <tr key={i}>
                          <td>{t.title || '-'}</td>
                          <td>{t.priority || 'medium'}</td>
                          <td>{t.category || 'other'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleImport} disabled={loading || !file}>
                {loading ? <><span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span> Importing...</> : <><FiFileText /> Import {preview.length > 0 ? `(${preview.length}+ tickets)` : ''}</>}
              </button>
            </div>
          </>
        ) : (
          <div>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>Import Complete</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--success)', fontWeight: '600' }}>{results.imported}</span> tickets imported
                {results.failed > 0 && (
                  <>, <span style={{ color: 'var(--danger)', fontWeight: '600' }}>{results.failed}</span> failed</>
                )}
              </p>
            </div>

            {results.errors && results.errors.length > 0 && (
              <div style={{ maxHeight: '150px', overflow: 'auto', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>Errors</h4>
                {results.errors.map((err, i) => (
                  <p key={i} style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>
                    Row {err.index + 1}: {err.error}
                  </p>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
