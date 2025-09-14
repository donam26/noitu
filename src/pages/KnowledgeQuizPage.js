import React from 'react';
import QuizGameScreen from '../components/Game/QuizGameScreen';
import { useNavigate } from 'react-router-dom';
import './KnowledgeQuizPage.css';

const KnowledgeQuizPage = () => {
  const navigate = useNavigate();

  return (
    <div className="knowledge-quiz-page">
      <QuizGameScreen
        quizType="knowledge"
        gameTitle="Vua Kiến Thức"
        onBackHome={() => navigate('/')}
      />
    </div>
  );
};

export default KnowledgeQuizPage;