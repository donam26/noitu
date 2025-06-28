import React from 'react';
import WordScrambleScreen from '../components/Game/WordScrambleScreen';
import { useNavigate } from 'react-router-dom';
import './WordScramblePage.css';

/**
 * Component WordScramblePage - Trang chơi game sắp xếp từ
 */
const WordScramblePage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="word-scramble-page">
      <WordScrambleScreen onBackHome={handleBackHome} />
    </div>
  );
};

export default WordScramblePage; 