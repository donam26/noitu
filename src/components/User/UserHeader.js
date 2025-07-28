import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './UserHeader.css';

/**
 * Component UserHeader - Header for user interface
 * @param {Object} props - Props của component
 * @param {string} props.layoutType - Loại layout: 'default', 'game', 'home'
 */
const UserHeader = ({ layoutType = 'default' }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Define classes based on layout type
  const headerClasses = [
    'user-header',
    `header-${layoutType}`
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      <div className="user-header-container">
        <div className="user-logo">
          <Link to="/" className="logo-link">
            <h1 className="logo-title">Game Hub</h1>
            <span className="logo-subtitle">Trò chơi trí tuệ</span>
          </Link>
        </div>
        
        {!isHomePage && (
          <nav className="user-nav">
            <Link to="/" className="nav-link">
              <span className="nav-icon">🏠</span>
              Trang chủ
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default UserHeader; 