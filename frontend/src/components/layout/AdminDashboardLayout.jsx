import { useState } from 'react';
import Navbar from './Navbar';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FiHome, FiUsers, FiFolder, FiGrid, FiSettings, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';
import './DashboardLayout.css';

const adminNavItems = [
  { name: 'Overview', path: '/admin', icon: <FiHome /> },
  { name: 'Users', path: '/admin/users', icon: <FiUsers /> },
  { name: 'Projects', path: '/admin/projects', icon: <FiFolder /> },
  { name: 'Departments', path: '/admin/departments', icon: <FiGrid /> },
  { name: 'Settings', path: '/admin/settings', icon: <FiSettings /> },
];

const AdminDashboardLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const toggleSidebar = () => {
    if (window.innerWidth >= 992) {
      setIsMinimized(!isMinimized);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Navbar />
      <div className="dashboard-layout" style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''} ${isMinimized ? 'minimized' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo.png" alt="ProjectHub Logo" className="logo-image" />
            <span>ProjectHub</span>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar}><FiX /></button>
        </div>
        <div className="sidebar-role-badge" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>Admin Portal</div>
        <nav className="sidebar-nav">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="link-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">

          <button className="logout-btn" onClick={logout}><FiLogOut /><span>Logout</span></button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}><FiMenu /></button>
          <div className="header-search">
            <input type="text" placeholder="Search users, projects, departments..." className="search-input" />
          </div>
          <div className="header-actions">
            <div className="notification-bell">
              <span className="bell-icon"></span>
              <span className="notification-dot"></span>
            </div>
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

export default AdminDashboardLayout;
