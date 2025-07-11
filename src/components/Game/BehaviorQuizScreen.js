import React, { useState, useEffect, useRef } from 'react';
import Timer from '../common/Timer';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { 
  checkAnswer,
  calculateBehaviorScore,
  isBehaviorGameFinished,
  getAccuracyPercentage,
  getBehaviorPerformanceMessage,
  shuffleOptions
} from '../../utils/behaviorQuizLogic';
import { GAME_CONFIG } from '../../utils/constants';
import useBehaviorData from '../../hooks/useBehaviorData';
import './QuizScreen.css';

/**
 * Component BehaviorQuizScreen - Màn hình chơi game Vua ứng xử
 * @param {Object} props - Props của component
 * @param {Function} props.onBackHome - Callback khi quay về trang chủ
 */
const BehaviorQuizScreen = ({ onBackHome }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [currentCorrectIndex, setCurrentCorrectIndex] = useState(-1);
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [gameStarted, setGameStarted] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(GAME_CONFIG.TIME_LIMIT);
  
  // Sử dụng custom hook để lấy dữ liệu
  const {
    loading,
    error,
    usedQuestions,
    getRandomQuestion,
    resetUsedQuestions
  } = useBehaviorData();
  
  const timerKey = useRef(0);
  const maxQuestions = 10;

  // Hàm cập nhật thời gian còn lại từ Timer
  const handleTimeUpdate = (time) => {
    setTimeRemaining(time);
  };

  // Khởi tạo game
  useEffect(() => {
    loadNewQuestion();
  }, []);

  /**
   * Tải câu hỏi mới
   */
  const loadNewQuestion = async () => {
    setIsLoading(true);
    
    if (questionNumber > maxQuestions) {
      endGame();
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await getRandomQuestion();
      
      if (!result) {
        endGame();
        setIsLoading(false);
        return;
      }
      
      const { question } = result;
      
      if (!question || !question.options || !Array.isArray(question.options)) {
        console.error('Câu hỏi không hợp lệ:', question);
        endGame();
        setIsLoading(false);
        return;
      }
      
      // Xáo trộn các lựa chọn
      const { shuffledOptions, newCorrectIndex } = shuffleOptions(
        question.options, 
        question.correctAnswer
      );
      
      setCurrentQuestion(question);
      setCurrentOptions(shuffledOptions);
      setCurrentCorrectIndex(newCorrectIndex);
      setSelectedAnswer(-1);
      setIsAnswered(false);
      setGameStarted(true);
      timerKey.current += 1; // Reset timer
    } catch (err) {
      console.error('Lỗi khi tải câu hỏi mới:', err);
      endGame();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý khi chọn đáp án
   */
  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered || isGameOver) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const isCorrect = checkAnswer(answerIndex, currentCorrectIndex);
    const questionScore = isCorrect ? calculateBehaviorScore(timeRemaining, GAME_CONFIG.TIME_LIMIT) : 0;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setTotalScore(prev => prev + questionScore);
    }
    
    // Hiển thị kết quả sau 1 giây
    setTimeout(() => {
      if (isCorrect) {
        setModalContent({
          title: '🎉 Chính xác!',
          message: `Tuyệt vời! Bạn được ${questionScore} điểm!\n\n${currentQuestion.explanation || ''}`,
          isSuccess: true
        });
      } else {
        setModalContent({
          title: '❌ Chưa đúng!',
          message: `Đáp án đúng là: "${currentOptions[currentCorrectIndex]}"\n\n${currentQuestion.explanation || ''}`,
          isSuccess: false
        });
      }
      
      setShowModal(true);
      
      // Tự động chuyển câu sau 3 giây
      setTimeout(() => {
        setShowModal(false);
        if (questionNumber < maxQuestions) {
          setQuestionNumber(prev => prev + 1);
          loadNewQuestion();
        } else {
          endGame();
        }
      }, 3000);
      
    }, 1000);
  };

  /**
   * Xử lý khi hết thời gian
   */
  const handleTimeUp = () => {
    if (isAnswered || isGameOver) return;
    
    setIsAnswered(true);
    
    setModalContent({
      title: '⏰ Hết thời gian!',
      message: `Đáp án đúng là: "${currentOptions[currentCorrectIndex]}"\n\n${currentQuestion.explanation || ''}`,
      isSuccess: false
    });
    setShowModal(true);
    
    // Tự động chuyển câu sau 3 giây
    setTimeout(() => {
      setShowModal(false);
      if (questionNumber < maxQuestions) {
        setQuestionNumber(prev => prev + 1);
        loadNewQuestion();
      } else {
        endGame();
      }
    }, 3000);
  };

  /**
   * Kết thúc game
   */
  const endGame = () => {
    setIsGameOver(true);
    const accuracy = getAccuracyPercentage(correctAnswers, questionNumber - 1);
    const message = getBehaviorPerformanceMessage(accuracy);
    
    setModalContent({
      title: '🏁 Kết thúc game!',
      message: `${message}\n\nKết quả: ${correctAnswers}/${questionNumber - 1} câu đúng\nĐộ chính xác: ${accuracy}%\nTổng điểm: ${totalScore}`,
      isGameOver: true
    });
    setShowModal(true);
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
    resetUsedQuestions();
    setCorrectAnswers(0);
    setTotalScore(0);
    setQuestionNumber(1);
    setIsGameOver(false);
    setShowModal(false);
    setIsAnswered(false);
    loadNewQuestion();
  };

  // Hiển thị trạng thái loading
  if (isLoading || loading) {
    return (
      <div className="quiz-screen">
        <div className="loading">Đang tải câu hỏi...</div>
      </div>
    );
  }
  
  // Hiển thị lỗi
  if (error && !currentQuestion) {
    return (
      <div className="quiz-screen">
        <div className="error">
          <h3>Không thể tải câu hỏi</h3>
          <p>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Tải lại
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-screen">
        <div className="loading">Đang khởi tạo game...</div>
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
            className="back-btn"
          >
            ← Về trang chủ
          </Button>
          
          <div className="game-info">
            <div className="question-counter">
              Câu {questionNumber}/{maxQuestions}
            </div>
            <div className="score-info">
              <span className="current-score">
                Điểm: {totalScore}
              </span>
              <span className="correct-count">
                Đúng: {correctAnswers}
              </span>
            </div>
          </div>
        </div>

        {/* Game Title */}
        <div className="game-title">
          <h1>🤝 Vua Ứng Xử</h1>
          <p>Kiến thức đạo đức và ứng xử trong xã hội</p>
        </div>

        {/* Timer */}
        <div className="timer-section">
          <Timer
            key={timerKey.current}
            duration={GAME_CONFIG.TIME_LIMIT}
            onTimeUp={handleTimeUp}
            onTimeUpdate={handleTimeUpdate}
            isActive={gameStarted && !isAnswered && !isGameOver}
          />
        </div>

        {/* Question */}
        <div className="question-section">
          <div className="question-text">
            {currentQuestion.question}
          </div>
        </div>

        {/* Options */}
        <div className="options-section">
          {currentOptions.map((option, index) => (
            <button
              key={index}
              className={`option-button ${
                selectedAnswer === index 
                  ? (index === currentCorrectIndex ? 'correct' : 'incorrect')
                  : ''
              } ${isAnswered ? 'disabled' : ''}`}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered || isGameOver}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          title={modalContent.title}
          message={modalContent.message}
          onClose={modalContent.isGameOver ? null : handleCloseModal}
          confirmText={modalContent.isGameOver ? "Chơi lại" : null}
          onConfirm={modalContent.isGameOver ? handlePlayAgain : null}
          cancelText={modalContent.isGameOver ? "Về trang chủ" : "OK"}
          onCancel={modalContent.isGameOver ? onBackHome : handleCloseModal}
        />
      </div>
    </div>
  );
};

export default BehaviorQuizScreen; 