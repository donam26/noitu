import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import './HomePage.css';

/**
 * Component HomePage - Trang chủ hiển thị danh sách games
 */
const HomePage = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'word-chain',
      title: 'Vua Nối Từ',
      icon: '🔗',
      color: 'primary',
      available: true
    },
    {
      id: 'word-scramble',
      title: 'Vua Tiếng Việt',
      icon: '🔤',
      color: 'secondary',
      available: true
    },
    {
      id: 'quiz',
      title: 'Vua Hỏi Ngu',
      icon: '🤔',
      color: 'primary',
      available: true
    },
    {
      id: 'behavior-quiz',
      title: 'Vua Ứng Xử',
      icon: '🤝',
      color: 'secondary',
      available: true
    },
    {
      id: 'knowledge-quiz',
      title: 'Vua Kiến Thức',
      icon: '🧠',
      color: 'primary',
      available: true
    },
    {
      id: 'universe-answer',
      title: 'Câu trả lời từ vũ trụ',
      icon: '🌌',
      color: 'secondary',
      available: true
    },
    {
      id: 'guess-who',
      title: 'Tôi là ai',
      icon: '🕵️',
      color: 'primary',
      available: true
    },
    {
      id: 'wordle',
      title: 'Wordle Tiếng Việt',
      icon: '🎯',
      color: 'secondary',
      available: true
    }
  ];

  const handleGameClick = (gameId) => {
    if (gameId === 'word-chain') {
      navigate('/word-chain');
    } else if (gameId === 'word-scramble') {
      navigate('/word-scramble');
    } else if (gameId === 'quiz') {
      navigate('/quiz');
    } else if (gameId === 'behavior-quiz') {
      navigate('/behavior-quiz');
    } else if (gameId === 'knowledge-quiz') {
      navigate('/knowledge-quiz');
    } else if (gameId === 'universe-answer') {
      navigate('/universe-answer');
    } else if (gameId === 'guess-who') {
      navigate('/guess-who');
    } else if (gameId === 'wordle') {
      navigate('/wordle');
    } else {
      // Hiển thị thông báo coming soon
      alert('Game này đang được phát triển. Vui lòng quay lại sau!');
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Header Section */}
        <section className="hero-section fade-in">
          <h1 className="section-title text-center">Game Hub2</h1>
          <p className="section-subtitle text-center">
            Thư giãn và phát triển trí não với các trò chơi thú vị
          </p>
        </section>
        
        {/* Games Section */}
        <section className="games-section">
          <div className="games-grid">
            {games.map((game, index) => (
              <div 
                key={game.id} 
                className={`game-card slide-up ${!game.available ? 'disabled' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="game-content">
                  <h3 className="game-title">
                    <span className="game-icon">{game.icon}</span> {game.title}
                  </h3>
                </div>
                
                <div className="game-footer">
                  <Button
                    variant={game.color}
                    onClick={() => handleGameClick(game.id)}
                    disabled={!game.available}
                    className="play-button"
                  >
                    {game.available ? 'Chơi ngay' : 'Sắp ra mắt'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage; 