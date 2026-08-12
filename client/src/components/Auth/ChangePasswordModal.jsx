import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiLock, FiSave, FiX } from 'react-icons/fi';

export default function ChangePasswordModal({ onClose }) {
  const { logout } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2><FiLock /> Change Password</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span> Updating...</> : <><FiSave /> Update Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
