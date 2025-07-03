import React, { useState, useEffect, useRef } from 'react';
import Timer from '../common/Timer';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { 
  checkAnswer,
  calculateBehaviorScore,
  getNewBehaviorQuestion,
  isBehaviorGameFinished,
  getAccuracyPercentage,
  getBehaviorPerformanceMessage,
  shuffleOptions
} from '../../utils/behaviorQuizLogic';
import { GAME_CONFIG } from '../../utils/constants';
import './QuizScreen.css';

/**
 * Component BehaviorQuizScreen - Màn hình chơi game Vua Ứng Xử
 * @param {Object} props - Props của component
 * @param {Function} props.onBackHome - Callback khi quay về trang chủ
 */
const BehaviorQuizScreen = ({ onBackHome }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [currentCorrectIndex, setCurrentCorrectIndex] = useState(-1);
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [gameStarted, setGameStarted] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const timerKey = useRef(0);
  const maxQuestions = 10;

  // Khởi tạo game
  useEffect(() => {
    loadNewQuestion();
  }, []);

  /**
   * Tải câu hỏi mới
   */
  const loadNewQuestion = () => {
    const questionData = getNewBehaviorQuestion(usedQuestions);
    
    if (!questionData || isBehaviorGameFinished(usedQuestions, maxQuestions)) {
      endGame();
      return;
    }

    const { question, index } = questionData;
    
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
    setUsedQuestions(prev => [...prev, index]);
    timerKey.current += 1; // Reset timer
  };

  /**
   * Xử lý khi chọn đáp án
   */
  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered || isGameOver) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const isCorrect = checkAnswer(answerIndex, currentCorrectIndex);
    const timeLeft = 30; // Sẽ được cập nhật từ Timer component
    const questionScore = isCorrect ? calculateBehaviorScore(timeLeft, 30) : 0;
    
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
    setUsedQuestions([]);
    setCorrectAnswers(0);
    setTotalScore(0);
    setQuestionNumber(1);
    setIsGameOver(false);
    setShowModal(false);
    setIsAnswered(false);
    loadNewQuestion();
  };

  if (!currentQuestion) {
    return (
      <div className="quiz-screen">
        <div className="loading">Đang tải câu hỏi...</div>
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
            duration={30}
            onTimeUp={handleTimeUp}
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
                isAnswered 
                  ? (index === currentCorrectIndex 
                      ? 'correct' 
                      : (index === selectedAnswer ? 'incorrect' : 'disabled')
                    )
                  : ''
              }`}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered || isGameOver}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">
                {option}
              </span>
            </button>
          ))}
        </div>

        {/* Game Over Actions */}
        {isGameOver && (
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
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={modalContent.title}
      >
        <div className="modal-content">
          <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
            {modalContent.message}
          </p>
          
          {modalContent.isGameOver && (
            <div className="modal-actions">
              <Button
                variant="primary"
                onClick={handlePlayAgain}
                className="modal-action-btn"
              >
                🔄 Chơi lại
              </Button>
              <Button
                variant="secondary"
                onClick={onBackHome}
                className="modal-action-btn"
              >
                🏠 Về trang chủ
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default BehaviorQuizScreen; 