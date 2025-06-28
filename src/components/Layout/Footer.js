import React from 'react';
import './Footer.css';

/**
 * Component Footer - Chân trang
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Game Hub</h3>
            <p className="footer-description">
              Bộ sưu tập các trò chơi trí tuệ giúp rèn luyện tư duy và từ vựng tiếng Việt.
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-subtitle">Trò chơi</h4>
            <ul className="footer-links">
              <li><span className="footer-link">Game Nối Từ</span></li>
              <li><span className="footer-link">Đố Vui (Coming Soon)</span></li>
              <li><span className="footer-link">Ô Chữ (Coming Soon)</span></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Game Hub. Được tạo với ❤️ bằng React.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 