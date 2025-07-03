import React from 'react';
import KnowledgeQuizScreen from '../components/Game/KnowledgeQuizScreen';
import { useNavigate } from 'react-router-dom';
import './KnowledgeQuizPage.css';

/**
 * Component KnowledgeQuizPage - Trang chơi game Vua Kiến Thức
 */
const KnowledgeQuizPage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="quiz-page knowledge-quiz-page">
      <KnowledgeQuizScreen onBackHome={handleBackHome} />
    </div>
  );
};

export default KnowledgeQuizPage; 