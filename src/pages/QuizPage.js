import React from 'react';
import QuizGameScreen from '../components/Game/QuizGameScreen';
import { useNavigate } from 'react-router-dom';
import './QuizPage.css';

const QuizPage = () => {
  const navigate = useNavigate();

  return (
    <div className="quiz-page">
      <QuizGameScreen
        quizType="quiz"
        gameTitle="Vua Hỏi Ngu"
        onBackHome={() => navigate('/')}
      />
    </div>
  );
};

export default QuizPage;