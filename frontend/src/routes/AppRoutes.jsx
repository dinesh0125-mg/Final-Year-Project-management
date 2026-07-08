import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import { lazy, Suspense } from 'react';

// Public Pages
const Home = lazy(() => import('../pages/public/Home'));
const Features = lazy(() => import('../pages/public/Features'));
const Projects = lazy(() => import('../pages/public/Projects'));
const Guides = lazy(() => import('../pages/public/Guides'));
const About = lazy(() => import('../pages/public/About'));
const Contact = lazy(() => import('../pages/public/Contact'));
const Login = lazy(() => import('../pages/public/Login'));
const Register = lazy(() => import('../pages/public/Register'));
const ForgotPassword = lazy(() => import('../pages/public/ForgotPassword'));

// Layouts
const DashboardLayout = lazy(() => import('../components/layout/DashboardLayout'));
const GuideDashboardLayout = lazy(() => import('../components/layout/GuideDashboardLayout'));
const HodDashboardLayout = lazy(() => import('../components/layout/HodDashboardLayout'));
const AdminDashboardLayout = lazy(() => import('../components/layout/AdminDashboardLayout'));

// Student Pages
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const ProjectsDashboard = lazy(() => import('../pages/student/Projects'));
const Milestones = lazy(() => import('../pages/student/Milestones'));
const Documents = lazy(() => import('../pages/student/Documents'));
const Meetings = lazy(() => import('../pages/student/Meetings'));
const Reviews = lazy(() => import('../pages/student/Reviews'));
const Teams = lazy(() => import('../pages/student/Teams'));
const Notifications = lazy(() => import('../pages/student/Notifications'));
const VivaSchedule = lazy(() => import('../pages/student/VivaSchedule'));
const Settings = lazy(() => import('../pages/student/Settings'));

// Guide Pages
const GuideDashboard = lazy(() => import('../pages/guide/GuideDashboard'));
const GuideStudents = lazy(() => import('../pages/guide/GuideStudents'));
const GuideReviews = lazy(() => import('../pages/guide/GuideReviews'));
const GuideMeetings = lazy(() => import('../pages/guide/GuideMeetings'));
const GuideMilestones = lazy(() => import('../pages/guide/GuideMilestones'));
const GuideSettings = lazy(() => import('../pages/guide/GuideSettings'));

// HOD Pages
const HodDashboard = lazy(() => import('../pages/hod/HodDashboard'));
const HodProjects = lazy(() => import('../pages/hod/HodProjects'));
const HodGuides = lazy(() => import('../pages/hod/HodGuides'));
const HodApprovals = lazy(() => import('../pages/hod/HodApprovals'));
const HodMilestones = lazy(() => import('../pages/hod/HodMilestones'));
const HodSettings = lazy(() => import('../pages/hod/HodSettings'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminProjects = lazy(() => import('../pages/admin/AdminProjects'));
const AdminDepartments = lazy(() => import('../pages/admin/AdminDepartments'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, logout } = useAuth();

  // Demo Session Expiration Timer (30 mins)
  useEffect(() => {
    const demoStart = localStorage.getItem('demo_session_start');
    if (!demoStart || !user) return;

    const checkTimer = setInterval(() => {
      const elapsed = Date.now() - parseInt(demoStart);
      if (elapsed > 30 * 60 * 1000) { // 30 minutes
        clearInterval(checkTimer);
        alert('Demo session expired after 30 minutes. Please log in with a real account.');
        localStorage.removeItem('demo_session_start');
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTimer);
  }, [user, logout]);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Student Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="teams" element={<Teams />} />
          <Route path="projects" element={<ProjectsDashboard />} />
          <Route path="milestones" element={<Milestones />} />
          <Route path="documents" element={<Documents />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="viva" element={<VivaSchedule />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Protected Guide Routes */}
        <Route path="/guide" element={<ProtectedRoute allowedRoles={['GUIDE']}><GuideDashboardLayout /></ProtectedRoute>}>
          <Route index element={<GuideDashboard />} />
          <Route path="students" element={<GuideStudents />} />
          <Route path="reviews" element={<GuideReviews />} />
          <Route path="meetings" element={<GuideMeetings />} />
          <Route path="milestones" element={<GuideMilestones />} />
          <Route path="settings" element={<GuideSettings />} />
        </Route>

        {/* Protected HOD Routes */}
        <Route path="/hod" element={<ProtectedRoute allowedRoles={['HOD']}><HodDashboardLayout /></ProtectedRoute>}>
          <Route index element={<HodDashboard />} />
          <Route path="projects" element={<HodProjects />} />
          <Route path="guides" element={<HodGuides />} />
          <Route path="approvals" element={<HodApprovals />} />
          <Route path="milestones" element={<HodMilestones />} />
          <Route path="settings" element={<HodSettings />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboardLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
