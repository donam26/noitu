import React from 'react';
import BehaviorQuizScreen from '../components/Game/BehaviorQuizScreen';
import { useNavigate } from 'react-router-dom';
import './BehaviorQuizPage.css';

/**
 * Component BehaviorQuizPage - Trang chơi game Vua Ứng Xử
 */
const BehaviorQuizPage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="quiz-page behavior-quiz-page">
      <BehaviorQuizScreen onBackHome={handleBackHome} />
    </div>
  );
};

export default BehaviorQuizPage; 