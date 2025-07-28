import React from 'react';
import { useNavigate } from 'react-router-dom';
import UniverseAnswerScreen from '../components/Game/UniverseAnswerScreen';
import './UniverseAnswerPage.css';

/**
 * Component UniverseAnswerPage - Trang chơi game "Câu trả lời từ vũ trụ"
 */
const UniverseAnswerPage = () => {
  const navigate = useNavigate();
  
  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="game-screen">
      <UniverseAnswerScreen onBackHome={handleBackHome} />
    </div>
  );
};

export default UniverseAnswerPage; 