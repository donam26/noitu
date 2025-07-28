import React from 'react';
import WordChainManager from '../../components/Admin/WordChainManager';
import './WordChainAdminPage.css';

/**
 * WordChainAdminPage - Trang quản lý từ vựng cho game nối từ
 * Lưu ý: Đây là trang ADMIN, không phải trang chơi game
 */
const WordChainAdminPage = () => {
  return (
    <div className="wordchain-admin-page">
      <h1 className="page-title">Quản lý từ vựng nối từ</h1>
      <WordChainManager />
    </div>
  );
};

export default WordChainAdminPage; 