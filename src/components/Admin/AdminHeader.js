import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { authAPI } from '../../services/api';
import { showSuccess } from '../../utils/toast';
import './AdminHeader.css';

/**
 * AdminHeader component - Header for admin interface
 */
const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authAPI.logout();
    showSuccess('Đã đăng xuất thành công');
    navigate('/admin', { replace: true });
  };

  return (
    <header className="admin-header">
      <div className="admin-header-content">
        <div className="admin-header-title">
          <h1>⚡ Admin Dashboard</h1>
        </div>
        
        <div className="admin-header-actions">
          <span className="admin-user-info">👤 Admin</span>
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="logout-btn"
          >
            🚪 Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 