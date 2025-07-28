import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

/**
 * Component Header - Thanh điều hướng chính
 * @param {Object} props - Props của component
 * @param {string} props.layoutType - Loại layout: 'default', 'game', 'home' (mặc định: 'default')
 */
const Header = ({ layoutType = 'default' }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Xác định class dựa trên loại layout
  const headerClasses = [
    'header',
    `header-${layoutType}`
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      <div className="header-container">
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <h1 className="logo-title">Game Hub</h1>
            <span className="logo-subtitle">Trò chơi trí tuệ</span>
          </Link>
        </div>
        
        {!isHomePage && (
          <nav className="nav-menu">
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

export default Header; 