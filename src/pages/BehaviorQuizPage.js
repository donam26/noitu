import React from 'react';
import QuizGameScreen from '../components/Game/QuizGameScreen';
import { useNavigate } from 'react-router-dom';
import './BehaviorQuizPage.css';

const BehaviorQuizPage = () => {
  const navigate = useNavigate();

  return (
    <div className="behavior-quiz-page">
      <QuizGameScreen
        quizType="behavior"
        gameTitle="Vua Ứng Xử"
        onBackHome={() => navigate('/')}
      />
    </div>
  );
};

export default BehaviorQuizPage;