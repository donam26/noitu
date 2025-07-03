import React from 'react';
import UniverseAnswerScreen from '../components/Game/UniverseAnswerScreen';
import { useNavigate } from 'react-router-dom';
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
    <div className="universe-answer-page">
      <UniverseAnswerScreen onBackHome={handleBackHome} />
    </div>
  );
};

export default UniverseAnswerPage; 