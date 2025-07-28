import React, { useState, useEffect, useRef } from 'react';
import Timer from '../common/Timer';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { GAME_CONFIG } from '../../utils/constants';
import { behaviorAPI } from '../../services/api';
import { showError } from '../../utils/toast';
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
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);
  
  const timerKey = useRef(0);
  const maxQuestions = GAME_CONFIG.BEHAVIOR_QUIZ?.MAX_QUESTIONS || 10;

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
      console.log("Đang lấy câu hỏi từ behaviorAPI, exclude:", usedQuestionIds);
      const response = await behaviorAPI.getRandomQuestion(usedQuestionIds);
      
      if (!response.success || !response.data || !response.data.question) {
        console.error('Không thể lấy câu hỏi mới:', response.message);
        setModalContent({
          title: 'Lỗi',
          message: 'Không thể tải câu hỏi mới. Vui lòng thử lại sau.',
          isError: true
        });
        setShowModal(true);
        setIsLoading(false);
        return;
      }
      
      const question = response.data.question;
      const questionIndex = response.data.index || response.data.id;
      
      if (!question || !question.options || !Array.isArray(question.options)) {
        console.error('Câu hỏi không hợp lệ:', question);
        setModalContent({
          title: 'Lỗi',
          message: 'Dữ liệu câu hỏi không hợp lệ. Vui lòng thử lại sau.',
          isError: true
        });
        setShowModal(true);
        setIsLoading(false);
        return;
      }
      
      // Thêm ID câu hỏi vào danh sách đã sử dụng
      if (questionIndex) {
        setUsedQuestionIds(prev => [...prev, questionIndex]);
      }
      
      // Set câu hỏi hiện tại
      setCurrentQuestion(question);
      
      // Xáo trộn các lựa chọn
      try {
        const shuffleResponse = await behaviorAPI.shuffleOptions(question);
        
        if (shuffleResponse.success) {
          setCurrentOptions(shuffleResponse.data.options);
          setCurrentCorrectIndex(shuffleResponse.data.correctIndex);
        } else {
          // Fallback: Sử dụng các lựa chọn từ câu hỏi gốc
          const options = [...question.options];
          const correctIndex = options.indexOf(question.correct_answer);
          setCurrentOptions(options);
          setCurrentCorrectIndex(correctIndex);
        }
      } catch (error) {
        // Fallback: Sử dụng các lựa chọn từ câu hỏi gốc
        const options = [...question.options];
        const correctIndex = options.indexOf(question.correct_answer);
        setCurrentOptions(options);
        setCurrentCorrectIndex(correctIndex);
      }
      
      // Reset trạng thái
      setSelectedAnswer(-1);
      setIsAnswered(false);
      setGameStarted(true);
      timerKey.current += 1;
      
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi mới:', error);
      setModalContent({
        title: 'Lỗi',
        message: 'Không thể tải câu hỏi mới. Vui lòng thử lại sau.',
        isError: true
      });
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý khi chọn đáp án
   */
  const handleAnswerSelect = async (answerIndex) => {
    if (isAnswered || isGameOver) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    try {
      // Gửi câu trả lời đến API để kiểm tra
      const checkResponse = await behaviorAPI.checkAnswer({
        questionId: usedQuestionIds[usedQuestionIds.length - 1],
        selectedAnswer: answerIndex,
        correctAnswer: currentCorrectIndex,
        timeRemaining,
        maxTime: GAME_CONFIG.BEHAVIOR_QUIZ.TIME_PER_QUESTION
      });
      
      const isCorrect = checkResponse.data.correct;
      
      if (isCorrect) {
        // Chỉ cộng 1 điểm khi trả lời đúng
        setCorrectAnswers(prev => prev + 1);
        setTotalScore(prev => prev + 1);
      } else {
        // Hiển thị toast thông báo khi trả lời sai
        showError(`Đáp án đúng là: "${currentOptions[currentCorrectIndex]}"`);
      }
      
      // Nếu đã chơi đủ số câu hỏi, kết thúc game
      if (questionNumber >= maxQuestions) {
        setTimeout(() => {
          endGame();
        }, 2000);
      } else {
        // Chuyển sang câu hỏi tiếp theo sau 2 giây bất kể đúng hay sai
        setTimeout(() => {
          setQuestionNumber(prev => prev + 1);
          loadNewQuestion();
        }, 2000);
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra câu trả lời:', error);
      
      // Fallback khi có lỗi API
      const isCorrect = answerIndex === currentCorrectIndex;
      
      if (isCorrect) {
        // Chỉ cộng 1 điểm khi trả lời đúng
        setCorrectAnswers(prev => prev + 1);
        setTotalScore(prev => prev + 1);
      } else {
        // Hiển thị toast thông báo khi trả lời sai
        showError(`Đáp án đúng là: "${currentOptions[currentCorrectIndex]}"`);
      }
      
      // Tương tự như trên, chuyển câu hỏi hoặc kết thúc game
      if (questionNumber >= maxQuestions) {
        setTimeout(() => {
          endGame();
        }, 2000);
      } else {
        // Chuyển sang câu hỏi tiếp theo sau 2 giây
        setTimeout(() => {
          setQuestionNumber(prev => prev + 1);
          loadNewQuestion();
        }, 2000);
      }
    }
  };

  /**
   * Xử lý khi hết thời gian
   */
  const handleTimeUp = () => {
    if (isAnswered || isGameOver) return;
    
    setIsAnswered(true);
    
    // Hiển thị toast thông báo đáp án đúng khi hết giờ
    showError(`Hết giờ! Đáp án đúng là: "${currentOptions[currentCorrectIndex]}"`);
    
    // Nếu đã chơi đủ số câu hỏi, kết thúc game
    if (questionNumber >= maxQuestions) {
      setTimeout(() => {
        endGame();
      }, 2000);
    } else {
      // Chuyển sang câu hỏi tiếp theo sau 2 giây
      setTimeout(() => {
        setQuestionNumber(prev => prev + 1);
        loadNewQuestion();
      }, 2000);
    }
  };

  /**
   * Kết thúc game
   */
  const endGame = async () => {
    setIsGameOver(true);
    
    try {
      // Gửi kết quả trò chơi lên server
      const gameStats = {
        correctAnswers,
        totalQuestions: maxQuestions,
        totalScore
      };
      
      const resultResponse = await behaviorAPI.submitGameResult(gameStats);
      
      const accuracyPercentage = (correctAnswers / maxQuestions) * 100;
      const performanceMessage = resultResponse.data.performanceMessage || 
                             (accuracyPercentage >= 80 ? 'Xuất sắc! Bạn thật biết cách ứng xử!' :
                              accuracyPercentage >= 60 ? 'Tốt lắm! Tiếp tục rèn luyện nhé!' :
                              accuracyPercentage >= 40 ? 'Khá tốt! Hãy học thêm về cách ứng xử nhé!' :
                              'Cố gắng lên! Bạn có thể học hỏi thêm về cách ứng xử trong các tình huống!');
      
      setModalContent({
        title: 'Kết thúc trò chơi!',
        message: `Kết quả:\n✅ Câu đúng: ${correctAnswers}/${maxQuestions}\n💯 Điểm số: ${totalScore}\n\n${performanceMessage}`,
        isGameOver: true
      });
      setShowModal(true);
    } catch (error) {
      console.error('Lỗi khi kết thúc trò chơi:', error);
      
      // Fallback khi không gọi được API
      const accuracyPercentage = (correctAnswers / maxQuestions) * 100;
      const performanceMessage = accuracyPercentage >= 80 ? 'Xuất sắc! Bạn thật biết cách ứng xử!' :
                                accuracyPercentage >= 60 ? 'Tốt lắm! Tiếp tục rèn luyện nhé!' :
                                accuracyPercentage >= 40 ? 'Khá tốt! Hãy học thêm về cách ứng xử nhé!' :
                                'Cố gắng lên! Bạn có thể học hỏi thêm về cách ứng xử trong các tình huống!';
      
      setModalContent({
        title: 'Kết thúc trò chơi!',
        message: `Kết quả:\n✅ Câu đúng: ${correctAnswers}/${maxQuestions}\n💯 Điểm số: ${totalScore}\n\n${performanceMessage}`,
        isGameOver: true
      });
      setShowModal(true);
    }
  };

  /**
   * Xử lý khi đóng modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
    
    // Không cần tự động chuyển câu hỏi ở đây vì đã xử lý trong handleAnswerSelect và handleTimeUp
  };

  /**
   * Xử lý khi người chơi muốn chơi lại
   */
  const handlePlayAgain = () => {
    // Reset lại trạng thái game
    setCurrentQuestion(null);
    setCurrentOptions([]);
    setCurrentCorrectIndex(-1);
    setSelectedAnswer(-1);
    setCorrectAnswers(0);
    setTotalScore(0);
    setQuestionNumber(1);
    setIsGameOver(false);
    setShowModal(false);
    setGameStarted(false);
    setIsAnswered(false);
    setUsedQuestionIds([]);
    
    // Tải câu hỏi mới
    loadNewQuestion();
  };

  return (
    <div className="quiz-screen">
      {/* Header */}
      <div className="quiz-header">
        <Button 
          variant="secondary"
          onClick={onBackHome}
        >
          🏠 Trang chủ
        </Button>
        <div className="quiz-stats">
          <span className="quiz-score">Điểm: {totalScore}</span>
          <span className="quiz-count">Câu hỏi: {questionNumber}/{maxQuestions}</span>
          <span className="quiz-accuracy">Đúng: {correctAnswers}/{questionNumber - (isAnswered ? 0 : 1)}</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="quiz-content">
        {isLoading ? (
          <div className="loading-indicator">Đang tải câu hỏi...</div>
        ) : currentQuestion ? (
          <>
            {/* Timer */}
            {gameStarted && !isAnswered && !isGameOver && (
              <Timer 
                key={timerKey.current}
                duration={GAME_CONFIG.BEHAVIOR_QUIZ.TIME_PER_QUESTION} 
                onTimeUp={handleTimeUp}
                onTimeUpdate={handleTimeUpdate}
                isActive={!isAnswered && !isGameOver}
              />
            )}
            
            {/* Question */}
            <div className="question-container">
              <h3 className="question-text">{currentQuestion.question}</h3>
              
              {currentQuestion.category && (
                <div className="question-category">
                  Loại: {currentQuestion.category}
                </div>
              )}
              
              {currentQuestion.difficulty && (
                <div className="question-difficulty">
                  Độ khó: {currentQuestion.difficulty}
                </div>
              )}
            </div>
            
            {/* Options */}
            <div className="options-container">
              {currentOptions.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${selectedAnswer === index ? 'selected' : ''} 
                             ${isAnswered ? (index === currentCorrectIndex ? 'correct' : 
                                            selectedAnswer === index ? 'incorrect' : '') : ''}`}
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
            
            {/* Explanation */}
            {isAnswered && currentQuestion.explanation && (
              <div className="explanation">
                <h4>Giải thích:</h4>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </>
        ) : (
          <div className="error-message">
            Không thể tải câu hỏi. Vui lòng thử lại.
          </div>
        )}
      </div>
      
      {/* Modal */}
      <Modal
        isOpen={showModal}
        title={modalContent.title || ''}
        message={modalContent.message || ''}
        onClose={handleCloseModal}
        confirmText={modalContent.isGameOver ? "Chơi lại" : ''}
        onConfirm={modalContent.isGameOver ? handlePlayAgain : undefined}
        cancelText={modalContent.isGameOver ? "Về trang chủ" : "Tiếp tục"}
        onCancel={modalContent.isGameOver ? onBackHome : handleCloseModal}
      />
    </div>
  );
};

export default BehaviorQuizScreen; 