import React, { useState, useEffect, useRef } from 'react';
import Timer from '../common/Timer';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { gameDataAPI } from '../../services/api';
import { GAME_CONFIG, MESSAGES } from '../../utils/constants';
import { showError } from '../../utils/toast';
import './GameScreen.css';

/**
 * Component GameScreen - Màn hình chơi game
 * @param {Object} props - Props của component
 * @param {Function} props.onBackHome - Callback khi quay về trang chủ
 */
const GameScreen = ({ onBackHome }) => {
  const [currentWord, setCurrentWord] = useState('');
  const [currentWordData, setCurrentWordData] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [gameStarted, setGameStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(GAME_CONFIG.TIME_LIMIT);
  const [wordMeaning, setWordMeaning] = useState('');
  const [showWordMeaning, setShowWordMeaning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
   * Lấy từ ngẫu nhiên từ server
   */
  const fetchRandomWord = async () => {
    try {
      setIsLoading(true);
      const response = await gameDataAPI.getRandomWord();
      
      if (response.success && response.data) {
        const wordData = response.data;
        setCurrentWord(wordData.word);
        setCurrentWordData(wordData);
        setWordMeaning(wordData.meaning || '');
        return wordData;
      } else {
        console.error('Không thể lấy từ ngẫu nhiên:', response.message);
        // Sử dụng từ mặc định nếu không lấy được từ server
        const defaultWord = {
          word: 'học sinh',
          meaning: 'Người đang theo học tại trường',
          last_syllable: 'sinh'
        };
        setCurrentWord(defaultWord.word);
        setCurrentWordData(defaultWord);
        setWordMeaning(defaultWord.meaning);
        return defaultWord;
      }
    } catch (error) {
      console.error('Lỗi khi lấy từ ngẫu nhiên:', error);
      // Sử dụng từ mặc định nếu có lỗi
      const defaultWord = {
        word: 'học sinh',
        meaning: 'Người đang theo học tại trường',
        last_syllable: 'sinh'
      };
      setCurrentWord(defaultWord.word);
      setCurrentWordData(defaultWord);
      setWordMeaning(defaultWord.meaning);
      return defaultWord;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Bắt đầu round mới
   */
  const startNewRound = async () => {
    await fetchRandomWord();
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
    
    // Hiển thị toast thông báo đáp án đúng
    showError(`${MESSAGES.TIME_UP} ${currentWord}`);
    
    // Hiển thị modal kết quả trò chơi
    setModalContent({
      title: 'Kết thúc trò chơi!',
      message: `Đã hết thời gian!\n\nĐiểm của bạn: ${score}\n\nBạn có muốn chơi lại?`
    });
    setShowModal(true);
    setIsGameOver(true);
  };
  
  /**
   * Xử lý game over
   */
  const handleGameOver = (message = null) => {
    setIsGameOver(true);
    
    // Luôn hiển thị modal kết thúc game với điểm số
    const defaultMessage = `Trò chơi kết thúc!\n\nĐiểm của bạn: ${score}\n\nBạn có muốn chơi lại?`;
    
      setModalContent({
      title: 'Kết thúc trò chơi',
      message: message || defaultMessage
      });
      setShowModal(true);
  };

  /**
   * Xử lý submit từ người dùng
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isGameOver || isLoading) return;

    // Tự động thêm prefix vào từ người dùng nhập
    const userWord = connectionHint + ' ' + inputValue.trim();
    
    try {
      setIsLoading(true);
      
      // Kiểm tra từ nối qua API
      const response = await gameDataAPI.checkWordConnection(currentWord, userWord);
      console.log('Kết quả kiểm tra từ nối:', response);
      
      if (!response.success) {
        showError(response.message || 'Không thể kiểm tra từ của bạn. Vui lòng thử lại sau.');
        return;
      }
      
      const { isValid, canConnect, nextWord } = response.data;
      
      // Nếu từ không hợp lệ
      if (!isValid) {
        showError(`"${userWord}" không phải là từ tiếng Việt có nghĩa!`);
        return;
      }
      
      // Nếu từ không thể nối
      if (!canConnect) {
        const hint = currentWordData ? currentWordData.last_syllable : '';
        showError(`Từ phải bắt đầu bằng "${hint}".`);
        return;
      }
      
      // Đúng - tiếp tục game
      setScore(prev => prev + 1);
      
      // Nếu server trả về từ tiếp theo
      if (nextWord) {
        setCurrentWord(nextWord.word);
        setCurrentWordData(nextWord);
        setWordMeaning(nextWord.meaning || '');
      } else {
        // Nếu không có từ tiếp theo, lấy từ ngẫu nhiên mới
        await fetchRandomWord();
      }
      
      setInputValue('');
      
      // Reset thời gian
      setTimeRemaining(GAME_CONFIG.TIME_LIMIT);
      timerKey.current += 1;
    } catch (error) {
      console.error('Lỗi khi xử lý từ của người chơi:', error);
      showError('Không thể kiểm tra từ của bạn. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Đóng modal và xử lý game over
   */
  const handleCloseModal = () => {
    setShowModal(false);
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
  
  /**
   * Bật/tắt hiển thị nghĩa từ
   */
  const toggleWordMeaning = () => {
    setShowWordMeaning(!showWordMeaning);
  };

  // Lấy gợi ý hiển thị
  const connectionHint = currentWordData ? currentWordData.last_syllable : '';

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

        {/* Game Mode */}
        <div className="game-mode">
          <Button 
            variant={showWordMeaning ? "primary" : "secondary"}
            onClick={toggleWordMeaning}
            className="meaning-btn"
          >
            {showWordMeaning ? 'Ẩn nghĩa từ' : 'Hiện nghĩa từ'}
          </Button>
        </div>

        {/* Timer */}
        {!isGameOver && (
          <Timer
            key={timerKey.current}
            duration={GAME_CONFIG.TIME_LIMIT}
            onTimeUp={handleTimeUp}
            onTimeUpdate={handleTimeUpdate}
            isActive={gameStarted && !showModal && !isLoading}
          />
        )}

        {/* Từ hiện tại */}
        <div className="current-word-section">
          <h2 className="section-title">Từ hiện tại:</h2>
          <div className="current-word">
            {isLoading ? 'Đang tải...' : currentWord}
          </div>
          
          {/* Nghĩa của từ */}
          {showWordMeaning && wordMeaning && (
            <div className="word-meaning">
              <strong>Nghĩa:</strong> {wordMeaning}
            </div>
          )}
        </div>

        {/* Input form */}
        {!isGameOver && (
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-group">
              <div className="prefix-input-container">
                <span className="prefix-input">{connectionHint}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="..."
                  className="word-input with-prefix"
                  disabled={isGameOver || showModal || isLoading}
                />
              </div>
              <Button 
                type="submit" 
                variant="primary"
                disabled={!inputValue.trim() || isGameOver || showModal || isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Gửi'}
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