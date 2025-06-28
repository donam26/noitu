import React from 'react';
import QuizScreen from '../components/Game/QuizScreen';
import { useNavigate } from 'react-router-dom';
import './QuizPage.css';

/**
 * Component QuizPage - Trang chơi game quiz
 */
const QuizPage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="quiz-page">
      <QuizScreen onBackHome={handleBackHome} />
    </div>
  );
};

export default QuizPage; 