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
 */
const MainLayout = ({ 
  children, 
  showHeader = true, 
  showFooter = true 
}) => {
  return (
    <div className="main-layout">
      {showHeader && <Header />}
      
      <main className="main-content">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout; 