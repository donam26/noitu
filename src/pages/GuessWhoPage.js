import React from 'react';
import GuessWhoScreen from '../components/Game/GuessWhoScreen';
import { useNavigate } from 'react-router-dom';
import './GuessWhoPage.css';

/**
 * Component GuessWhoPage - Trang chơi game "Tôi là ai"
 */
const GuessWhoPage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="guess-who-page">
      <GuessWhoScreen onBackHome={handleBackHome} />
    </div>
  );
};

export default GuessWhoPage; 