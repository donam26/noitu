import React, { useState, useEffect, useRef } from 'react';
import Timer from '../common/Timer';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { 
  getRandomWordForScramble,
  scrambleWord,
  formatScrambledDisplay,
  checkAnswer,
  getHint,
  calculateScore
} from '../../utils/wordScrambleLogic';
import { GAME_CONFIG, MESSAGES } from '../../utils/constants';
import './WordScrambleScreen.css';

/**
 * Component WordScrambleScreen - Màn hình chơi game sắp xếp từ
 * @param {Object} props - Props của component
 * @param {Function} props.onBackHome - Callback khi quay về trang chủ
 */
const WordScrambleScreen = ({ onBackHome }) => {
  const [originalWord, setOriginalWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [gameStarted, setGameStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  const inputRef = useRef(null);
  const timerKey = useRef(0);

  // Khởi tạo game
  useEffect(() => {
    startNewRound();
  }, []);

  // Focus vào input khi bắt đầu
  useEffect(() => {
    if (gameStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStarted, originalWord]);

  /**
   * Bắt đầu round mới
   */
  const startNewRound = () => {
    const newWord = getRandomWordForScramble();
    const scrambled = scrambleWord(newWord);
    
    setOriginalWord(newWord);
    setScrambledWord(scrambled);
    setInputValue('');
    setGameStarted(true);
    setShowHint(false);
    timerKey.current += 1; // Reset timer
  };

  /**
   * Xử lý khi hết thời gian
   */
  const handleTimeUp = () => {
    if (isGameOver) return;
    
    setModalContent({
      title: 'Hết thời gian!',
      message: `Từ đúng là: "${originalWord.toUpperCase()}"`
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

    const userAnswer = inputValue.trim();
    
    // Kiểm tra câu trả lời
    if (checkAnswer(originalWord, userAnswer)) {
      // Đúng - tính điểm và chuyển round mới
      const timeLeft = 30; // Tạm thời, sẽ được truyền từ Timer
      const roundScore = calculateScore(originalWord, timeLeft, 30);
      
      setScore(roundScore);
      setTotalScore(prev => prev + roundScore);
      setRound(prev => prev + 1);
      
      setModalContent({
        title: 'Chính xác!',
        message: `Bạn được ${roundScore} điểm!\nChuẩn bị cho từ tiếp theo...`,
        isSuccess: true
      });
      setShowModal(true);
      
      // Tự động chuyển round sau 1.5 giây
      setTimeout(() => {
        setShowModal(false);
        startNewRound();
      }, 1500);
      
    } else {
      // Sai - hiển thị thông báo
      setModalContent({
        title: 'Chưa đúng!',
        message: `Hãy thử lại. Gợi ý: ${getHint(originalWord)}`
      });
      setShowModal(true);
      setInputValue('');
    }
  };

  /**
   * Hiển thị gợi ý
   */
  const handleShowHint = () => {
    setShowHint(true);
  };

  /**
   * Đóng modal
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
    setTotalScore(0);
    setRound(1);
    setIsGameOver(false);
    setShowModal(false);
    startNewRound();
  };

  return (
    <div className="word-scramble-screen">
      <div className="game-container">
        {/* Header */}
        <div className="game-header">
          <Button 
            variant="secondary" 
            onClick={onBackHome}
            className="back-btn"
          >
            Trang chủ
          </Button>
          <div className="game-info">
            <div className="round-info">Round {round}</div>
            <div className="score-info">
              <div className="current-score">Điểm: {score}</div>
              <div className="total-score">Tổng: {totalScore}</div>
            </div>
          </div>
        </div>

        {/* Timer */}
        {!isGameOver && (
          <Timer
            key={timerKey.current}
            timeLimit={GAME_CONFIG.TIME_LIMIT}
            onTimeUp={handleTimeUp}
            isActive={gameStarted && !showModal}
          />
        )}

        {/* Từ đảo lộn */}
        <div className="scrambled-word-section">
          <h2 className="section-title">Sắp xếp từ:</h2>
          <div className="scrambled-display">
            {formatScrambledDisplay(scrambledWord)}
          </div>
          {originalWord && (
            <div className="word-length-hint">
              Từ có {originalWord.length} ký tự
            </div>
          )}
        </div>

        {/* Gợi ý */}
        {showHint && (
          <div className="hint-section">
            <div className="hint-display">
              Gợi ý: {getHint(originalWord)}
            </div>
          </div>
        )}

        {/* Input form */}
        {!isGameOver && (
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập từ đúng..."
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
            
            <div className="action-buttons">
              {!showHint && (
                <Button 
                  variant="secondary"
                  onClick={handleShowHint}
                  className="hint-btn"
                  disabled={showModal}
                >
                  💡 Gợi ý
                </Button>
              )}
            </div>
          </form>
        )}

        {/* Game Over Actions */}
        {isGameOver && (
          <div className="game-over-actions">
            <div className="final-score">
              <h3>Kết thúc game!</h3>
              <p>Tổng điểm: <span className="score-highlight">{totalScore}</span></p>
              <p>Đã chơi: <span className="round-highlight">{round - 1}</span> round</p>
            </div>
            <Button 
              variant="primary" 
              onClick={handlePlayAgain}
              className="action-btn"
            >
              Chơi lại
            </Button>
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={showModal}
          title={modalContent.title}
          message={modalContent.message}
          onClose={handleCloseModal}
          cancelText="OK"
        />
      </div>
    </div>
  );
};

export default WordScrambleScreen; 