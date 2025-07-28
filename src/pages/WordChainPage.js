import React from 'react';
import GameScreen from '../components/Game/GameScreen';
import { useNavigate } from 'react-router-dom';
import './WordChainPage.css';

/**
 * Component WordChainPage - Trang chơi game nối từ
 * Lưu ý: Trang này chỉ sử dụng MainLayout, không liên quan đến AdminLayout
 */
const WordChainPage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="word-chain-page">
      <GameScreen onBackHome={handleBackHome} />
    </div>
  );
};

export default WordChainPage; 