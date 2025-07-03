import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import {
  processQuestion,
  typeMessage,
  saveQuestionHistory,
  getQuestionHistory,
  clearQuestionHistory,
  getAnswerStatistics,
  getRandomSuggestedQuestion,
  formatTime,
  hasAPIKey
} from '../../utils/universeAnswerLogic';
import './UniverseAnswerScreen.css';

/**
 * Component UniverseAnswerScreen - Màn hình game "Câu trả lời từ vũ trụ"
 * @param {Object} props - Props của component
 * @param {Function} props.onBackHome - Callback khi quay về trang chủ
 */
const UniverseAnswerScreen = ({ onBackHome }) => {
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAI, setHasAI] = useState(false);
  
  const inputRef = useRef(null);
  const answerRef = useRef(null);
  const typeWriterRef = useRef(null);

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadHistory();
    loadStats();
    setHasAI(hasAPIKey());
    // Focus vào input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Cleanup typewriter khi component unmount
  useEffect(() => {
    return () => {
      if (typeWriterRef.current) {
        typeWriterRef.current();
      }
    };
  }, []);

  // Auto scroll đến câu trả lời
  useEffect(() => {
    if (currentAnswer && answerRef.current) {
      answerRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentAnswer]);

  /**
   * Load lịch sử câu hỏi
   */
  const loadHistory = () => {
    const questionHistory = getQuestionHistory();
    setHistory(questionHistory);
  };

  /**
   * Load thống kê
   */
  const loadStats = () => {
    const statistics = getAnswerStatistics();
    setStats(statistics);
  };

  /**
   * Xử lý submit câu hỏi với AI
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isProcessing) return;
    
    setErrorMessage('');
    setIsProcessing(true);
    setCurrentAnswer(null);
    setTypedMessage('');

    try {
      // Gọi AI để xử lý câu hỏi
      const result = await processQuestion(question);
      
      if (result.success) {
        setCurrentAnswer(result);
        
        // Cancel typewriter cũ nếu có
        if (typeWriterRef.current) {
          typeWriterRef.current();
        }
        
        // Hiệu ứng typing cho AI response
        typeWriterRef.current = typeMessage(result.answer.text, setTypedMessage, 30);
        
        // Lưu vào lịch sử
        saveQuestionHistory(result);
        loadHistory();
        loadStats();
        
        // Clear input
        setQuestion('');
      } else {
        setErrorMessage(result.error);
      }
      
    } catch (error) {
      console.error('Error processing question:', error);
      setErrorMessage('Có lỗi xảy ra khi xử lý câu hỏi. Vui lòng thử lại!');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Sử dụng câu hỏi gợi ý
   */
  const handleUseSuggestion = () => {
    const suggestion = getRandomSuggestedQuestion();
    setQuestion(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  /**
   * Xóa lịch sử
   */
  const handleClearHistory = () => {
    clearQuestionHistory();
    loadHistory();
    loadStats();
    setShowHistory(false);
  };

  /**
   * Đặt lại câu hỏi
   */
  const handleNewQuestion = () => {
    setCurrentAnswer(null);
    setTypedMessage('');
    setErrorMessage('');
    setQuestion('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };



  return (
    <div className="universe-answer-screen">
      <div className="universe-container">
        {/* Header */}
        <div className="universe-header">
          <Button
            variant="secondary"
            onClick={onBackHome}
            className="back-btn"
          >
            ← Về trang chủ
          </Button>
          
        </div>

        {/* Game Title */}
        <div className="universe-title">
          <h1>🌌 Câu trả lời từ Vũ trụ</h1>
          <p>Hỏi điều gì cũng được, vũ trụ sẽ trả lời!</p>
        </div>

        {/* Crystal Ball Animation */}
        <div className="crystal-ball-container">
          <div className={`crystal-ball ${isProcessing ? 'processing' : ''}`}>
            <div className="ball-glow"></div>
            <div className="ball-reflection"></div>
            <div className="mystical-particles">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`particle particle-${i + 1}`}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Question Form */}
        <div className="question-section">
          <form onSubmit={handleSubmit} className="question-form">
            <div className="form-group">
              <label htmlFor="question-input">
                💭 Đặt câu hỏi của bạn:
              </label>
              <div className="input-container">
                <textarea
                  ref={inputRef}
                  id="question-input"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ví dụ: Hôm nay tôi có may mắn không?"
                  rows="3"
                  maxLength="200"
                  disabled={isProcessing}
                  className="question-input"
                />
                <div className="char-count">
                  {question.length}/200
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={handleUseSuggestion}
                disabled={isProcessing}
                className="suggestion-btn"
              >
                💡 Gợi ý câu hỏi
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                disabled={!question.trim() || isProcessing}
                className="ask-btn"
              >
                {isProcessing ? '🔮 Đang hỏi vũ trụ...' : '🚀 Hỏi vũ trụ'}
              </Button>
            </div>
          </form>

          {/* Error Message */}
          {errorMessage && (
            <div className="error-message">
              ⚠️ {errorMessage}
            </div>
          )}
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="processing-section">
            <div className="processing-text">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Vũ trụ đang suy nghĩ...</p>
            </div>
          </div>
        )}

        {/* Answer Section */}
        {currentAnswer && (
          <div ref={answerRef} className="answer-section">
            <div className={`answer-card ${currentAnswer.answer.type}`}>
              <div className="answer-header">
                <div className="answer-emoji">
                  {currentAnswer.answer.emoji}
                </div>
                <div className="answer-type">
                  {currentAnswer.answer.type === 'yes' ? 'CÓ!' : 
                   currentAnswer.answer.type === 'no' ? 'KHÔNG!' : 'CÓ THỂ...'}
                </div>
              </div>
              
              <div className="answer-content">
                <div className="user-question">
                  <strong>Bạn hỏi:</strong> "{currentAnswer.question}"
                </div>
                
                <div className="universe-answer">
                  <strong>Vũ trụ trả lời:</strong>
                  <div className="answer-message">
                    {typedMessage}
                    {typedMessage.length < currentAnswer.answer.text.length && (
                      <span className="typing-cursor">|</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="answer-actions">
                <Button
                  variant="primary"
                  onClick={handleNewQuestion}
                  className="new-question-btn"
                >
                  🔄 Câu hỏi mới
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!currentAnswer && !isProcessing && (
          <div className="instructions">
            <h3>🌟 Cách chơi:</h3>
            <ul>
              <li>💭 Nghĩ ra một câu hỏi bất kỳ</li>
              <li>⌨️ Gõ câu hỏi vào khung bên trên</li>
              <li>🚀 Nhấn "Hỏi vũ trụ" và chờ câu trả lời</li>
              <li>🎭 Vũ trụ sẽ trả lời theo cách hài hước và bất ngờ</li>
              <li>📚 Xem lại lịch sử và thống kê câu trả lời</li>
            </ul>
          </div>
        )}
      </div>

      {/* History Modal */}
      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title="📚 Lịch sử câu hỏi"
        className="history-modal"
      >
        <div className="history-content">
          {history.length > 0 ? (
            <>
              <div className="history-actions">
                <Button
                  variant="danger"
                  onClick={handleClearHistory}
                  className="clear-history-btn"
                >
                  🗑️ Xóa lịch sử
                </Button>
              </div>
              
              <div className="history-list">
                {history.map((entry) => (
                  <div key={entry.id} className={`history-item ${entry.answer.type}`}>
                    <div className="history-question">
                      <strong>❓ {entry.question}</strong>
                    </div>
                    <div className="history-answer">
                      {entry.answer.emoji} {entry.answer.text}
                    </div>
                    <div className="history-time">
                      🕐 {formatTime(entry.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-history">
              <p>📭 Chưa có câu hỏi nào. Hãy bắt đầu hỏi vũ trụ!</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Stats Modal */}
      <Modal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        title="📊 Thống kê câu trả lời"
        className="stats-modal"
      >
        <div className="stats-content">
          {stats && stats.total > 0 ? (
            <>
              <div className="stats-summary">
                <div className="stat-item">
                  <div className="stat-number">{stats.total}</div>
                  <div className="stat-label">Tổng câu hỏi</div>
                </div>
              </div>
              
              <div className="stats-breakdown">
                <div className="stat-bar yes">
                  <div className="stat-info">
                    <span>✅ CÓ</span>
                    <span>{Math.round((stats.yes / stats.total) * 100)}%</span>
                  </div>
                  <div className="stat-progress">
                    <div 
                      className="stat-fill" 
                      style={{ width: `${Math.round((stats.yes / stats.total) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="stat-count">{stats.yes} câu</div>
                </div>
                
                <div className="stat-bar no">
                  <div className="stat-info">
                    <span>❌ KHÔNG</span>
                    <span>{Math.round((stats.no / stats.total) * 100)}%</span>
                  </div>
                  <div className="stat-progress">
                    <div 
                      className="stat-fill" 
                      style={{ width: `${Math.round((stats.no / stats.total) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="stat-count">{stats.no} câu</div>
                </div>
                
                <div className="stat-bar maybe">
                  <div className="stat-info">
                    <span>🤷‍♂️ CÓ THỂ</span>
                    <span>{Math.round((stats.maybe / stats.total) * 100)}%</span>
                  </div>
                  <div className="stat-progress">
                    <div 
                      className="stat-fill" 
                      style={{ width: `${Math.round((stats.maybe / stats.total) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="stat-count">{stats.maybe} câu</div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-stats">
              <p>📈 Chưa có dữ liệu thống kê. Hãy hỏi vài câu trước!</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UniverseAnswerScreen; 