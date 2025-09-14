import { useState, useEffect, useRef, useCallback } from 'react';
import Timer from '../common/Timer';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { GAME_CONFIG } from '../../utils/constants';
import { quizGameAPI } from '../../services/quizGameApi';
import { showError, showSuccess } from '../../utils/toast';
import './QuizScreen.css';

const QuizGameScreen = ({ quizType, onBackHome }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});

  const timerRef = useRef();
  const gameConfig = GAME_CONFIG[quizType.toUpperCase()] || GAME_CONFIG.DEFAULT;
  const maxQuestions = gameConfig.MAX_QUESTIONS || 10;

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await quizGameAPI.getGameSessionQuestions(quizType, { limit: maxQuestions });
      if (response.success && response.data.questions.length > 0) {
        const processedQuestions = response.data.questions.map(q => {
          const correctAnswerValue = q.options[q.correct_answer];
          const shuffledOptions = shuffleArray(q.options);
          const newCorrectIndex = shuffledOptions.indexOf(correctAnswerValue);
          return { ...q, options: shuffledOptions, correct_answer_index: newCorrectIndex };
        });
        setQuestions(processedQuestions);
        showSuccess(`Đã tải ${processedQuestions.length} câu hỏi! Bắt đầu chơi!`);
      } else {
        showError(response.message || 'Không có câu hỏi nào trong hệ thống.');
        setQuestions([]);
      }
    } catch (error) {
      showError('Lỗi kết nối khi tải câu hỏi.');
    } finally {
      setIsLoading(false);
    }
  }, [quizType, maxQuestions]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedAnswer(answerIndex);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correct_answer_index;

    if (isCorrect) {
      const timeRemaining = timerRef.current?.getTimeRemaining() || 0;
      const timeBonus = Math.floor((timeRemaining / gameConfig.TIME_PER_QUESTION) * 50);
      setScore(prev => prev + 100 + timeBonus);
      setCorrectAnswers(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        endGame();
      }
    }, 2000);
  };

  const handleTimeUp = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    showError(`Hết giờ! Đáp án đúng là: ${questions[currentQuestionIndex].options[questions[currentQuestionIndex].correct_answer_index]}`);
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        endGame();
      }
    }, 2000);
  };

  const endGame = async () => {
    setIsGameOver(true);
    const gameStats = {
      correctAnswers,
      totalQuestions: questions.length,
      totalScore: score
    };

    const result = await quizGameAPI.submitResult(quizType, gameStats);

    setModalContent({
      title: 'Kết thúc trò chơi!',
      message: `Kết quả:\n✅ Câu đúng: ${correctAnswers}/${questions.length}\n💯 Điểm số: ${score}\n\n${result.data?.performanceMessage || ''}`,
      isGameOver: true,
    });
    setShowModal(true);
  };

  const handlePlayAgain = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setCorrectAnswers(0);
    setIsGameOver(false);
    setShowModal(false);
    loadQuestions();
  };

  if (isLoading) {
    return <div className="loading-indicator">Đang tải câu hỏi cho phiên chơi...</div>;
  }

  if (questions.length === 0 && !isLoading) {
    return (
      <div className="error-message">
        <p>Không có câu hỏi nào. Vui lòng thử lại.</p>
        <Button onClick={onBackHome}>Về trang chủ</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <Button variant="secondary" onClick={onBackHome}>🏠 Trang chủ</Button>
        <div className="quiz-stats">
          <span className="quiz-score">Điểm: {score}</span>
          <span className="quiz-count">Câu hỏi: {currentQuestionIndex + 1}/{questions.length}</span>
        </div>
      </div>

      <div className="quiz-content">
        <Timer
          key={currentQuestionIndex} // Reset timer for each question
          ref={timerRef}
          duration={gameConfig.TIME_PER_QUESTION || 15}
          onTimeUp={handleTimeUp}
          isActive={!isAnswered && !isGameOver}
        />
        <div className="question-container">
          <h3 className="question-text">{currentQuestion.question}</h3>
        </div>
        <div className="options-container">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = index === currentQuestion.correct_answer_index;
            const isSelected = selectedAnswer === index;
            let buttonClass = 'option-button';
            if (isAnswered) {
              if (isCorrect) buttonClass += ' correct';
              else if (isSelected) buttonClass += ' incorrect';
            }
            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
              </button>
            );
          })}
        </div>
        {isAnswered && currentQuestion.explanation && (
          <div className="explanation">
            <h4>Giải thích:</h4>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={modalContent.title}
        message={modalContent.message}
        onClose={() => setShowModal(false)}
        confirmText="Chơi lại"
        onConfirm={handlePlayAgain}
        cancelText="Về trang chủ"
        onCancel={onBackHome}
      />
    </div>
  );
};

export default QuizGameScreen;