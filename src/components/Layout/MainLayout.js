import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './MainLayout.css';

/**
 * Component MainLayout - Layout chính của ứng dụng
 * @param {Object} props - Props của component
 * @param {React.ReactNode} props.children - Nội dung trang
 * @param {boolean} props.showHeader - Hiển thị header (mặc định: true)
 * @param {boolean} props.showFooter - Hiển thị footer (mặc định: true)
 * @param {boolean} props.fullscreen - Chế độ toàn màn hình cho game (mặc định: false)
 * @param {string} props.layoutType - Loại layout: 'default', 'game', 'home' (mặc định: 'default')
 */
const MainLayout = ({ 
  children, 
  showHeader = true, 
  showFooter = true,
  fullscreen = false,
  layoutType = 'default'
}) => {
  // Xác định các class dựa trên props
  const layoutClasses = [
    'main-layout',
    fullscreen ? 'fullscreen' : '',
    `layout-${layoutType}`
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      {showHeader && <Header layoutType={layoutType} />}
      
      <main className="main-content">
        {children}
      </main>
      
      {showFooter && <Footer layoutType={layoutType} />}
    </div>
  );
};

export default MainLayout; 