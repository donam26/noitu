import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

/**
 * Component Header - Thanh điều hướng chính
 */
const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="header">
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