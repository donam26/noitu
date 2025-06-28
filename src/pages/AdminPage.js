import React, { useState, useEffect } from 'react';
import LoginForm from '../components/Admin/LoginForm';
import AdminPanel from '../components/Admin/AdminPanel';
import './AdminPage.css';

/**
 * Component AdminPage - Trang quản trị chính
 * Route: /admin
 */
const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    // Giả lập delay kiểm tra auth
    setTimeout(checkAuth, 300);
  }, []);

  const handleLogin = (success) => {
    setIsAuthenticated(success);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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

  return (
    <div className="admin-page">
      {isAuthenticated ? (
        <AdminPanel onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
};

export default AdminPage; 