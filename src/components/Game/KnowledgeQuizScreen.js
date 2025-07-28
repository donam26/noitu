import React, { useState, useEffect, useRef } from 'react';
import Timer from '../common/Timer';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { GAME_CONFIG } from '../../utils/constants';
import { knowledgeAPI } from '../../services/api';
import { showError } from '../../utils/toast';
import './QuizScreen.css';

/**
 * Component KnowledgeQuizScreen - Màn hình chơi game Vua Kiến Thức
 * @param {Object} props - Props của component
 * @param {Function} props.onBackHome - Callback khi quay về trang chủ
 */
const KnowledgeQuizScreen = ({ onBackHome }) => {
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
  const maxQuestions = GAME_CONFIG.KNOWLEDGE_QUIZ?.MAX_QUESTIONS || 10;

  // Khởi tạo game
  useEffect(() => {
    loadNewQuestion();
  }, []);

  // Hàm cập nhật thời gian còn lại từ Timer
  const handleTimeUpdate = (time) => {
    setTimeRemaining(time);
  };

  /**
   * Hàm xáo trộn mảng (Fisher-Yates shuffle algorithm)
   * @param {Array} array - Mảng cần xáo trộn
   * @returns {Array} Mảng đã được xáo trộn
   */
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

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
      console.log("Đang lấy câu hỏi từ knowledgeAPI, exclude:", usedQuestionIds);
      const response = await knowledgeAPI.getRandomQuestion(usedQuestionIds);
      
      console.log("Phản hồi từ API:", response);
      
      if (!response.success || !response.data || !response.data.question) {
        console.error('Không thể lấy câu hỏi mới:', response.message);
        setModalContent({
          title: 'Lỗi khi tải câu hỏi',
          message: `Không thể tải câu hỏi: ${response.message || 'Lỗi không xác định'}\n\nVui lòng thử lại sau.`,
          isError: true
        });
        setShowModal(true);
        setIsLoading(false);
        return;
      }
      
      const question = response.data.question;
      const questionId = response.data.id || response.data.index;
      
      console.log("Đã nhận câu hỏi:", question);
      console.log("ID câu hỏi:", questionId);
      
      if (!question || !question.options || !Array.isArray(question.options)) {
        console.error('Câu hỏi không hợp lệ:', question);
        setModalContent({
          title: 'Lỗi dữ liệu',
          message: 'Dữ liệu câu hỏi không hợp lệ. Vui lòng thử lại sau.',
          isError: true
        });
        setShowModal(true);
        setIsLoading(false);
        return;
      }
      
      // Thêm ID câu hỏi vào danh sách đã sử dụng
      if (questionId) {
        setUsedQuestionIds(prev => [...prev, questionId]);
      }
      
      // Set câu hỏi hiện tại
      setCurrentQuestion(question);
      
      // Xử lý các lựa chọn và đáp án đúng
      // Vì backend không có endpoint shuffle-options, nên xử lý trực tiếp trên client
      const correctAnswer = question.correctAnswer !== undefined ? question.correctAnswer : 0;
      const originalOptions = [...question.options];
      
      // Lưu đáp án đúng trước khi xáo trộn
      const correctOption = originalOptions[correctAnswer];
      
      // Xáo trộn các lựa chọn
      const shuffledOptions = shuffleArray(originalOptions);
      
      // Tìm vị trí mới của đáp án đúng sau khi xáo trộn
      const newCorrectIndex = shuffledOptions.indexOf(correctOption);
      
      setCurrentOptions(shuffledOptions);
      setCurrentCorrectIndex(newCorrectIndex);
      
      // Reset trạng thái câu hỏi
      setSelectedAnswer(-1);
      setIsAnswered(false);
      setGameStarted(true);
      timerKey.current += 1;
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi mới:', error);
      setModalContent({
        title: 'Lỗi kết nối',
        message: 'Không thể tải câu hỏi mới. Vui lòng kiểm tra kết nối và thử lại.',
        isError: true
      });
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý khi người chơi chọn câu trả lời
   * @param {number} answerIndex - Chỉ số câu trả lời được chọn
   */
  const handleAnswerSelect = async (answerIndex) => {
    if (isAnswered || isGameOver) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    // Vì backend không có endpoint check-answer, nên kiểm tra đáp án trực tiếp trên client
    const isCorrect = answerIndex === currentCorrectIndex;
      
      if (isCorrect) {
      // Cộng điểm khi trả lời đúng
        setCorrectAnswers(prev => prev + 1);
        setTotalScore(prev => prev + 1);
      } else {
      // Hiển thị thông báo khi sai
      const correctOptionText = currentOptions[currentCorrectIndex] || 'không xác định';
      showError(`Đáp án đúng là: ${correctOptionText}`);
      }
      
    // Chờ 2 giây trước khi chuyển câu hỏi tiếp
    setTimeout(() => {
      // Nếu đã chơi đủ số câu hỏi, kết thúc game
      if (questionNumber >= maxQuestions) {
          endGame();
      } else {
        // Chuyển sang câu hỏi tiếp theo
        setQuestionNumber(prev => prev + 1);
        loadNewQuestion();
      }
    }, 2000);
  };

  /**
   * Xử lý khi hết thời gian
   */
  const handleTimeUp = () => {
    if (isAnswered || isGameOver) return;
    
    setIsAnswered(true);
    
    // Đảm bảo rằng có đáp án đúng để hiển thị
    const correctOptionText = currentOptions[currentCorrectIndex] || 'không xác định';
    showError(`Hết giờ! Đáp án đúng là: ${correctOptionText}`);
    
    // Chờ 2 giây trước khi chuyển câu hỏi tiếp
    setTimeout(() => {
    // Nếu đã chơi đủ số câu hỏi, kết thúc game
    if (questionNumber >= maxQuestions) {
        endGame();
    } else {
        // Chuyển sang câu hỏi tiếp theo
        setQuestionNumber(prev => prev + 1);
        loadNewQuestion();
      }
      }, 2000);
  };

  /**
   * Xử lý khi đóng modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
    
    // Nếu chưa kết thúc game, tải câu hỏi tiếp theo
    if (!isGameOver && isAnswered) {
      setQuestionNumber(prev => prev + 1);
      setTimeout(() => {
        loadNewQuestion();
      }, 500);
    }
  };

  /**
   * Kết thúc trò chơi
   */
  const endGame = async () => {
    setIsGameOver(true);
    
    try {
      const gameStats = {
        correctAnswers,
        totalQuestions: maxQuestions,
        totalScore
      };
      
      // Gửi kết quả trò chơi lên server nếu có API endpoint
      let performanceMessage = '';
      try {
      const resultResponse = await knowledgeAPI.submitGameResult(gameStats);
        if (resultResponse && resultResponse.data && resultResponse.data.performanceMessage) {
          performanceMessage = resultResponse.data.performanceMessage;
        }
      } catch (error) {
        console.log('Không thể gửi kết quả trò chơi:', error);
      }
      
      // Nếu không có performanceMessage từ server, tự tạo thông báo
      if (!performanceMessage) {
      const accuracyPercentage = (correctAnswers / maxQuestions) * 100;
        performanceMessage = accuracyPercentage >= 80 ? 'Xuất sắc! Bạn thật thông minh!' :
                               accuracyPercentage >= 60 ? 'Tốt lắm! Tiếp tục cố gắng nhé!' :
                               accuracyPercentage >= 40 ? 'Khá tốt! Hãy học thêm nhé!' :
                            'Cố gắng lên! Bạn có thể làm tốt hơn!';
      }
      
      setModalContent({
        title: 'Kết thúc trò chơi!',
        message: `Kết quả:\n✅ Câu đúng: ${correctAnswers}/${maxQuestions}\n💯 Điểm số: ${totalScore}\n\n${performanceMessage}`,
        isGameOver: true
      });
      setShowModal(true);
    } catch (error) {
      console.error('Lỗi khi kết thúc trò chơi:', error);
      
      // Fallback khi có lỗi
      const accuracyPercentage = (correctAnswers / maxQuestions) * 100;
      const performanceMessage = accuracyPercentage >= 80 ? 'Xuất sắc! Bạn thật thông minh!' :
                                 accuracyPercentage >= 60 ? 'Tốt lắm! Tiếp tục cố gắng nhé!' :
                                 accuracyPercentage >= 40 ? 'Khá tốt! Hãy học thêm nhé!' :
                                 'Cố gắng lên! Bạn có thể làm tốt hơn!';
                                 
      setModalContent({
        title: 'Kết thúc trò chơi!',
        message: `Kết quả:\n✅ Câu đúng: ${correctAnswers}/${maxQuestions}\n💯 Điểm số: ${totalScore}\n\n${performanceMessage}`,
        isGameOver: true
      });
      setShowModal(true);
    }
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
                duration={GAME_CONFIG.KNOWLEDGE_QUIZ.TIME_PER_QUESTION} 
                onTimeUp={handleTimeUp}
                onTimeUpdate={handleTimeUpdate}
                isActive={!isAnswered && !isGameOver}
              />
            )}
            
            {/* Question */}
            <div className="question-container">
              <h3 className="question-text">{currentQuestion.question}</h3>
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

export default KnowledgeQuizScreen; 