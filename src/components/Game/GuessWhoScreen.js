import React, { useState, useEffect, useRef } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import {
  getNewGuessWhoQuestion,
  checkGuess,
  isGameFinished,
  getAccuracyPercentage,
  getPerformanceMessage,
  saveGameStats,
  getGameStats,
  clearGameStats,
  getNextHint,
  generateHintFromGuess,
  formatLastPlayed
} from '../../utils/guessWhoLogic';
import './GuessWhoScreen.css';

/**
 * Component GuessWhoScreen - Màn hình game "Tôi là ai"
 * @param {Object} props - Props của component
 * @param {Function} props.onBackHome - Callback khi quay về trang chủ
 */
const GuessWhoScreen = ({ onBackHome }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);
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
  const [showStats, setShowStats] = useState(false);
  const [gameStats, setGameStats] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentQuestionScore, setCurrentQuestionScore] = useState(0);
  
  const inputRef = useRef(null);
  const maxQuestions = 10;
  const maxHints = 4;

  // Load game stats và khởi tạo game
  useEffect(() => {
    loadGameStats();
    loadNewQuestion();
  }, []);

  // Focus vào input
  useEffect(() => {
    if (inputRef.current && !isAnswered) {
      inputRef.current.focus();
    }
  }, [currentQuestion, isAnswered]);

  /**
   * Load thống kê game
   */
  const loadGameStats = () => {
    const stats = getGameStats();
    setGameStats(stats);
  };

  /**
   * Load câu đố mới
   */
  const loadNewQuestion = () => {
    // Safety check để tránh load khi đã game over
    if (isGameOver || questionNumber > maxQuestions) {
      endGame();
      return;
    }
    
    const question = getNewGuessWhoQuestion(usedQuestionIds);
    
    if (!question || isGameFinished(usedQuestionIds, maxQuestions)) {
      endGame();
      return;
    }

    // Reset tất cả state cho câu mới
    setCurrentQuestion(question);
    setCurrentHintIndex(0);
    setVisibleHints([question.hints[0]]); // Hiển thị gợi ý đầu tiên
    setGuess('');
    setAttempts([]);
    setIsAnswered(false);
    setCurrentQuestionScore(0);
    setUsedQuestionIds(prev => [...prev, question.id]);
    
    // Focus vào input sau khi load xong và reset placeholder
    setTimeout(() => {
      if (inputRef.current && !isAnswered) {
        inputRef.current.focus();
        inputRef.current.placeholder = "Nhập câu trả lời của bạn...";
      }
    }, 100);
  };

  /**
   * Hiển thị gợi ý tiếp theo
   */
  const showNextHint = () => {
    if (currentHintIndex < maxHints - 1 && currentHintIndex < currentQuestion.hints.length - 1) {
      const nextIndex = currentHintIndex + 1;
      setCurrentHintIndex(nextIndex);
      setVisibleHints(prev => [...prev, currentQuestion.hints[nextIndex]]);
      
      // Thông báo nhẹ khi đã hết gợi ý
      if (nextIndex === maxHints - 1 || nextIndex === currentQuestion.hints.length - 1) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.placeholder = "Đây là gợi ý cuối cùng! Hãy đoán ngay...";
          }
        }, 500);
      }
    }
  };

  /**
   * Xử lý submit câu trả lời
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!guess.trim() || isAnswered || isGameOver) return;

    const result = checkGuess(currentQuestion.answer, guess, currentHintIndex + 1);
    
    const newAttempt = {
      guess: guess.trim(),
      result: result,
      timestamp: Date.now()
    };
    
    setAttempts(prev => [...prev, newAttempt]);

    if (result.isCorrect) {
      // Đúng rồi!
      setIsAnswered(true);
      setCorrectAnswers(prev => prev + 1);
      setCurrentQuestionScore(result.score);
      setGameScore(prev => prev + result.score);
      
      const nextQuestionNumber = questionNumber + 1;
      
      setModalContent({
        title: '🎉 Chính xác!',
        message: `Đáp án là: "${currentQuestion.answer}"\n\nDanh mục: ${currentQuestion.category}\nĐiểm: ${result.score}\nSố gợi ý đã dùng: ${currentHintIndex + 1}/${maxHints}\n\nCâu tiếp theo: ${nextQuestionNumber}/${maxQuestions}`,
        isSuccess: true,
        showContinue: nextQuestionNumber <= maxQuestions
      });
      setShowModal(true);
      
    } else {
      // Sai rồi, có feedback
      if (result.isClose || result.isWarm) {
        // Gần đúng, thêm gợi ý thông minh
        const smartHint = generateHintFromGuess(currentQuestion.answer, guess);
        
        setModalContent({
          title: result.feedback,
          message: `${smartHint}\n\nĐộ tương tự: ${result.similarity.toFixed(1)}%`,
          isClose: true
        });
        setShowModal(true);
      }
    }
    
    setGuess('');
  };

  /**
   * Tiếp tục câu tiếp theo
   */
  const handleContinue = () => {
    setShowModal(false);
    
    // Safety check để tránh race condition
    if (questionNumber >= maxQuestions) {
      endGame();
      return;
    }
    
    // Reset tất cả state trước khi chuyển câu
    setIsAnswered(false);
    setCurrentQuestionScore(0);
    setGuess('');
    setAttempts([]);
    setCurrentHintIndex(0);
    setVisibleHints([]);
    
    // Increment question number và load câu mới
    const nextQuestionNumber = questionNumber + 1;
    setQuestionNumber(nextQuestionNumber);
    
    // Delay nhỏ để đảm bảo state đã được reset
    setTimeout(() => {
      loadNewQuestion();
    }, 10);
  };

  /**
   * Bỏ qua câu hiện tại
   */
  const handleSkip = () => {
    // Increment question number nhưng không cộng điểm
    const nextQuestionNumber = questionNumber + 1;
    
    setIsAnswered(true);
    
    setModalContent({
      title: '😅 Bỏ qua câu này',
      message: `Đáp án là: "${currentQuestion.answer}"\n\nDanh mục: ${currentQuestion.category}\nBạn đã sử dụng ${attempts.length} lần đoán\n\nCâu tiếp theo: ${nextQuestionNumber}/${maxQuestions}`,
      isSkip: true,
      showContinue: nextQuestionNumber <= maxQuestions
    });
    setShowModal(true);
  };

  /**
   * Kết thúc game
   */
  const endGame = () => {
    setIsGameOver(true);
    const accuracy = getAccuracyPercentage(correctAnswers, questionNumber);
    const message = getPerformanceMessage(accuracy, gameScore);
    
    // Lưu thống kê
    const finalStats = {
      questionsAnswered: questionNumber,
      correctAnswers: correctAnswers,
      score: gameScore,
      accuracy: accuracy,
      categoryResults: calculateCategoryResults()
    };
    
    saveGameStats(finalStats);
    loadGameStats();
    
    setModalContent({
      title: '🏁 Kết thúc game!',
      message: `${message}\n\nKết quả cuối:\n🎯 Đúng: ${correctAnswers}/${questionNumber} câu\n📊 Độ chính xác: ${accuracy}%\n🏆 Tổng điểm: ${gameScore}`,
      isGameOver: true
    });
    setShowModal(true);
  };

  /**
   * Tính kết quả theo category
   */
  const calculateCategoryResults = () => {
    // Simplified version - in real game would track per question
    const results = {};
    if (currentQuestion) {
      results[currentQuestion.category] = {
        correct: isAnswered && currentQuestionScore > 0 ? 1 : 0,
        total: 1
      };
    }
    return results;
  };

  /**
   * Đóng modal
   */
  const handleCloseModal = () => {
    // Nếu đang ở trạng thái cần chuyển tiếp, không cho đóng modal bằng nút X
    if (modalContent && modalContent.showContinue) return;
    setShowModal(false);
  };

  /**
   * Chơi lại
   */
  const handlePlayAgain = () => {
    setUsedQuestionIds([]);
    setCorrectAnswers(0);
    setGameScore(0);
    setQuestionNumber(1);
    setIsGameOver(false);
    setShowModal(false);
    setIsAnswered(false);
    setCurrentQuestionScore(0);
    loadNewQuestion();
  };

  /**
   * Xóa thống kê
   */
  const handleClearStats = () => {
    clearGameStats();
    loadGameStats();
    setShowStats(false);
  };

  if (!currentQuestion) {
    return (
      <div className="guess-who-screen">
        <div className="loading">Đang tải câu đố...</div>
      </div>
    );
  }

  return (
    <div className="guess-who-screen">
      <div className="game-container">
        {/* Header */}
        <div className="game-header">
          <Button
            variant="secondary"
            onClick={onBackHome}
            className="back-btn"
          >
            ← Về trang chủ
          </Button>
          
          <div className="game-info">
            <div className="question-counter">
              Câu {questionNumber}/{maxQuestions}
            </div>
            <div className="score-info">
              <span className="current-score">Điểm: {gameScore}</span>
              <span className="correct-count">Đúng: {correctAnswers}</span>
            </div>
          </div>
        </div>

        {/* Game Title */}
        <div className="game-title">
          <h1>🕵️ Tôi là ai?</h1>
          <p>Đoán đối tượng qua những gợi ý hài hước</p>
        </div>

        {/* Question Info */}
        <div className="question-info">
          <div className="category-badge">
            📂 {currentQuestion.category}
          </div>
          <div className="hint-progress">
            Gợi ý: {currentHintIndex + 1}/{maxHints}
          </div>
        </div>

        {/* Hints Section */}
        <div className="hints-section">
          <h3>🔍 Gợi ý:</h3>
          <div className="hints-list">
            {visibleHints.map((hint, index) => (
              <div key={index} className={`hint-item hint-${index + 1}`}>
                <div className="hint-number">{index + 1}</div>
                <div className="hint-text">{hint}</div>
              </div>
            ))}
          </div>
          
          {currentHintIndex < maxHints - 1 && currentHintIndex < currentQuestion.hints.length - 1 && !isAnswered && (
            <div className="hint-actions">
              <button
                onClick={showNextHint}
                className="next-hint-btn"
              >
                💡 Gợi ý tiếp theo
              </button>
            </div>
          )}
        </div>

        {/* Answer Form */}
        {!isAnswered && (
          <div className="answer-section">
            <form onSubmit={handleSubmit} className="answer-form">
              <div className="form-group">
                <label htmlFor="answer-input">
                  🤔 Bạn nghĩ tôi là ai?
                </label>
                <div className="input-container">
                  <input
                    ref={inputRef}
                    id="answer-input"
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="answer-input"
                    disabled={isAnswered}
                  />
                  <button
                    type="submit"
                    disabled={!guess.trim() || isAnswered}
                    className="submit-btn"
                  >
                    🎯 Trả lời
                  </button>
                </div>
              </div>
            </form>
            
          </div>
        )}

        {/* Attempts History */}
        {attempts.length > 0 && (
          <div className="attempts-section">
            <h3>📝 Lịch sử đoán:</h3>
            <div className="attempts-list">
              {attempts.map((attempt, index) => (
                <div key={index} className={`attempt-item ${
                  attempt.result.isCorrect ? 'correct' : 
                  attempt.result.isClose ? 'close' : 
                  attempt.result.isWarm ? 'warm' : 'cold'
                }`}>
                  <div className="attempt-guess">
                    <strong>"{attempt.guess}"</strong>
                  </div>
                  <div className="attempt-feedback">
                    {attempt.result.feedback}
                    {attempt.result.similarity && (
                      <span className="similarity">
                        ({attempt.result.similarity.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {attempts.length === 0 && !isAnswered && (
          <div className="instructions">
            <h3>🎮 Cách chơi:</h3>
            <ul>
              <li>Đọc gợi ý đầu tiên và suy nghĩ</li>
              <li>Nhập câu trả lời vào ô bên dưới</li>
              <li>Nếu khó quá, xem thêm gợi ý (nhưng sẽ bị trừ điểm)</li>
              <li>Càng ít gợi ý thì điểm càng cao</li>
              <li>Có thể bỏ qua nếu quá khó</li>
            </ul>
          </div>
        )}
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={modalContent.title}
        className={`result-modal ${modalContent.isSuccess ? 'success' : modalContent.isClose ? 'close' : ''}`}
      >
        <div className="modal-content">
          <p style={{ whiteSpace: 'pre-line' }}>{modalContent.message}</p>
          
          <div className="modal-actions">
            {modalContent.isGameOver ? (
              <>
                <button
                  onClick={handlePlayAgain}
                  className="action-btn primary"
                >
                  🔄 Chơi lại
                </button>
                <button
                  onClick={onBackHome}
                  className="action-btn secondary"
                >
                  🏠 Về trang chủ
                </button>
              </>
            ) : modalContent.showContinue ? (
              <button
                onClick={handleContinue}
                className="action-btn primary"
              >
                ➡️ Câu tiếp theo
              </button>
            ) : (
              <button
                onClick={handleCloseModal}
                className="action-btn secondary"
              >
                👍 OK
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Stats Modal */}
      <Modal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        title="📊 Thống kê Game"
        className="stats-modal"
      >
        <div className="stats-content">
          {gameStats && gameStats.totalGames > 0 ? (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{gameStats.totalGames}</div>
                  <div className="stat-label">Số game đã chơi</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">{gameStats.bestScore}</div>
                  <div className="stat-label">Điểm cao nhất</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">
                    {gameStats.totalQuestions > 0 ? 
                      Math.round((gameStats.totalCorrect / gameStats.totalQuestions) * 100) : 0}%
                  </div>
                  <div className="stat-label">Tỷ lệ đúng</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-number">{gameStats.totalCorrect}</div>
                  <div className="stat-label">Tổng câu đúng</div>
                </div>
              </div>
              
              <div className="last-played">
                <strong>Lần chơi cuối:</strong> {formatLastPlayed(gameStats.lastPlayed)}
              </div>
              
              <div className="stats-actions">
                <button
                  onClick={handleClearStats}
                  className="action-btn secondary"
                >
                  🗑️ Xóa thống kê
                </button>
              </div>
            </>
          ) : (
            <div className="empty-stats">
              <p>📈 Chưa có dữ liệu thống kê. Hãy chơi vài game trước!</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GuessWhoScreen; 