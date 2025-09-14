import React from 'react';
import UserHeader from '../components/User/UserHeader';
import './UserLayout.css';

/**
 * Component UserLayout - Layout for user-facing pages
 * @param {Object} props - Props của component
 * @param {React.ReactNode} props.children - Nội dung trang
 * @param {boolean} props.showHeader - Hiển thị header (mặc định: true)
 * @param {boolean} props.showFooter - Hiển thị footer (mặc định: true)
 * @param {boolean} props.fullscreen - Chế độ toàn màn hình cho game (mặc định: false)
 * @param {string} props.layoutType - Loại layout: 'default', 'game', 'home' (mặc định: 'default')
 */
const UserLayout = ({ 
  children, 
  showHeader = true, 
  showFooter = true,
  fullscreen = false,
  layoutType = 'default'
}) => {
  // Xác định các class dựa trên props
  const layoutClasses = [
    'user-layout',
    fullscreen ? 'fullscreen' : '',
    `layout-${layoutType}`
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      {showHeader && <UserHeader layoutType={layoutType} />}
      <main className="user-content">
        {children}
      </main>
    </div>
  );
};

export default UserLayout; 