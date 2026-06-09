import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, FileQuestion, Settings, Bell, Search,
  ChevronUp, UploadCloud, User, LogOut, LogIn, UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import logoImg from '../images/logo.png';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, t } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const navItems = [
    { path: '/app', label: t('nav.upload'), icon: <UploadCloud size={16} />, end: true },
    { path: '/app/repository', label: t('nav.repository'), icon: <LayoutGrid size={16} /> },
    { path: '/app/settings', label: t('nav.settings'), icon: <Settings size={16} /> },
  ];

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <button className="sidebar-brand" onClick={() => navigate('/')}>
            <img src={logoImg} alt="Vakya" className="sidebar-logo-img" />
          </button>

          <nav className="sidebar-nav">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ── Sidebar Bottom: User ── */}
        <div className="sidebar-bottom" ref={menuRef}>
          {isLoggedIn && user ? (
            <>
              {/* Profile popup menu */}
              {menuOpen && (
                <div className="user-popup" role="menu">
                  <div className="user-popup-header">
                    <div className="user-popup-avatar">
                      {user.photo
                        ? <img src={user.photo} alt={user.name} className="user-popup-photo" />
                        : <span>{getInitials(user.name)}</span>
                      }
                    </div>
                    <div className="user-popup-info">
                      <span className="user-popup-name">{user.name}</span>
                      <span className="user-popup-email">{user.email}</span>
                    </div>
                  </div>
                  <div className="user-popup-divider" />
                  <button
                    className="user-popup-item"
                    onClick={() => { navigate('/app/profile'); setMenuOpen(false); }}
                  >
                    <User size={14} /> {t('nav.profile')}
                  </button>
                  <button
                    className="user-popup-item"
                    onClick={() => { navigate('/app/settings'); setMenuOpen(false); }}
                  >
                    <Settings size={14} /> {t('nav.settings')}
                  </button>
                  <div className="user-popup-divider" />
                  <button
                    className="user-popup-item danger"
                    onClick={() => { logout(); navigate('/login'); setMenuOpen(false); }}
                  >
                    <LogOut size={14} /> {t('auth.signout')}
                  </button>
                </div>
              )}

              <div
                className="sidebar-user"
                onClick={() => setMenuOpen(m => !m)}
                role="button"
                aria-expanded={menuOpen}
              >
                <div className="user-avatar">
                  {user.photo
                    ? <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : getInitials(user.name)
                  }
                </div>
                <div className="user-meta">
                  <span className="user-name">{user.name}</span>
                </div>
                <ChevronUp
                  size={14}
                  className="user-chevron"
                  style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                />
              </div>
            </>
          ) : (
            <div className="sidebar-auth-btns">
              <button
                className="sidebar-signin-btn"
                onClick={() => navigate('/login')}
              >
                <LogIn size={14} />
                {t('auth.signin')}
              </button>
              <button
                className="sidebar-signup-btn"
                onClick={() => navigate('/login')}
              >
                <UserPlus size={14} />
                {t('auth.signup')}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="app-main">
        {/* Topbar */}
        <header className="app-topbar">

          <div className="topbar-right">
            <button className="btn-icon" style={{ position: 'relative' }}>
              <Bell size={16} />
              <span className="notif-pip" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
