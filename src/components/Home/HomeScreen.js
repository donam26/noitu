import React from 'react';
import Button from '../common/Button';
import { MESSAGES } from '../../utils/constants';
import './HomeScreen.css';

/**
 * Component HomeScreen - Màn hình chính của game
 * @param {Object} props - Props của component
 * @param {Function} props.onStartGame - Callback khi bắt đầu game
 */
const HomeScreen = ({ onStartGame }) => {
  return (
    <div className="home-screen">
      <div className="home-container">
        <div className="game-logo">
          <h1 className="game-title">{MESSAGES.GAME_TITLE}</h1>
          <div className="game-subtitle">
            <p>Nối từ tiếng Việt thông minh</p>
            <p>Bạn có 30 giây để nhập từ kế tiếp!</p>
          </div>
        </div>
        
        <div className="game-rules">
          <h3>Cách chơi:</h3>
          <ul>
            <li>Nhập từ mà âm đầu giống âm cuối của từ trước</li>
            <li>Ví dụ: "lau hau" → "hau ăn" → "ăn voi"</li>
            <li>Từ đơn âm: "xin" → "nói" → "ích"</li>
            <li>Mỗi lượt có 30 giây để suy nghĩ</li>
            <li>Từ phải có trong từ điển tiếng Việt</li>
          </ul>
        </div>
        
        <div className="start-section">
          <Button 
            variant="primary" 
            onClick={onStartGame}
            className="start-button"
          >
            {MESSAGES.START_GAME}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen; 