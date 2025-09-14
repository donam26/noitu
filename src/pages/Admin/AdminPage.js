import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/Admin/LoginForm';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardPage from '../Admin/DashboardPage';
import QuizAdminPage from '../Admin/QuizAdminPage';
import BehaviorQuizAdminPage from '../Admin/BehaviorQuizAdminPage';
import KnowledgeQuizAdminPage from '../Admin/KnowledgeQuizAdminPage';
import WordleWordsPage from '../Admin/WordleWordsPage';
import AIAssistantPage from '../Admin/AIAssistantPage';
import './AdminPage.css';
import { authAPI } from '../../services/api';
/**
 * Component AdminPage - Trang quản trị chính
 * Route: /admin/*
 */
const AdminPage = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  console.log("AdminPage - Current path:", location.pathname);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("AdminPage - Checking auth...");
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          console.log("AdminPage - No token found");
          setIsAuth(false);
          setIsLoading(false);
          return;
        }
        
        // Kiểm tra token có hợp lệ không
        const response = await authAPI.checkAuth();
        console.log("AdminPage - Auth check response:", response);
        
        if (response && response.success) {
          console.log("AdminPage - Auth successful");
          setIsAuth(true);
          
          // Nếu đang ở trang /admin, chuyển hướng đến dashboard
          if (location.pathname === '/admin' || location.pathname === '/admin/') {
            console.log("AdminPage - Redirecting to dashboard");
            navigate('/admin/dashboard', { replace: true });
          }
        } else {
          console.log("AdminPage - Auth check failed, clearing token");
          localStorage.removeItem('adminToken');
          setIsAuth(false);
        }
      } catch (error) {
        console.error('AdminPage - Lỗi khi kiểm tra xác thực:', error);
        localStorage.removeItem('adminToken');
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  // Xử lý đăng nhập thành công
  const handleLogin = (success) => {
    console.log("AdminPage - Login success:", success);
    setIsAuth(true);
    navigate('/admin/dashboard', { replace: true });
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>🔍 Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, hiển thị form đăng nhập
  if (!isAuth) {
    console.log("AdminPage - Not authenticated, showing login form");
    return (
      <div className="admin-page">
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  console.log("AdminPage - Authenticated, showing admin routes");
  
  // Nếu đã đăng nhập, hiển thị layout admin với routing
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      
      <Route path="dashboard" element={
        <AdminLayout>
          <DashboardPage />
        </AdminLayout>
      } />
      
      <Route path="quiz" element={
        <AdminLayout>
          <QuizAdminPage />
        </AdminLayout>
      } />
      
      <Route path="behavior" element={
        <AdminLayout>
          <BehaviorQuizAdminPage />
        </AdminLayout>
      } />
      
      <Route path="knowledge" element={
        <AdminLayout>
          <KnowledgeQuizAdminPage />
        </AdminLayout>
      } />

      <Route path="vocabulary" element={
        <AdminLayout>
          <WordleWordsPage />
        </AdminLayout>
      } />

      <Route path="ai" element={
        <AdminLayout>
          <AIAssistantPage />
        </AdminLayout>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminPage; 