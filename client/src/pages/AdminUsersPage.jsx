import { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { FiShield } from 'react-icons/fi';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRole(userId);
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Role updated');
    } catch (err) {
      toast.error('Failed to update role');
    } finally {
      setUpdatingRole(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FiShield /> User Management</h1>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.department || '-'}</td>
                <td><span className="badge badge-open">{u.role}</span></td>
                <td>
                  {updatingRole === u.id ? (
                    <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', fontSize: '0.875rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    >
                      <option value="user">User</option>
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
