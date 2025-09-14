import React, { useState, useEffect, useRef, useCallback } from 'react';
import Timer from '../common/Timer';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { GAME_CONFIG } from '../../utils/constants';
import { quizGameAPI } from '../../services/quizGameApi';
import { showError } from '../../utils/toast';
import './QuizScreen.css';

const QuizGameScreen = ({ quizType, gameTitle, onBackHome }) => {
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
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);

  const timerKey = useRef(0);
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

  const endGame = useCallback(async () => {
    setIsGameOver(true);
    const gameStats = { correctAnswers, totalQuestions: maxQuestions, totalScore };
    let performanceMessage = '';

    if (quizType === 'behavior') {
      const result = await quizGameAPI.submitResult(quizType, gameStats);
      if (result.success) performanceMessage = result.data.performanceMessage;
    }

    if (!performanceMessage) {
      const accuracy = (correctAnswers / maxQuestions) * 100;
      if (accuracy >= 80) performanceMessage = 'Xuất sắc! Bạn là một chuyên gia!';
      else if (accuracy >= 60) performanceMessage = 'Tốt lắm! Tiếp tục rèn luyện nhé!';
      else if (accuracy >= 40) performanceMessage = 'Khá tốt! Hãy học thêm nhé!';
      else performanceMessage = 'Cố gắng lên! Bạn có thể học hỏi thêm!';
    }

    setModalContent({
      title: 'Kết thúc trò chơi!',
      message: `Kết quả:\n✅ Câu đúng: ${correctAnswers}/${maxQuestions}\n💯 Điểm số: ${totalScore}\n\n${performanceMessage}`,
      isGameOver: true,
    });
    setShowModal(true);
  }, [correctAnswers, maxQuestions, totalScore, quizType]);

  const loadNewQuestion = useCallback(async () => {
    setIsLoading(true);
    if (questionNumber > maxQuestions) {
      endGame();
      return;
    }

    const response = await quizGameAPI.getRandomQuestion(quizType, usedQuestionIds);
    console.log('API Response in QuizGameScreen:', response); // Log the full response

    if (!response.success || !response.data?.question) {
      showError('Không thể tải câu hỏi mới. Vui lòng thử lại sau.');
      console.error('Failed to load new question due to invalid data structure. Response:', response);
      setIsLoading(false);
      return;
    }

    const { question, index } = response.data;

    // The API is returning options as a JSON string, so we need to parse it.
    if (typeof question.options === 'string') {
      try {
        question.options = JSON.parse(question.options);
      } catch (e) {
        showError('Dữ liệu tùy chọn câu hỏi không hợp lệ.');
        console.error('Failed to parse question options:', e);
        setIsLoading(false);
        return;
      }
    }
    if (!question || !Array.isArray(question.options)) {
      showError('Dữ liệu câu hỏi không hợp lệ.');
      setIsLoading(false);
      return;
    }

    setUsedQuestionIds(prev => [...prev, index]);
    setCurrentQuestion(question);

    const correctValue = question.options[question.correctAnswer];
    const shuffledOptions = shuffleArray([...question.options]);
    const newCorrectIndex = shuffledOptions.indexOf(correctValue);

    setCurrentOptions(shuffledOptions);
    setCurrentCorrectIndex(newCorrectIndex);

    setSelectedAnswer(-1);
    setIsAnswered(false);
    setGameStarted(true);
    timerKey.current += 1;
    setIsLoading(false);
  }, [questionNumber, maxQuestions, quizType, usedQuestionIds, endGame]);

  useEffect(() => {
    let isMounted = true;

    const fetchQuestion = async () => {
      // Only fetch if the component is mounted
      if (isMounted) {
        await loadNewQuestion();
      }
    };

    fetchQuestion();

    // Cleanup function to run when the component unmounts or before the effect re-runs
    return () => {
      isMounted = false;
    };
  }, [loadNewQuestion]);

  const handleAnswerSelect = useCallback(async (answerIndex) => {
    if (isAnswered || isGameOver) return;

    setIsAnswered(true);
    setSelectedAnswer(answerIndex);

    const isCorrect = answerIndex === currentCorrectIndex;
    let score = 0;

    if (isCorrect) {
      const timeRemaining = 10; // Placeholder, you might need to get this from the Timer component
      const maxTime = gameConfig.TIME_PER_QUESTION || 15;
      const basePoints = 100;
      const timeBonus = Math.floor((timeRemaining / maxTime) * 50);
      score = basePoints + timeBonus;
      setCorrectAnswers(prev => prev + 1);
      setTotalScore(prev => prev + score);
    } else {
      showError(`Đáp án đúng là: "${currentOptions[currentCorrectIndex]}"`);
    }

    setTimeout(() => {
      if (questionNumber >= maxQuestions) {
        endGame();
      } else {
        setQuestionNumber(prev => prev + 1);
        loadNewQuestion();
      }
    }, 2000);
  }, [isAnswered, isGameOver, currentCorrectIndex, currentOptions, gameConfig, questionNumber, maxQuestions, endGame, loadNewQuestion]);

  const handleTimeUp = useCallback(() => {
    if (isAnswered || isGameOver) return;
    setIsAnswered(true);
    showError(`Hết giờ! Đáp án đúng là: "${currentOptions[currentCorrectIndex]}"`);

    setTimeout(() => {
      if (questionNumber >= maxQuestions) {
        endGame();
      } else {
        setQuestionNumber(prev => prev + 1);
        loadNewQuestion();
      }
    }, 2000);
  }, [isAnswered, isGameOver, currentCorrectIndex, currentOptions, questionNumber, maxQuestions, endGame, loadNewQuestion]);

  const handlePlayAgain = () => {
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
    loadNewQuestion();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (isGameOver) {
      onBackHome();
    }
  };

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <Button variant="secondary" onClick={onBackHome}>🏠 Trang chủ</Button>
        <div className="quiz-stats">
          <span className="quiz-score">Điểm: {totalScore}</span>
          <span className="quiz-count">Câu hỏi: {questionNumber}/{maxQuestions}</span>
        </div>
      </div>

      <div className="quiz-content">
        {isLoading ? (
          <div className="loading-indicator">Đang tải câu hỏi...</div>
        ) : currentQuestion ? (
          <>
            {gameStarted && !isAnswered && !isGameOver && (
              <Timer
                key={timerKey.current}
                duration={gameConfig.TIME_PER_QUESTION || 15}
                onTimeUp={handleTimeUp}
                isActive={!isAnswered && !isGameOver}
              />
            )}
            <div className="question-container">
              <h3 className="question-text">{currentQuestion.question}</h3>
            </div>
            <div className="options-container">
              {currentOptions.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${selectedAnswer === index ? 'selected' : ''} ${
                    isAnswered ? (index === currentCorrectIndex ? 'correct' : (selectedAnswer === index ? 'incorrect' : '')) : ''
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered || isGameOver}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>
            {isAnswered && currentQuestion.explanation && (
              <div className="explanation">
                <h4>Giải thích:</h4>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </>
        ) : (
          <div className="error-message">Không thể tải câu hỏi. Vui lòng thử lại.</div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={modalContent.title || ''}
        message={modalContent.message || ''}
        onClose={handleCloseModal}
        confirmText={modalContent.isGameOver ? "Chơi lại" : ''}
        onConfirm={modalContent.isGameOver ? handlePlayAgain : undefined}
        cancelText={modalContent.isGameOver ? "Về trang chủ" : "Đóng"}
        onCancel={modalContent.isGameOver ? onBackHome : handleCloseModal}
      />
    </div>
  );
};

export default QuizGameScreen;

