import React, { useState, useEffect, useRef } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { gameDataAPI } from '../../services/api';
import { GAME_CONFIG } from '../../utils/constants';
import { showError } from '../../utils/toast';
import './GuessWhoScreen.css';

/**
 * Component GuessWhoScreen - Màn hình game "Tôi là ai"
 * @param {Object} props - Props của component
 * @param {Function} props.onBackHome - Callback khi quay về trang chủ
 */
const GuessWhoScreen = ({ onBackHome }) => {
  const [guessWhoData, setGuessWhoData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [visibleHints, setVisibleHints] = useState([]);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [gameScore, setGameScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [gameStats, setGameStats] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentQuestionScore, setCurrentQuestionScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [usedCharacterIds, setUsedCharacterIds] = useState([]);
  
  const inputRef = useRef(null);
  const maxQuestions = GAME_CONFIG.GUESSWHO?.MAX_QUESTIONS || 10;
  const maxHints = GAME_CONFIG.GUESSWHO?.MAX_HINTS || 3;

  // Load game stats và khởi tạo game
  useEffect(() => {
    loadGameStats();
    fetchGuessWhoData();
  }, []);
  
  // Load câu hỏi khi dữ liệu đã sẵn sàng
  useEffect(() => {
    if (guessWhoData && !currentQuestion) {
      loadNewQuestion();
    }
  }, [guessWhoData]);

  // Focus vào input
  useEffect(() => {
    if (inputRef.current && !isAnswered) {
      inputRef.current.focus();
    }
  }, [currentQuestion, isAnswered]);

  /**
   * Lấy dữ liệu cho game GuessWho từ API
   */
  const fetchGuessWhoData = async () => {
    try {
      setIsLoading(true);
      console.log("Đang tải dữ liệu GuessWho...");
      const response = await gameDataAPI.getGuessWhoData();
      
      console.log("API response:", response);
      
      if (!response.success || !response.characters || !Array.isArray(response.characters)) {
        console.error('Không thể tải dữ liệu GuessWho:', response.message || 'Lỗi không xác định');
        setModalContent({
          title: 'Lỗi',
          message: 'Không thể tải dữ liệu game. Vui lòng thử lại sau.',
          isError: true
        });
        setShowModal(true);
        return;
      }
      
      // Kiểm tra nếu không có nhân vật nào
      if (response.characters.length === 0) {
        setModalContent({
          title: 'Dữ liệu trống',
          message: 'Không có nhân vật nào trong cơ sở dữ liệu. Vui lòng liên hệ quản trị viên.',
          isError: true
        });
        setShowModal(true);
        return;
      }
      
      setGuessWhoData(response.characters);
      setIsLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu GuessWho:', error);
      setModalContent({
        title: 'Lỗi kết nối',
        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
        isError: true
      });
      setShowModal(true);
    }
  };

  /**
   * Tải thống kê game từ localStorage
   */
  const loadGameStats = async () => {
    try {
      const statsResponse = await gameDataAPI.getGuessWhoStats();
      if (statsResponse.success) {
        setGameStats(statsResponse.data);
      } else {
        // Khởi tạo stats mới nếu không tìm thấy
        setGameStats({
          gamesPlayed: 0,
          correctAnswers: 0,
          totalQuestions: 0,
          averageHintsUsed: 0,
          lastPlayed: null,
          categories: {}
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê game:', error);
      setGameStats({
        gamesPlayed: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        averageHintsUsed: 0,
        lastPlayed: null,
        categories: {}
      });
    }
  };

  /**
   * Lấy câu hỏi ngẫu nhiên từ dữ liệu có sẵn
   */
  const getRandomGuessWhoQuestion = () => {
    if (!guessWhoData || guessWhoData.length === 0) {
      console.error('Không có dữ liệu để lấy câu hỏi ngẫu nhiên');
      return null;
    }
    
    // Lọc các nhân vật chưa sử dụng
    let availableCharacters = guessWhoData.filter(char => !usedCharacterIds.includes(char.id));
    
    // Nếu không còn nhân vật nào, reset danh sách đã sử dụng
    if (availableCharacters.length === 0) {
      console.log('Đã sử dụng hết nhân vật, reset danh sách');
      availableCharacters = guessWhoData;
      setUsedCharacterIds([]);
    }
    
    // Chọn nhân vật ngẫu nhiên
    const randomIndex = Math.floor(Math.random() * availableCharacters.length);
    const selectedCharacter = availableCharacters[randomIndex];
    
    // Thêm ID vào danh sách đã sử dụng
    if (selectedCharacter && selectedCharacter.id) {
      setUsedCharacterIds(prev => [...prev, selectedCharacter.id]);
    }
    
    return selectedCharacter;
  };

  /**
   * Tải câu hỏi mới
   */
  const loadNewQuestion = () => {
    if (isGameOver || questionNumber > maxQuestions) {
      endGame();
      return;
    }
    
    // Lấy câu hỏi ngẫu nhiên
    const character = getRandomGuessWhoQuestion();
    
    if (!character) {
      setModalContent({
        title: 'Lỗi',
        message: 'Không thể tải câu hỏi. Vui lòng thử lại sau.',
        isError: true
      });
      setShowModal(true);
      return;
    }
    
    // Kiểm tra có gợi ý không
    if (!character.hints || !Array.isArray(character.hints) || character.hints.length === 0) {
      console.error('Nhân vật không có gợi ý:', character);
      setModalContent({
        title: 'Lỗi dữ liệu',
        message: 'Dữ liệu nhân vật không hợp lệ. Vui lòng thử lại.',
        isError: true
      });
      setShowModal(true);
      return;
    }
    
    // Khởi tạo câu hỏi mới
    setCurrentQuestion(character);
    setCurrentHintIndex(0);
    setVisibleHints([character.hints[0]]);  // Hiển thị gợi ý đầu tiên
    setAttempts([]);
    setGuess('');
    setIsAnswered(false);
    setCurrentQuestionScore(GAME_CONFIG.GUESSWHO.SCORE_PER_QUESTION);
    
    console.log('Câu hỏi mới:', character.name);
  };

  /**
   * Hiển thị gợi ý tiếp theo
   */
  const showNextHint = async () => {
    // Kiểm tra nếu đã dùng hết số lần gợi ý cho câu hỏi hiện tại
    if (currentHintIndex >= maxHints - 1 || currentHintIndex >= currentQuestion.hints.length - 1) {
      setModalContent({
        title: 'Giới hạn gợi ý',
        message: `Bạn đã sử dụng tối đa ${maxHints} gợi ý cho câu hỏi này.`,
        isError: true
      });
      setShowModal(true);
      return;
    }

    if (!currentQuestion) {
      return;
    }

    const nextHintIndex = currentHintIndex + 1;

    try {
      const response = await gameDataAPI.getNextHint({
        characterId: currentQuestion.id,
        currentHintIndex
      });

      if (response.success) {
        // Hiển thị gợi ý mới
        setCurrentHintIndex(nextHintIndex);
        setVisibleHints(prev => [...prev, response.data.hint || currentQuestion.hints[nextHintIndex]]);
      } else {
        // Fallback nếu API lỗi
        setCurrentHintIndex(nextHintIndex);
        setVisibleHints(prev => [...prev, currentQuestion.hints[nextHintIndex]]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy gợi ý tiếp theo:', error);
      // Fallback khi có lỗi
      const nextHintIndex = currentHintIndex + 1;
      setCurrentHintIndex(nextHintIndex);
      setVisibleHints(prev => [...prev, currentQuestion.hints[nextHintIndex]]);
    }
  };

  /**
   * Xử lý khi người chơi gửi câu trả lời
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!guess.trim() || isAnswered || !currentQuestion) return;
    
    const currentAttempt = guess.trim();
    
    try {
      // Gửi câu trả lời đến API để kiểm tra
      const response = await gameDataAPI.checkGuessWhoAnswer({
        characterId: currentQuestion.id,
        guess: currentAttempt,
        currentHintIndex: currentHintIndex
      });
      
      if (response.success) {
        const isCorrect = response.data.correct;
        const feedback = response.data.feedback || generateFeedback(currentAttempt, currentQuestion.name);
        
        // Thêm vào danh sách đã thử
        setAttempts(prev => [...prev, { 
          text: currentAttempt, 
          isCorrect,
          feedback: feedback,
          hintsUsed: currentHintIndex + 1 // Lưu số gợi ý đã sử dụng
        }]);
        
        if (isCorrect) {
          // Đáp án đúng
          handleCorrectAnswer();
        } else {
          // Đáp án sai - hiển thị toast thông báo với phản hồi
          showError(`${feedback}`);
          setGuess('');
        }
      } else {
        console.error('Lỗi khi kiểm tra câu trả lời:', response.message);
        
        // Fallback khi API lỗi
        const userGuess = currentAttempt.toLowerCase();
        const correctAnswer = currentQuestion.name.toLowerCase();
        const isCorrect = userGuess === correctAnswer;
        const feedback = generateFeedback(currentAttempt, currentQuestion.name);
        
        setAttempts(prev => [...prev, { 
          text: currentAttempt, 
          isCorrect,
          feedback: feedback,
          hintsUsed: currentHintIndex + 1 // Lưu số gợi ý đã sử dụng
        }]);
        
        if (isCorrect) {
          handleCorrectAnswer();
        } else {
          // Đáp án sai - hiển thị toast thông báo
          showError(`${feedback}`);
          setGuess('');
        }
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra câu trả lời:', error);
      
      // Fallback khi có lỗi
      const userGuess = currentAttempt.toLowerCase();
      const correctAnswer = currentQuestion.name.toLowerCase();
      const isCorrect = userGuess === correctAnswer;
      const feedback = generateFeedback(currentAttempt, currentQuestion.name);
      
      setAttempts(prev => [...prev, { 
        text: currentAttempt, 
        isCorrect,
        feedback: feedback,
        hintsUsed: currentHintIndex + 1 // Lưu số gợi ý đã sử dụng
      }]);
      
      if (isCorrect) {
        handleCorrectAnswer();
      } else {
        // Đáp án sai - hiển thị toast thông báo
        showError(`${feedback}`);
        setGuess('');
      }
    }
  };
  
  /**
   * Tạo phản hồi cho câu trả lời
   */
  const generateFeedback = (guess, correctAnswer) => {
    const userGuess = guess.toLowerCase();
    const correct = correctAnswer.toLowerCase();
    
    if (userGuess === correct) {
      return "Chính xác!";
    }
    
    if (userGuess.length < 3) {
      return "Quá ngắn để đoán.";
    }
    
    if (correct.includes(userGuess)) {
      return "Gần đúng, hãy cụ thể hơn!";
    }
    
    if (userGuess.includes(correct)) {
      return "Quá dài, hãy đơn giản hơn!";
    }
    
    // So sánh số ký tự giống nhau
    const minLength = Math.min(userGuess.length, correct.length);
    let matchCount = 0;
    
    for (let i = 0; i < minLength; i++) {
      if (userGuess[i] === correct[i]) {
        matchCount++;
      }
    }
    
    const matchPercent = Math.floor((matchCount / correct.length) * 100);
    
    if (matchPercent > 70) {
      return "Rất gần đúng!";
    } else if (matchPercent > 50) {
      return "Khá gần đúng.";
    } else if (matchPercent > 30) {
      return "Hơi giống, nhưng chưa đúng.";
    }
    
    return "Không đúng, hãy thử lại!";
  };

  /**
   * Xử lý khi người chơi trả lời đúng
   */
  const handleCorrectAnswer = () => {
    setIsAnswered(true);
    setCorrectAnswers(prev => prev + 1);
    setGameScore(prev => prev + 1); // Chỉ cộng 1 điểm khi trả lời đúng
    
    // Không hiển thị modal, chuyển sang câu hỏi tiếp theo
    handleContinue();
  };

  /**
   * Xử lý khi người chơi tiếp tục sang câu hỏi tiếp theo
   */
  const handleContinue = () => {
    if (questionNumber >= maxQuestions) {
      endGame();
    } else {
      setQuestionNumber(prev => prev + 1);
      loadNewQuestion();
    }
  };

  /**
   * Xử lý khi người chơi bỏ qua câu hỏi
   */
  const handleSkip = () => {
    setIsAnswered(true);
    
    // Hiển thị toast thông báo khi bỏ qua
    showError(`Đáp án là: "${currentQuestion.name}"`);
    
    // Chuyển sang câu tiếp theo
    handleContinue();
  };

  /**
   * Kết thúc trò chơi và hiển thị kết quả
   */
  const endGame = async () => {
    setIsGameOver(true);
    
    try {
      // Tính điểm và lưu kết quả
      const accuracy = (correctAnswers / questionNumber) * 100;
      const gameResult = {
        gamesPlayed: 1,
        correctAnswers,
        totalQuestions: questionNumber,
        hintsUsed: getCurrentTotalHintsUsed(), // Thay thế bằng hàm tính toán tổng số gợi ý đã dùng
        accuracy,
        score: gameScore,
        categoryResults: calculateCategoryResults()
      };
      
      // Gửi kết quả lên server
      await gameDataAPI.saveGuessWhoStats(gameResult);
      
      // Cập nhật stats trong state
      const newStats = await gameDataAPI.getGuessWhoStats();
      if (newStats.success) {
        setGameStats(newStats.data);
      }
      
      // Hiển thị kết quả
      const accuracyText = accuracy.toFixed(1);
      const performanceMessage = 
        accuracy >= 80 ? 'Xuất sắc! Bạn là bậc thầy nhận diện!' :
        accuracy >= 60 ? 'Tốt lắm! Bạn có kiến thức rộng!' :
        accuracy >= 40 ? 'Không tệ! Tiếp tục trau dồi nhé!' :
        'Cố gắng lên! Bạn sẽ khá hơn!';
      
      setModalContent({
        title: '🏁 Kết thúc game!',
        message: `${performanceMessage}\n\nKết quả: ${correctAnswers}/${questionNumber} câu đúng\nĐộ chính xác: ${accuracyText}%\nTổng điểm: ${gameScore}`,
        isGameOver: true
      });
      setShowModal(true);
    } catch (error) {
      console.error('Lỗi khi kết thúc game:', error);
      
      // Fallback khi có lỗi
      const accuracy = (correctAnswers / questionNumber) * 100;
      const accuracyText = accuracy.toFixed(1);
      const performanceMessage = 
        accuracy >= 80 ? 'Xuất sắc! Bạn là bậc thầy nhận diện!' :
        accuracy >= 60 ? 'Tốt lắm! Bạn có kiến thức rộng!' :
        accuracy >= 40 ? 'Không tệ! Tiếp tục trau dồi nhé!' :
        'Cố gắng lên! Bạn sẽ khá hơn!';
      
      setModalContent({
        title: '🏁 Kết thúc game!',
        message: `${performanceMessage}\n\nKết quả: ${correctAnswers}/${questionNumber} câu đúng\nĐộ chính xác: ${accuracyText}%\nTổng điểm: ${gameScore}`,
        isGameOver: true
      });
      setShowModal(true);
    }
  };

  /**
   * Tính toán kết quả theo danh mục
   */
  const calculateCategoryResults = () => {
    const categoryResults = {};
    
    if (!currentQuestion || !currentQuestion.category) {
      return categoryResults;
    }
    
    const category = currentQuestion.category;
    categoryResults[category] = {
      correct: isAnswered ? 1 : 0,
      total: 1
    };
    
    return categoryResults;
  };

  /**
   * Xử lý khi đóng modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
    
    if (modalContent.isSuccess || modalContent.isSkipped) {
      handleContinue();
    }
  };

  /**
   * Xử lý khi người chơi muốn chơi lại
   */
  const handlePlayAgain = () => {
    setGuessWhoData(null);
    setCurrentQuestion(null);
    setCurrentHintIndex(0);
    setVisibleHints([]);
    setGuess('');
    setAttempts([]);
    setGameScore(0);
    setCorrectAnswers(0);
    setQuestionNumber(1);
    setIsGameOver(false);
    setShowModal(false);
    setIsAnswered(false);
    setCurrentQuestionScore(GAME_CONFIG.GUESSWHO.SCORE_PER_QUESTION);
    setUsedCharacterIds([]);
    // Reset tổng số gợi ý đã sử dụng
    // setTotalHintsUsed(0); // Xóa dòng này
    
    // Tải dữ liệu mới
    fetchGuessWhoData();
  };

  /**
   * Xóa thống kê game
   */
  const handleClearStats = async () => {
    try {
      await gameDataAPI.clearGuessWhoStats();
      loadGameStats();
      setModalContent({
        title: 'Thành công',
        message: 'Đã xóa thống kê game.',
        isSuccess: true
      });
      setShowModal(true);
    } catch (error) {
      console.error('Lỗi khi xóa thống kê:', error);
      setModalContent({
        title: 'Lỗi',
        message: 'Không thể xóa thống kê. Vui lòng thử lại.',
        isError: true
      });
      setShowModal(true);
    }
  };

  /**
   * Tính tổng số gợi ý đã sử dụng trong toàn bộ trò chơi
   */
  const getCurrentTotalHintsUsed = () => {
    // Tính tổng số gợi ý đã sử dụng trong tất cả các câu hỏi trước đó
    let totalHints = 0;
    
    // Duyệt qua tất cả các lần thử và tính tổng số gợi ý đã sử dụng
    attempts.forEach(attempt => {
      if (attempt.hintsUsed && attempt.hintsUsed > 0) {
        // Chỉ tính cho các lần thử đã có kết quả (đã thành công hoặc bỏ qua)
        if (attempt.isCorrect !== undefined) {
          totalHints += attempt.hintsUsed;
        }
      }
    });
    
    // Cộng thêm số gợi ý đã sử dụng trong câu hỏi hiện tại
    if (currentHintIndex >= 0) {
      totalHints += currentHintIndex + 1;
    }
    
    return totalHints;
  };

  // Hiển thị trạng thái loading
  if (isLoading) {
    return (
      <div className="quiz-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  // Hiển thị khi không có dữ liệu
  if (!guessWhoData) {
    return (
      <div className="quiz-screen">
        <div className="error-container">
          <div className="error-message">Không thể tải dữ liệu game.</div>
          <Button variant="primary" onClick={onBackHome}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-screen">
      <div className="game-container">
        {/* Header */}
        <div className="game-header">
          <Button 
            variant="secondary" 
            onClick={onBackHome}
          >
            🏠 Trang chủ
          </Button>
          
          <div className="game-info">
            <div className="question-counter">
              Câu {questionNumber}/{maxQuestions}
            </div>
            <div className="score-info">
              <div className="current-score">
                Điểm: {gameScore}
              </div>
              <div className="correct-count">
                Đúng: {correctAnswers}
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Game Title */}
        <div className="section-title">
          <h1>👤 Tôi là ai?</h1>
          <p>Đoán nhân vật dựa vào gợi ý</p>
        </div>
        
        {/* Game Content */}
        {currentQuestion && (
          <div className="current-word-section">
            {/* Hints Section */}
            <div className="hints-section">
              <h3>Gợi ý ({currentHintIndex + 1}/{Math.min(currentQuestion.hints.length, maxHints)})</h3>
              <div className="hint-list">
                {visibleHints.map((hint, index) => (
                  <div key={index} className="hint-item">
                    {hint}
                  </div>
                ))}
              </div>
              
              {!isAnswered && currentHintIndex < Math.min(currentQuestion.hints.length - 1, maxHints - 1) && (
                <Button
                  variant="secondary"
                  onClick={showNextHint}
                  disabled={isAnswered || currentHintIndex >= maxHints - 1}
                >
                  💡 Gợi ý tiếp theo ({currentHintIndex + 1}/{maxHints})
                </Button>
              )}
            </div>
            
            {/* Input Section */}
            {!isAnswered && (
              <form onSubmit={handleSubmit} className="input-form">
                <div className="input-group">
                  <input
                    type="text"
                    ref={inputRef}
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Nhập tên nhân vật..."
                    className="word-input"
                    disabled={isAnswered}
                  />
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={!guess.trim() || isAnswered}
                  >
                    Đoán
                  </Button>
                </div>
              </form>
            )}
            
            {/* Attempts Section */}
            {attempts.length > 0 && (
              <div className="attempts-section">
                <h3>Đã thử ({attempts.length})</h3>
                <div className="attempts-list">
                  {attempts.map((attempt, index) => (
                    <div 
                      key={index}
                      className={`attempt-item ${attempt.isCorrect ? 'correct' : 'wrong'}`}
                    >
                      <span>{attempt.text}</span>
                      <span>{attempt.feedback}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skip Button */}
            {!isAnswered && (
              <Button 
                variant="secondary" 
                onClick={handleSkip}
                className="skip-btn"
                disabled={isAnswered}
              >
                ⏩ Bỏ qua
              </Button>
            )}
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

export default GuessWhoScreen; 