import React, { useState, useEffect, useRef } from 'react';
import Timer from '../common/Timer';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { 
  getRandomWord, 
  isValidWord, 
  canConnectWords, 
  findSuggestedWord,
  getConnectionHint
} from '../../utils/gameLogic';
import { GAME_CONFIG, MESSAGES } from '../../utils/constants';
import './GameScreen.css';

/**
 * Component GameScreen - Màn hình chơi game
 * @param {Object} props - Props của component
 * @param {Function} props.onBackHome - Callback khi quay về trang chủ
 */
const GameScreen = ({ onBackHome }) => {
  const [currentWord, setCurrentWord] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [gameStarted, setGameStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(GAME_CONFIG.TIME_LIMIT);
  
  const inputRef = useRef(null);
  const timerKey = useRef(0);

  // Hàm cập nhật thời gian còn lại từ Timer
  const handleTimeUpdate = (time) => {
    setTimeRemaining(time);
  };

  // Khởi tạo game
  useEffect(() => {
    startNewRound();
  }, []);

  // Focus vào input khi bắt đầu
  useEffect(() => {
    if (gameStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStarted, currentWord]);

  /**
   * Bắt đầu round mới
   */
  const startNewRound = () => {
    const newWord = getRandomWord();
    setCurrentWord(newWord);
    setInputValue('');
    setGameStarted(true);
    setTimeRemaining(GAME_CONFIG.TIME_LIMIT);
    timerKey.current += 1; // Reset timer
  };

  /**
   * Xử lý khi hết thời gian
   */
  const handleTimeUp = () => {
    if (isGameOver) return;
    
    const suggestedWord = findSuggestedWord(currentWord);
    setModalContent({
      title: 'Hết thời gian!',
      message: `${MESSAGES.TIME_UP} "${suggestedWord}"`
    });
    setShowModal(true);
    setIsGameOver(true);
  };

  /**
   * Xử lý submit từ người dùng
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isGameOver) return;

    const userWord = inputValue.trim();
    
    // Kiểm tra từ có hợp lệ không
    if (!isValidWord(userWord)) {
      setModalContent({
        title: 'Từ không hợp lệ',
        message: `"${userWord}" không có trong từ điển!`
      });
      setShowModal(true);
      return;
    }

    // Kiểm tra có nối được không
    if (!canConnectWords(currentWord, userWord)) {
      const suggestedWord = findSuggestedWord(currentWord);
      const hint = getConnectionHint(currentWord);
      setModalContent({
        title: 'Không nối được',
        message: `Từ phải bắt đầu bằng ${hint}. Ví dụ: "${suggestedWord}"`
      });
      setShowModal(true);
      return;
    }
    // Đúng - tiếp tục game
    setScore(prev => prev + 1);
    setCurrentWord(userWord);
    setInputValue('');
    setTimeRemaining(GAME_CONFIG.TIME_LIMIT);
    timerKey.current += 1; // Reset timer cho round mới
  };

  /**
   * Đóng modal và xử lý game over
   */
  const handleCloseModal = () => {
    setShowModal(false);
    if (isGameOver) {
      // Không reset game, chỉ đóng modal
    }
  };

  /**
   * Chơi lại
   */
  const handlePlayAgain = () => {
    setScore(0);
    setIsGameOver(false);
    setShowModal(false);
    setTimeRemaining(GAME_CONFIG.TIME_LIMIT);
    startNewRound();
  };

  // Lấy gợi ý hiển thị
  const connectionHint = currentWord ? getConnectionHint(currentWord) : '';

  return (
    <div className="game-screen">
      <div className="game-container">
        {/* Header */}
        <div className="game-header">
          <Button 
            variant="secondary" 
            onClick={onBackHome}
            className="back-btn"
          >
            {MESSAGES.BACK_HOME}
          </Button>
          <div className="score">
            Điểm: {score}
          </div>
        </div>

        {/* Timer */}
        {!isGameOver && (
          <Timer
            key={timerKey.current}
            duration={GAME_CONFIG.TIME_LIMIT}
            onTimeUp={handleTimeUp}
            onTimeUpdate={handleTimeUpdate}
            isActive={gameStarted && !showModal}
          />
        )}

        {/* Từ hiện tại */}
        <div className="current-word-section">
          <h2 className="section-title">Từ hiện tại:</h2>
          <div className="current-word">
            {currentWord}
          </div>
          {currentWord && (
            <div className="word-hint">
              Từ tiếp theo phải bắt đầu bằng: <strong>{connectionHint}</strong>
            </div>
          )}
        </div>

        {/* Input form */}
        {!isGameOver && (
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={MESSAGES.INPUT_PLACEHOLDER}
                className="word-input"
                disabled={isGameOver || showModal}
              />
              <Button 
                type="submit" 
                variant="primary"
                disabled={!inputValue.trim() || isGameOver || showModal}
              >
                Gửi
              </Button>
            </div>
          </form>
        )}

        {/* Game Over Actions */}
        {isGameOver && (
          <div className="game-over-actions">
            <Button 
              variant="primary" 
              onClick={handlePlayAgain}
              className="action-btn"
            >
              {MESSAGES.TRY_AGAIN}
            </Button>
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={showModal}
          title={modalContent.title}
          message={modalContent.message}
          onClose={handleCloseModal}
          cancelText="Tiếp tục"
        />
      </div>
    </div>
  );
};

export default GameScreen; 