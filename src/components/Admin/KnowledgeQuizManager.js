import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { showSuccess, showError } from '../../utils/toast';
import './QuizManager.css';
import { knowledgeAPI } from '../../services/api';
import AIQuestionGenerator from './AIQuestionGenerator';

/**
 * Component KnowledgeQuizManager - Quản lý CRUD câu hỏi Vua Kiến Thức
 */
const KnowledgeQuizManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State cho modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: '',
    difficulty: 'medium'
  });

  // Lấy danh sách câu hỏi từ API
  const fetchQuestions = async (signal) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await knowledgeAPI.getQuestions(currentPage, 5);
      
      if (response.success) {
        setQuestions(response.data.questions);
        setTotalPages(response.data.pagination.pages);
        setTotalQuestions(response.data.pagination.total);
      } else {
        setError(response.message || 'Không thể tải danh sách câu hỏi kiến thức');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách câu hỏi kiến thức:', error);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  // Load câu hỏi khi component mount và khi page thay đổi
  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      fetchQuestions(controller.signal);
    };
    
    loadData();
    
    // Cleanup function để hủy request khi component unmount
    return () => {
      controller.abort();
    };
  }, [currentPage]); // Chỉ gọi lại khi currentPage thay đổi

  // Reload khi có sự kiện cập nhật từ bên ngoài
  useEffect(() => {
    const handleQuestionsUpdated = () => {
      console.log('🧠 Nhận sự kiện câu hỏi kiến thức được cập nhật, reload dữ liệu...');
      fetchQuestions();
    };

    window.addEventListener('knowledgeQuestionsUpdated', handleQuestionsUpdated);

    return () => {
      window.removeEventListener('knowledgeQuestionsUpdated', handleQuestionsUpdated);
    };
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      category: '',
      difficulty: 'medium'
    });
    setCurrentQuestion(null);
  };

  // Xử lý thay đổi form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'option0' || name === 'option1' || name === 'option2' || name === 'option3') {
      const index = parseInt(name.replace('option', ''));
      const newOptions = [...formData.options];
      newOptions[index] = value;
      
      setFormData({
        ...formData,
        options: newOptions
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'correctAnswer' ? parseInt(value) : value
      });
    }
  };

  // Xử lý mở modal thêm câu hỏi
  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Xử lý mở modal chỉnh sửa câu hỏi
  const handleOpenEditModal = (question) => {
    setCurrentQuestion(question);
    setFormData({
      question: question.question,
      options: question.options,
      correctAnswer: question.correct_answer,
      explanation: question.explanation || '',
      category: question.category || '',
      difficulty: question.difficulty || 'medium'
    });
    setShowEditModal(true);
  };

  // Xử lý mở modal xóa câu hỏi
  const handleOpenDeleteModal = (question) => {
    setCurrentQuestion(question);
    setShowDeleteModal(true);
  };

  // Xử lý thêm câu hỏi mới
  const handleAddQuestion = async () => {
    try {
      if (!formData.question || formData.options.some(opt => !opt)) {
        showError('Vui lòng nhập đầy đủ câu hỏi và các phương án trả lời');
        return;
      }
      
      const questionData = {
        question: formData.question,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        category: formData.category,
        difficulty: formData.difficulty
      };

      const response = await knowledgeAPI.addQuestion(questionData);

      if (response.success) {
        showSuccess(response.message || 'Thêm câu hỏi kiến thức thành công');
        setShowAddModal(false);
        fetchQuestions();
      } else {
        showError(response.message || 'Lỗi khi thêm câu hỏi');
      }
    } catch (error) {
      console.error('Lỗi khi thêm câu hỏi kiến thức:', error);
      showError('Lỗi kết nối đến server');
    }
  };

  // Xử lý cập nhật câu hỏi
  const handleUpdateQuestion = async () => {
    try {
      if (!formData.question || formData.options.some(opt => !opt)) {
        showError('Vui lòng nhập đầy đủ câu hỏi và các phương án trả lời');
        return;
      }

      const questionData = {
        question: formData.question,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        category: formData.category,
        difficulty: formData.difficulty
      };

      const response = await knowledgeAPI.updateQuestion(currentQuestion.id, questionData);

      if (response.success) {
        showSuccess(response.message || 'Cập nhật câu hỏi kiến thức thành công');
        setShowEditModal(false);
        fetchQuestions();
      } else {
        showError(response.message || 'Lỗi khi cập nhật câu hỏi');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật câu hỏi:', error);
      showError('Lỗi kết nối đến server');
    }
  };

  // Xử lý xóa câu hỏi
  const handleDeleteQuestion = async () => {
    try {
      const response = await knowledgeAPI.deleteQuestion(currentQuestion.id);

      if (response.success) {
        showSuccess(response.message || 'Xóa câu hỏi kiến thức thành công');
        setShowDeleteModal(false);
        fetchQuestions();
      } else {
        showError(response.message || 'Lỗi khi xóa câu hỏi');
      }
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);
      showError('Lỗi kết nối đến server');
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    setCurrentPage(1); // Reset về trang 1
    fetchQuestions();
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Nhãn độ khó
  const difficultyLabels = {
    easy: '🟢 Dễ',
    medium: '🟡 Trung bình',
    hard: '🔴 Khó'
  };

  return (
    <div className="quiz-manager">
      <div className="quiz-header">
        <div className="quiz-title">
          <h2>🧠 Quản lý câu hỏi "Vua Kiến Thức"</h2>
          <p>Tổng số câu hỏi: {totalQuestions}</p>
        </div>

        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Tìm kiếm câu hỏi..."
          />
          <Button onClick={handleSearch}>🔍 Tìm kiếm</Button>
        </div>
        
        <div className="quiz-actions">
          <Button onClick={() => setShowAIModal(true)} className="ai-btn">
            🤖 Tạo bằng AI
          </Button>
          <Button onClick={handleOpenAddModal} className="add-btn">
            ➕ Thêm câu hỏi
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="questions-list">
            {questions.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có câu hỏi nào. Hãy thêm câu hỏi mới!</p>
              </div>
            ) : (
              questions.map((question) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <div className="question-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleOpenEditModal(question)}
                        title="Sửa câu hỏi"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleOpenDeleteModal(question)}
                        title="Xóa câu hỏi"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="question-content">
                    <h3>{question.question}</h3>
                    <div className="options-list">
                      {question.options.map((option, index) => (
                        <div
                          key={index}
                          className={`option ${index === question.correct_answer ? 'correct' : ''}`}
                        >
                          {String.fromCharCode(65 + index)}. {option}
                          {index === question.correct_answer && <span className="correct-badge">✓</span>}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="explanation">
                        <strong>Giải thích:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &laquo; Trước
              </button>
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau &raquo;
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal thêm câu hỏi */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm câu hỏi mới"
      >
        <div className="question-form">
          <div className="form-group">
            <label htmlFor="question">Câu hỏi:</label>
            <textarea
              id="question"
              name="question"
              value={formData.question}
              onChange={handleFormChange}
              placeholder="Nhập câu hỏi..."
            />
          </div>

          <div className="form-group options-group">
            <label>Các phương án trả lời:</label>
            {formData.options.map((option, index) => (
              <div key={index} className="option-input">
                <span className="option-label">
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  type="text"
                  name={`option${index}`}
                  value={option}
                  onChange={handleFormChange}
                  placeholder={`Phương án ${String.fromCharCode(65 + index)}...`}
                />
                <input
                  type="radio"
                  name="correctAnswer"
                  value={index}
                  checked={formData.correctAnswer === index}
                  onChange={handleFormChange}
                  title="Chọn đáp án đúng"
                />
              </div>
            ))}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Danh mục:</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                placeholder="Danh mục câu hỏi (tùy chọn)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="difficulty">Độ khó:</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleFormChange}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="explanation">Giải thích (không bắt buộc):</label>
            <textarea
              id="explanation"
              name="explanation"
              value={formData.explanation}
              onChange={handleFormChange}
              placeholder="Giải thích đáp án..."
            />
          </div>

          <div className="form-actions">
            <Button onClick={() => setShowAddModal(false)} variant="secondary">
              Hủy bỏ
            </Button>
            <Button onClick={handleAddQuestion}>Lưu câu hỏi</Button>
          </div>
        </div>
      </Modal>

      {/* Modal chỉnh sửa câu hỏi */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Chỉnh sửa câu hỏi"
      >
        <div className="question-form">
          <div className="form-group">
            <label htmlFor="edit-question">Câu hỏi:</label>
            <textarea
              id="edit-question"
              name="question"
              value={formData.question}
              onChange={handleFormChange}
              placeholder="Nhập câu hỏi..."
            />
          </div>

          <div className="form-group options-group">
            <label>Các phương án trả lời:</label>
            {formData.options.map((option, index) => (
              <div key={index} className="option-input">
                <span className="option-label">
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  type="text"
                  name={`option${index}`}
                  value={option}
                  onChange={handleFormChange}
                  placeholder={`Phương án ${String.fromCharCode(65 + index)}...`}
                />
                <input
                  type="radio"
                  name="correctAnswer"
                  value={index}
                  checked={formData.correctAnswer === index}
                  onChange={handleFormChange}
                  title="Chọn đáp án đúng"
                />
              </div>
            ))}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-category">Danh mục:</label>
              <input
                type="text"
                id="edit-category"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                placeholder="Danh mục câu hỏi (tùy chọn)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-difficulty">Độ khó:</label>
              <select
                id="edit-difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleFormChange}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-explanation">Giải thích (không bắt buộc):</label>
            <textarea
              id="edit-explanation"
              name="explanation"
              value={formData.explanation}
              onChange={handleFormChange}
              placeholder="Giải thích đáp án..."
            />
          </div>

          <div className="form-actions">
            <Button onClick={() => setShowEditModal(false)} variant="secondary">
              Hủy bỏ
            </Button>
            <Button onClick={handleUpdateQuestion}>Lưu thay đổi</Button>
          </div>
        </div>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xác nhận xóa"
        size="small"
      >
        <div className="confirm-delete">
          <p>Bạn có chắc chắn muốn xóa câu hỏi này không?</p>
          <div className="form-actions">
            <Button onClick={() => setShowDeleteModal(false)} variant="secondary">
              Hủy bỏ
            </Button>
            <Button onClick={handleDeleteQuestion} variant="danger">
              Xóa câu hỏi
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal tạo câu hỏi bằng AI */}
      <Modal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        title="Tạo câu hỏi Vua Kiến Thức bằng AI"
      >
        <AIQuestionGenerator
          api={knowledgeAPI}
          onQuestionsGenerated={() => {
            setShowAIModal(false);
            fetchQuestions();
          }}
          questionType="knowledge"
        />
      </Modal>
    </div>
  );
};

export default KnowledgeQuizManager; 