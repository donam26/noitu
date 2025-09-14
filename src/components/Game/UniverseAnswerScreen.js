import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import { gameDataAPI } from '../../services/api';
import './UniverseAnswerScreen.css';

/**
 * Component UniverseAnswerScreen - Màn hình game "Câu trả lời từ vũ trụ"
 * @param {Object} props - Props của component
 * @param {Function} props.onBackHome - Callback khi quay về trang chủ
 */
const UniverseAnswerScreen = ({ onBackHome }) => {
  // States
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAI, setHasAI] = useState(true);
  // State để giữ cho layout ổn định
  const [showAnswerSection, setShowAnswerSection] = useState(false);
  
  // Refs
  const inputRef = useRef(null);
  const answerRef = useRef(null);
  const typeWriterRef = useRef(null);
  const typingSpeed = 30; // ms per character

  // Khởi tạo ban đầu
  useEffect(() => {
    checkAIStatus();
    
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
      setTimeout(() => {
        answerRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [currentAnswer]);

  /**
   * Kiểm tra trạng thái AI
   */
  const checkAIStatus = async () => {
    try {
      const response = await gameDataAPI.checkAIStatus();
      setHasAI(response.success && response.data && response.data.available);
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái AI:', error);
      setHasAI(false);
    }
  };

  /**
   * Xử lý submit câu hỏi với AI
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isProcessing || !question.trim()) return;
    
    setErrorMessage('');
    setIsProcessing(true);
    setTypedMessage('');

    // Hiển thị answer section ngay từ đầu để tránh hiệu ứng dãn
    setShowAnswerSection(true);
    
    try {
      console.log("Đang gửi câu hỏi:", question);
      
      // Gọi API để xử lý câu hỏi
      const response = await gameDataAPI.processUniverseQuestion(question);
      
      console.log("Kết quả từ API:", response);
      
      if (response && response.success && response.data) {
        const result = response.data;
        
        // Xử lý response để lấy câu trả lời
        // Kiểm tra nhiều trường hợp cấu trúc data khác nhau
        let answerText = "";
        if (result.answer) {
          answerText = result.answer;
        } else if (result.data && result.data.answer) {
          answerText = result.data.answer;
        } else if (typeof result === 'string') {
          answerText = result;
        } else {
          // Nếu không tìm thấy câu trả lời trong kết quả, tạo câu trả lời mặc định
          answerText = "Vũ trụ đang tạm thời lặng im. Hãy thử lại câu hỏi khác.";
        }
        
        // Lưu câu hỏi và câu trả lời trước để thiết lập layout
        setCurrentAnswer({
          question,
          answer: answerText,
          timestamp: result.timestamp || new Date().toISOString()
        });
        
        // Hiển thị trả lời theo hiệu ứng đánh máy sau một chút delay để đảm bảo layout đã ổn định
        setTimeout(() => {
          typeWriter(answerText);
        }, 50);
        
      } else {
        setErrorMessage(response?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Lỗi khi xử lý câu hỏi:', error);
      setErrorMessage('Đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại sau.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Hiệu ứng đánh máy cho câu trả lời
   * @param {string} message - Nội dung cần hiển thị
   */
  const typeWriter = (message) => {
    if (!message) {
      message = "Vũ trụ đang tạm thời lặng im. Hãy thử lại sau.";
    }

    // Kiểm tra và đảm bảo câu trả lời hoàn chỉnh
    if (message && message.trim() !== "") {
      // Đảm bảo chữ cái đầu viết hoa
      message = message.trim();
      if (message.length > 0 && message[0] === message[0].toLowerCase()) {
        message = message[0].toUpperCase() + message.substring(1);
      }
    }

    // Xóa typeWriter cũ nếu có
    if (typeWriterRef.current) {
      typeWriterRef.current();
    }

    const txt = message;
    let isTyping = true;

    // Reset typedMessage và bắt đầu hiệu ứng
    setTypedMessage('');

    const type = (currentIndex) => {
      if (currentIndex < txt.length && isTyping) {
        setTypedMessage(txt.substring(0, currentIndex + 1));
        setTimeout(() => type(currentIndex + 1), typingSpeed);
      }
    };

    // Bắt đầu hiệu ứng đánh chữ với delay nhỏ để đảm bảo state được reset
    setTimeout(() => {
      if (isTyping) {
        type(0);
      }
    }, 10);

    // Lưu hàm stop để cleanup
    typeWriterRef.current = () => {
      isTyping = false;
    };
  };

  /**
   * Sử dụng câu hỏi gợi ý
   */
  const handleUseSuggestion = async () => {
    if (isProcessing) return;
    
    try {
      const response = await gameDataAPI.getRandomSuggestedQuestion();
      if (response.success && response.data && response.data.question) {
        setQuestion(response.data.question);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy câu hỏi gợi ý:', error);
    }
  };

  /**
   * Reset để đặt câu hỏi mới
   */
  const handleNewQuestion = () => {
    setQuestion('');
    setCurrentAnswer(null);
    setTypedMessage('');
    setErrorMessage('');
    // Ẩn answer section khi đặt câu hỏi mới
    setShowAnswerSection(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="universe-answer-screen">
      {/* Hiệu ứng thiên hà */}
      <div className="galaxy-overlay"></div>
      <div className="stars"></div>
      
      <div className="universe-answer-container">
        {/* Header */}
        <div className="universe-header">
          <Button 
            variant="secondary" 
            onClick={onBackHome}
          >
            🏠 Trang chủ
          </Button>
        </div>
        
        {/* Main Content */}
        <div className="main-content">
          {/* Game Title */}
          <div className="game-title">
            <h1>🌌 Câu trả lời từ vũ trụ</h1>
            <p>Đặt bất kỳ câu hỏi nào để nhận câu trả lời từ vũ trụ</p>
          </div>
          
          {/* Galaxy Animation */}
          <div className="galaxy-animation"></div>
          
          {/* Question Form */}
          <form onSubmit={handleSubmit} className="question-form">
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={isProcessing || !hasAI}
              />
              <div className="button-group">
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!question.trim() || isProcessing || !hasAI}
                >
                  {isProcessing ? '⏳ Đang xử lý...' : '🔮 Gửi câu hỏi'}
                </Button>
                <Button 
                  type="button"
                  variant="secondary" 
                  onClick={handleUseSuggestion}
                  disabled={isProcessing || !hasAI}
                >
                  💭 Gợi ý
                </Button>
              </div>
            </div>
            {!hasAI && (
              <div className="ai-warning">
                ⚠️ API Key chưa được cấu hình. Vui lòng liên hệ quản trị viên.
              </div>
            )}
          </form>
          
          {/* Error Message */}
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
          
          {/* Answer Display - Sử dụng showAnswerSection để kiểm soát hiển thị */}
          {showAnswerSection && (
            <div className="answer-section" ref={answerRef}>
              <div className="question-display">
                <strong>Câu hỏi:</strong> {currentAnswer ? currentAnswer.question : question}
              </div>
              <div className="answer-display">
                <strong>Trả lời:</strong> 
                <div className="answer-text">
                  {typedMessage || (isProcessing ? 'Vũ trụ đang suy nghĩ...' : '')}
                  {isProcessing && <span className="cursor">|</span>}
                </div>
              </div>
              
              <div className="answer-actions">
                <Button 
                  variant="primary" 
                  onClick={handleNewQuestion}
                  disabled={isProcessing}
                >
                  🔄 Câu hỏi mới
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniverseAnswerScreen; 