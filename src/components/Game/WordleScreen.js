import React, { useState, useEffect, useCallback } from 'react';
import Button from '../common/Button';
import './WordleScreen.css';
import {
  createInitialGameState,
  handleLetterInput,
  handleBackspace,
  handleSubmitGuess,
  handleHint,
  getElapsedTime,
  VIETNAMESE_KEYBOARD_ROWS,
  LETTER_STATES,
  GAME_STATUS
} from '../../utils/wordleLogic';

// Simple confetti effect
const createConfetti = () => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];
  const confettiCount = 150;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';
    confetti.style.width = Math.random() * 12 + 4 + 'px';
    confetti.style.height = confetti.style.width;
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    confetti.style.animation = `confetti-fall ${Math.random() * 2 + 2}s ease-out forwards`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 4000);
  }
};

// Sound effects (mock - can be replaced with real audio)
const playSound = (type) => {
  // Mock sound effects - có thể thay bằng Web Audio API thực tế
  console.log(`🔊 Playing ${type} sound`);
};

const WordleScreen = () => {
  const [gameState, setGameState] = useState(createInitialGameState());
  const [message, setMessage] = useState('');
  const [showTutorial, setShowTutorial] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [wordMeaning, setWordMeaning] = useState(null);

  // Hiển thị thông báo tạm thời
  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setMessage('');
    setShowResultModal(false);
    setWordMeaning(null);
  }, []);

  // Xử lý nhập từ bàn phím
  const handleKeyInput = useCallback((key) => {
    if (key === 'ENTER') {
      const result = handleSubmitGuess(gameState);
      if (result.error) {
        showMessage(result.error, 'error');
        setGameState(result.gameState);
      } else {
        setGameState(result.gameState);
        setIsAnimating(true);
        
        // Animation cho các ô
        setTimeout(() => setIsAnimating(false), 500);
        
        if (result.isWin) {
          const time = getElapsedTime(gameState.startTime, result.gameState.finishTime);
          showMessage(`🎉 Chúc mừng! Bạn đã thắng trong ${time}!`, 'success');
          // Hiệu ứng pháo hoa và âm thanh
          playSound('win');
          createConfetti();
          setTimeout(() => {
            setShowResultModal(true);
          }, 1500);
        } else if (result.gameState.gameStatus === GAME_STATUS.LOST) {
          showMessage(`😢 Bạn đã thua! Từ cần tìm là: "${gameState.originalWord}"`, 'error');
          playSound('lose');
          setTimeout(() => {
            setShowResultModal(true);
          }, 1500);
        } else {
          // Âm thanh submit bình thường
          playSound('submit');
        }
      }
    } else if (key === 'BACKSPACE') {
      setGameState(handleBackspace(gameState));
      playSound('key');
    } else if (key.length === 1 && /[A-Z]/.test(key)) {
      setGameState(handleLetterInput(gameState, key));
      playSound('key');
    }
  }, [gameState, showMessage]);

  // Event listener cho bàn phím vật lý
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase();
      
      if (key === 'ENTER') {
        handleKeyInput('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyInput('BACKSPACE');
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyInput(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInput]);

  // Xử lý gợi ý
  const handleHintClick = () => {
    const result = handleHint(gameState);
    setGameState(result.gameState);
    showMessage(result.hintMessage, 'info');
  };

  // Cache để lưu kết quả checkGuess cho mỗi hàng
  const [rowResults, setRowResults] = useState({});

  // Cập nhật rowResults khi gameState thay đổi
  useEffect(() => {
    const newRowResults = {};
    for (let row = 0; row < gameState.currentRow; row++) {
      const guess = gameState.board[row].join('');
      if (guess.length === 7) {
        const { checkGuess } = require('../../utils/wordleLogic');
        newRowResults[row] = checkGuess(guess, gameState.targetWord);
      }
    }
    setRowResults(newRowResults);
  }, [gameState.board, gameState.currentRow, gameState.targetWord]);

  // Lấy trạng thái màu cho ô chữ
  const getCellState = (rowIndex, colIndex) => {
    if (rowIndex >= gameState.currentRow) return LETTER_STATES.EMPTY;
    
    const letter = gameState.board[rowIndex][colIndex];
    if (!letter) return LETTER_STATES.EMPTY;
    
    // Sử dụng kết quả đã cache
    const result = rowResults[rowIndex];
    if (result && result[colIndex]) {
      return result[colIndex];
    }
    
    return LETTER_STATES.EMPTY;
  };

  // Lấy trạng thái cho phím bàn phím
  const getKeyState = (key) => {
    return gameState.letterStates[key] || LETTER_STATES.EMPTY;
  };

  // Render bàn phím ảo
  const renderKeyboard = () => (
    <div className="wordle-keyboard">
      {VIETNAMESE_KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => (
            <button
              key={key}
              className={`keyboard-key ${getKeyState(key)} ${
                key === 'BACKSPACE' || key === 'ENTER' ? 'special-key' : ''
              }`}
              onClick={() => handleKeyInput(key)}
              disabled={gameState.gameStatus !== GAME_STATUS.PLAYING}
            >
              {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? '↵' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  // Render game board
  const renderBoard = () => (
    <div className="wordle-board">
      {gameState.board.map((row, rowIndex) => (
        <div key={rowIndex} className="wordle-row">
          {row.map((letter, colIndex) => (
            <div
              key={colIndex}
              className={`wordle-cell ${getCellState(rowIndex, colIndex)} ${
                isAnimating && rowIndex === gameState.currentRow - 1 ? 'flip-animation' : ''
              }`}
              style={{
                animationDelay: isAnimating ? `${colIndex * 100}ms` : '0ms'
              }}
            >
              {letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Tutorial Modal
  const TutorialModal = () => (
    showTutorial && (
      <div className="tutorial-overlay">
        <div className="tutorial-modal">
          <h2>🎯 Wordle Tiếng Việt</h2>
          <div className="tutorial-content">
            <p>Đoán từ tiếng Việt gồm <strong>7 chữ cái</strong> (không dấu, không khoảng trắng)</p>
            <p>Bạn có <strong>6 lượt</strong> để đoán đúng!</p>
            
            <div className="color-guide">
              <div className="color-example">
                <div className="example-cell correct">H</div>
                <span>🟩 Chữ đúng vị trí</span>
              </div>
              <div className="color-example">
                <div className="example-cell present">O</div>
                <span>🟨 Chữ đúng nhưng sai vị trí</span>
              </div>
              <div className="color-example">
                <div className="example-cell absent">X</div>
                <span>⬜ Chữ không có trong từ</span>
              </div>
            </div>

            <div className="tutorial-tips">
              <p><strong>Gợi ý:</strong></p>
              <ul>
                <li>Các từ phổ biến: "hoc sinh", "ban be", "gia dinh"...</li>
                <li>Sử dụng bàn phím ảo hoặc bàn phím thật</li>
                <li>Bạn có 3 lượt gợi ý miễn phí</li>
              </ul>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowTutorial(false)} 
            className="tutorial-close-btn"
          >
            Bắt đầu chơi
          </Button>
        </div>
      </div>
    )
  );

  // Result Modal
  const ResultModal = () => (
    showResultModal && (
      <div className="tutorial-overlay">
        <div className="result-modal">
          <div className="result-header">
            {gameState.gameStatus === GAME_STATUS.WON ? (
              <>
                <h2>🎉 Chúc mừng!</h2>
                <p className="result-subtitle">Bạn đã đoán đúng từ!</p>
              </>
            ) : (
              <>
                <h2>😢 Thất bại!</h2>
                <p className="result-subtitle">Hết lượt đoán rồi!</p>
              </>
            )}
          </div>
          
          <div className="result-content">
            <div className="word-reveal">
              <h3>Từ cần tìm:</h3>
              <div className="target-word">
                <span className="original-word">"{gameState.originalWord}"</span>
                <span className="normalized-word">({gameState.targetWord})</span>
              </div>
            </div>

            {gameState.gameStatus === GAME_STATUS.WON && (
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-label">Thời gian:</span>
                  <span className="stat-value">
                    {getElapsedTime(gameState.startTime, gameState.finishTime)}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Số lượt:</span>
                  <span className="stat-value">{gameState.currentRow}/6</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Gợi ý đã dùng:</span>
                  <span className="stat-value">{gameState.hintCount}/3</span>
                </div>
              </div>
            )}

            <div className="word-meaning">
              <h4>Cấu trúc từ:</h4>
              <p>{gameState.syllableHint}</p>
            </div>
          </div>
          
          <div className="result-actions">
            <Button 
              onClick={resetGame} 
              className="play-again-btn"
              variant="primary"
            >
              🎮 Chơi lại
            </Button>
            <Button 
              onClick={() => setShowResultModal(false)} 
              className="close-modal-btn"
              variant="secondary"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="wordle-container">
      <TutorialModal />
      <ResultModal />
      
      <h1>🎯 Wordle Tiếng Việt</h1>

      {message && (
        <div className={`game-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="game-area">
        {renderBoard()}
        
        <div className="game-controls">
          <Button 
            onClick={handleHintClick}
            disabled={gameState.hintCount >= 3 || gameState.gameStatus !== GAME_STATUS.PLAYING}
            className="hint-btn"
          >
            💡 Gợi ý ({3 - gameState.hintCount} lượt)
          </Button>
          
          <Button onClick={() => setShowTutorial(true)} className="help-btn">
            ❓ Hướng dẫn
          </Button>
          
          <Button onClick={resetGame} className="reset-btn">
            🔄 Chơi lại
          </Button>
        </div>

        {gameState.syllableHint && (
          <div className="syllable-hint">
            <strong>Cấu trúc:</strong> {gameState.syllableHint}
          </div>
        )}
        
        {renderKeyboard()}
      </div>
    </div>
  );
};

export default WordleScreen; 