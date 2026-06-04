import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutGrid, FileQuestion, Settings, Bell, Search, ChevronDown, UploadCloud } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();

  const navItems = [
    { path: '/app', label: 'Upload', icon: <UploadCloud size={16} />, end: true },
    { path: '/app/repository', label: 'Repository', icon: <LayoutGrid size={16} /> },
    { path: '/app/templates', label: 'Templates', icon: <FileQuestion size={16} /> },
    { path: '/app/settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <button className="sidebar-brand" onClick={() => navigate('/')}>
            <ShieldCheck size={18} className="brand-icon" />
            <span className="brand-name">Contract Sentinel</span>
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

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">KS</div>
            <div className="user-meta">
              <span className="user-name">Kamlesh Singh</span>
              <span className="user-plan">Free plan</span>
            </div>
            <ChevronDown size={14} className="user-chevron" />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <div className="topbar-search-wrapper">
            <Search size={14} className="topbar-search-icon" />
            <input
              type="text"
              placeholder="Search contracts, clauses, counterparties..."
              className="topbar-search-input"
            />
            <kbd className="topbar-kbd">⌘K</kbd>
          </div>
          <div className="topbar-right">
            <button className="btn-icon" style={{ position: 'relative' }}>
              <Bell size={16} />
              <span className="notif-pip" />
            </button>
            <div className="topbar-divider" />
            <button className="lang-toggle">
              <span className="lang-option active">EN</span>
              <span className="lang-sep">/</span>
              <span className="lang-option">हि</span>
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
