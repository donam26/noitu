import React from 'react';
import './AdminFooter.css';

/**
 * AdminFooter component - Footer for admin interface
 */
const AdminFooter = () => {
  return (
    <footer className="admin-footer">
      <div className="admin-footer-content">
        <div className="admin-footer-info">
          <p>© {new Date().getFullYear()} Admin Dashboard</p>
        </div>
        <div className="admin-footer-version">
          <p>v1.0.0</p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter; 