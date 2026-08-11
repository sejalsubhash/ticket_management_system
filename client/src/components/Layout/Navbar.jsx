import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiTag, FiLogOut, FiUser, FiShield, FiGrid } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'var(--gray-900)',
      color: 'white',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '56px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to="/" style={{ color: 'white', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiTag /> Helpdesk
        </Link>
        {user && (
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/" style={{ color: 'var(--gray-300)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FiGrid /> Dashboard
            </Link>
            <Link to="/tickets" style={{ color: 'var(--gray-300)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FiTag /> Tickets
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin/users" style={{ color: 'var(--gray-300)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiShield /> Users
              </Link>
            )}
          </div>
        )}
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiUser /> {user.name}
            <span className="badge" style={{ background: 'var(--gray-700)', color: 'var(--gray-300)', marginLeft: '4px' }}>{user.role}</span>
          </span>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiLogOut /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
