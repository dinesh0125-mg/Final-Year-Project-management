import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { notificationAPI } from '../../api/api';
import { 
  FiHome, FiFolder, FiCheckSquare, FiFileText, 
  FiCalendar, FiMessageSquare, FiSettings, FiLogOut, FiMenu, FiX,
  FiUsers, FiAward, FiBell
} from 'react-icons/fi';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationAPI.unreadCount().then(res => setUnreadCount(res.data.data.count)).catch(() => {});
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth >= 992) {
      setIsMinimized(!isMinimized);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <FiHome /> },
    { name: 'My Team', path: '/dashboard/teams', icon: <FiUsers /> },
    { name: 'Projects', path: '/dashboard/projects', icon: <FiFolder /> },
    { name: 'Milestones', path: '/dashboard/milestones', icon: <FiCheckSquare /> },
    { name: 'Documents', path: '/dashboard/documents', icon: <FiFileText /> },
    { name: 'Meetings', path: '/dashboard/meetings', icon: <FiCalendar /> },
    { name: 'Reviews', path: '/dashboard/reviews', icon: <FiMessageSquare /> },
    { name: 'Viva Schedule', path: '/dashboard/viva', icon: <FiAward /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <FiSettings /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Navbar />
      <div className="dashboard-layout" style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''} ${isMinimized ? 'minimized' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo.png" alt="ProjectHub Logo" className="logo-image" />
            <span>ProjectHub</span>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            <FiX />
          </button>
        </div>
        <div className="sidebar-role-badge">Student Portal</div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="link-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">

          <button className="logout-btn" onClick={logout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <FiMenu />
          </button>
          <div className="header-search">
             <input type="text" placeholder="Search..." className="search-input" />
          </div>
          <div className="header-actions">
            <Link to="/dashboard/notifications" className="notification-bell" style={{ textDecoration: 'none', color: 'inherit' }}>
              <FiBell size={20} />
              {unreadCount > 0 && <span className="notification-dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'white', width: '16px', height: '16px', right: '-4px', top: '-4px' }}>{unreadCount}</span>}
            </Link>
          </div>
        </header>
        
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
    </div>
  );
};

export default DashboardLayout;
