import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import Timer from '../common/Timer';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { showError } from '../../utils/toast';
import './WordScrambleScreen.css';

const WordScrambleScreen = ({ onBackHome }) => {
  const [originalWord, setOriginalWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [formattedDisplay, setFormattedDisplay] = useState('');
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  
  const inputRef = useRef(null);
  const timerKey = useRef(0);

  // Tải từ mới khi component mount
  useEffect(() => {
    startNewRound();
  }, []);

  // Bắt đầu vòng chơi mới
  const startNewRound = async () => {
    try {
      // Lấy từ ngẫu nhiên từ API
      const response = await axios.get(`${API_BASE_URL}/games/word-scramble/random`);
      const wordData = response.data;
      
      setOriginalWord(wordData.originalWord);
      setScrambledWord(wordData.scrambledWord);
      setFormattedDisplay(wordData.formattedDisplay);
      
      // Thiết lập trạng thái mới
      setUserInput('');
      setMessage('');
      setHint('');
      setShowHint(false);
      setTimeLeft(30);
      setGameState('playing');
      timerKey.current += 1;

      // Focus vào ô input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Lỗi khi bắt đầu vòng chơi mới:', error);
      setModalContent({
        title: 'Có lỗi xảy ra',
        message: 'Không thể tải từ mới. Vui lòng thử lại.'
      });
      setShowModal(true);
    }
  };

  // Xử lý khi người chơi gửi câu trả lời
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (gameState !== 'playing') return;
    
    if (!userInput.trim()) {
      setModalContent({
        title: 'Thiếu thông tin',
        message: 'Vui lòng nhập đáp án!'
      });
      setShowModal(true);
      return;
    }
    
    try {
      // Gửi câu trả lời đến API để kiểm tra
      const response = await axios.post(`${API_BASE_URL}/games/word-scramble/check`, {
        originalWord,
        userAnswer: userInput,
        timeLeft
      });
      
      const result = response.data;
      
      if (result.correct) {
        // Chỉ cộng 1 điểm và bắt đầu vòng chơi mới ngay lập tức
        setScore(prevScore => prevScore + 1);
        startNewRound(); // Bắt đầu vòng chơi mới ngay lập tức
      } else {
        // Hiển thị toast thông báo khi sai
        showError('Đáp án không chính xác. Hãy thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra câu trả lời:', error);
      setModalContent({
        title: 'Có lỗi xảy ra',
        message: 'Không thể kiểm tra câu trả lời. Vui lòng thử lại.'
      });
      setShowModal(true);
    }
  };

  // Hiển thị gợi ý
  const showWordHint = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/games/word-scramble/hint/${originalWord}`);
      setHint(response.data.hint);
      setShowHint(true);
    } catch (error) {
      console.error('Lỗi khi lấy gợi ý:', error);
      setModalContent({
        title: 'Có lỗi xảy ra',
        message: 'Không thể lấy gợi ý. Vui lòng thử lại.'
      });
      setShowModal(true);
    }
  };

  // Chơi lại với từ mới
  const handlePlayAgain = () => {
    setShowModal(false);
    startNewRound();
  };
  
  // Xử lý khi hết thời gian
  const handleTimeUp = () => {
    setGameState('lost');
    
    // Hiển thị toast thông báo đáp án đúng khi hết giờ
    showError(`Hết giờ! Từ đúng là: "${originalWord}"`);
    
    // Hiển thị modal kết quả trò chơi với điểm số
    setModalContent({
      title: 'Kết thúc trò chơi!',
      message: `Đã hết thời gian!\n\nĐiểm của bạn: ${score}\n\nTừ đúng là: "${originalWord}"\n\nBạn có muốn chơi lại?`,
      isGameOver: true
    });
    setShowModal(true);
  };
  
  // Đóng modal
  const handleCloseModal = () => {
    setShowModal(false);
    
    if (gameState === 'won') {
      startNewRound();
    }
  };

  // Cập nhật thời gian còn lại từ Timer
  const handleTimeUpdate = (time) => {
    setTimeLeft(time);
  };

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
            🏠 Trang chủ
          </Button>
          <div className="score">
            Điểm: {score}
          </div>
        </div>

        {/* Timer */}
        {gameState === 'playing' && (
          <Timer
            key={timerKey.current}
            duration={30}
            onTimeUp={handleTimeUp}
            onTimeUpdate={handleTimeUpdate}
            isActive={gameState === 'playing' && !showModal}
          />
        )}
        
        {/* Từ đảo lộn */}
        <div className="current-word-section">
          <h2 className="section-title">Sắp xếp lại thành từ có nghĩa:</h2>
          <div className="current-word">
            {formattedDisplay}
          </div>
          
          {/* Gợi ý */}
          {showHint && (
            <div className="word-meaning">
              <strong>Gợi ý:</strong> {hint}
            </div>
          )}
        </div>

        {/* Form nhập câu trả lời */}
        {gameState === 'playing' && (
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Nhập đáp án..."
                disabled={gameState !== 'playing'}
                className="word-input"
              />
              <div className="button-container">
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!userInput.trim()}
                >
                  Gửi
                </Button>
                
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={showWordHint} 
                  disabled={showHint}
                >
                  Gợi ý
                </Button>
              </div>
            </div>
          </form>
        )}
        
        {/* Game Over Actions */}
        {gameState !== 'playing' && (
          <div className="game-over-actions">
            <Button 
              variant="primary" 
              onClick={handlePlayAgain}
              className="action-btn"
            >
              🔄 Chơi lại
            </Button>
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={showModal}
          title={modalContent.title}
          message={modalContent.message}
          onClose={handleCloseModal}
          confirmText={modalContent.isGameOver ? "Chơi lại" : null}
          onConfirm={modalContent.isGameOver ? handlePlayAgain : null}
          cancelText={modalContent.isGameOver ? "Về trang chủ" : "Tiếp tục"}
          onCancel={modalContent.isGameOver ? onBackHome : handleCloseModal}
        />
      </div>
    </div>
  );
};

export default WordScrambleScreen; 