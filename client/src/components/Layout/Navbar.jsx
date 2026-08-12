import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiTag, FiLogOut, FiUser, FiShield, FiGrid, FiSun, FiMoon, FiLock } from 'react-icons/fi';
import ChangePasswordModal from '../Auth/ChangePasswordModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--gray-400)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
          {user && (
            <>
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiUser /> {user.name}
                <span className="badge" style={{ background: 'var(--gray-700)', color: 'var(--gray-300)', marginLeft: '4px' }}>{user.role}</span>
              </span>
              <button
                onClick={() => setShowChangePassword(true)}
                style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Change Password"
              >
                <FiLock />
              </button>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiLogOut /> Logout
              </button>
            </>
          )}
        </div>
      </nav>
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </>
  );
}
