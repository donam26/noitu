import React, { useState, useEffect, useRef } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import {
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
import useGameData from '../../hooks/useGameData';
import './GuessWhoScreen.css';

/**
 * Component GuessWhoScreen - Màn hình game "Tôi là ai"
 * @param {Object} props - Props của component
 * @param {Function} props.onBackHome - Callback khi quay về trang chủ
 */
const GuessWhoScreen = ({ onBackHome }) => {
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
  const [showStats, setShowStats] = useState(false);
  const [gameStats, setGameStats] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [currentQuestionScore, setCurrentQuestionScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sử dụng custom hook
  const {
    loading,
    error,
    usedGuessWhoIds,
    fetchGuessWhoData,
    getRandomGuessWhoQuestion,
    resetGuessWhoIds
  } = useGameData();
  
  const inputRef = useRef(null);
  const maxQuestions = 10;
  const maxHints = 4;

  // Load game stats và khởi tạo game
  useEffect(() => {
    loadGameStats();
    fetchGuessWhoData();
  }, [fetchGuessWhoData]);
  
  // Load câu hỏi khi dữ liệu đã sẵn sàng
  useEffect(() => {
    if (!loading && !currentQuestion) {
      loadNewQuestion();
    }
  }, [loading]);

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
    setIsLoading(true);
    
    // Safety check để tránh load khi đã game over
    if (isGameOver || questionNumber > maxQuestions) {
      endGame();
      setIsLoading(false);
      return;
    }
    
    const question = getRandomGuessWhoQuestion();
    
    if (!question || isGameFinished(usedGuessWhoIds, maxQuestions)) {
      endGame();
      setIsLoading(false);
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
    setIsLoading(false);
    
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
    const results = {};
    
    if (currentQuestion && currentQuestion.category) {
      results[currentQuestion.category] = {
        total: questionNumber,
        correct: correctAnswers
      };
    }
    
    return results;
  };

  /**
   * Đóng modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
  };

  /**
   * Chơi lại
   */
  const handlePlayAgain = () => {
    resetGuessWhoIds();
    setQuestionNumber(1);
    setCorrectAnswers(0);
    setGameScore(0);
    setCurrentQuestionScore(0);
    setIsGameOver(false);
    setShowModal(false);
    setIsAnswered(false);
    setGuess('');
    setAttempts([]);
    setCurrentHintIndex(0);
    setVisibleHints([]);
    setCurrentQuestion(null);
    
    // Reload game stats và câu hỏi mới
    loadGameStats();
    loadNewQuestion();
  };

  /**
   * Xóa thống kê game
   */
  const handleClearStats = () => {
    clearGameStats();
    loadGameStats();
    
    setModalContent({
      title: '🗑️ Đã xóa thống kê',
      message: 'Tất cả thống kê chơi game đã được xóa.',
      isInfo: true
    });
    setShowModal(true);
    setShowStats(false);
  };

  // Hiển thị loading
  if (isLoading || loading) {
    return (
      <div className="guess-who-screen">
        <div className="loading">Đang tải câu hỏi...</div>
      </div>
    );
  }
  
  // Hiển thị lỗi
  if (error && !currentQuestion) {
    return (
      <div className="guess-who-screen">
        <div className="error">
          <h3>Không thể tải dữ liệu</h3>
          <p>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Tải lại
          </Button>
        </div>
      </div>
    );
  }

  // Hiển thị thống kê
  if (showStats) {
    return (
      <div className="guess-who-screen">
        <div className="game-container">
          <div className="header">
            <Button
              variant="secondary"
              onClick={() => setShowStats(false)}
              className="back-btn"
            >
              ← Quay lại game
            </Button>
            <h1>📊 Thống kê game</h1>
          </div>
          
          <div className="stats-container">
            <div className="stats-card">
              <h2>Tổng quát</h2>
              <p>Số game đã chơi: {gameStats?.totalGames || 0}</p>
              <p>Tổng số câu đã trả lời: {gameStats?.totalQuestions || 0}</p>
              <p>Số câu trả lời đúng: {gameStats?.totalCorrect || 0}</p>
              <p>Tỷ lệ chính xác: {gameStats?.totalQuestions ? Math.round((gameStats.totalCorrect / gameStats.totalQuestions) * 100) : 0}%</p>
              <p>Tổng điểm: {gameStats?.totalScore || 0}</p>
              <p>Điểm cao nhất: {gameStats?.bestScore || 0}</p>
              <p>Lần chơi gần nhất: {gameStats?.lastPlayed ? formatLastPlayed(gameStats.lastPlayed) : 'Chưa có'}</p>
            </div>
            
            <div className="stats-actions">
              <Button
                variant="secondary"
                onClick={handleClearStats}
                className="clear-stats-btn"
              >
                🗑️ Xóa thống kê
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowStats(false)}
                className="return-btn"
              >
                🎮 Quay lại game
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chưa có câu hỏi
  if (!currentQuestion) {
    return (
      <div className="guess-who-screen">
        <div className="loading">Đang khởi tạo game...</div>
      </div>
    );
  }

  return (
    <div className="guess-who-screen">
      <div className="game-container">
        {/* Header */}
        <div className="header">
          <Button
            variant="secondary"
            onClick={onBackHome}
            className="back-btn"
          >
            ← Trang chủ
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
          
          <Button
            variant="secondary"
            onClick={() => setShowStats(true)}
            className="stats-btn"
          >
            📊 Thống kê
          </Button>
        </div>

        {/* Main content */}
        <div className="game-content">
          <h1 className="game-title">🕵️ Tôi là ai?</h1>
          
          {/* Hints section */}
          <div className="hints-section">
            <h2>Gợi ý:</h2>
            <div className="hints-list">
              {visibleHints.map((hint, index) => (
                <div key={index} className="hint-item">
                  <span className="hint-number">{index + 1}.</span>
                  <span className="hint-text">{hint}</span>
                </div>
              ))}
            </div>
            
            {currentHintIndex < maxHints - 1 && currentHintIndex < currentQuestion.hints.length - 1 && (
              <Button
                variant="secondary"
                onClick={showNextHint}
                className="hint-btn"
                disabled={isAnswered}
              >
                💡 Gợi ý tiếp theo
              </Button>
            )}
          </div>
          
          {/* Answer form */}
          <form onSubmit={handleSubmit} className="answer-form">
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                disabled={isAnswered || isGameOver}
                className="answer-input"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!guess.trim() || isAnswered || isGameOver}
                className="submit-btn"
              >
                Trả lời
              </Button>
            </div>
          </form>
          
          {/* Previous attempts */}
          {attempts.length > 0 && (
            <div className="attempts-section">
              <h3>Các lần đoán trước:</h3>
              <div className="attempts-list">
                {attempts.map((attempt, index) => (
                  <div
                    key={index}
                    className={`attempt-item ${
                      attempt.result.isCorrect
                        ? 'correct'
                        : attempt.result.isClose
                          ? 'close'
                          : attempt.result.isWarm
                            ? 'warm'
                            : 'wrong'
                    }`}
                  >
                    <span className="attempt-text">{attempt.guess}</span>
                    <span className="attempt-similarity">
                      {attempt.result.similarity
                        ? `${attempt.result.similarity.toFixed(1)}%`
                        : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Skip option */}
          {!isAnswered && (
            <Button
              variant="secondary"
              onClick={handleSkip}
              className="skip-btn"
              disabled={isGameOver}
            >
              ⏭️ Bỏ qua
            </Button>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          title={modalContent.title}
          message={modalContent.message}
          onClose={handleCloseModal}
          confirmText={modalContent.showContinue ? "Tiếp tục" : null}
          onConfirm={modalContent.showContinue ? handleContinue : null}
          cancelText={modalContent.isGameOver ? "Chơi lại" : "Tiếp tục"}
          onCancel={modalContent.isGameOver ? handlePlayAgain : modalContent.showContinue ? handleContinue : handleCloseModal}
        />
      </div>
    </div>
  );
};

export default GuessWhoScreen; 