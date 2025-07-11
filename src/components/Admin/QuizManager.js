import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { showSuccess, showError, showInfo } from '../../utils/toast';
import { getAuthHeaders } from '../../utils/auth';
import './QuizManager.css';

/**
 * Component QuizManager - Quản lý CRUD câu hỏi Hỏi Ngu
 */
const QuizManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const itemsPerPage = 10;
  
  // Fetch danh sách câu hỏi từ API
  const fetchQuestions = async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3001/api/quiz', {
        params: {
          page: currentPage,
          limit: itemsPerPage
        },
        ...getAuthHeaders(),
        signal: signal // Pass the signal to axios
      });
      
      if (response.data.success) {
        const { questions, pagination } = response.data.data;
        setQuestions(questions);
        setTotalQuestions(pagination.total);
        setTotalPages(pagination.pages);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Lỗi khi tải câu hỏi:', error);
        setError('Không thể kết nối đến server');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Load câu hỏi khi component mount hoặc khi trang thay đổi
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
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setShowAddModal(true);
  };

  // Xử lý mở modal chỉnh sửa câu hỏi
  const handleOpenEditModal = (question) => {
    setCurrentQuestion(question);
    setFormData({
      question: question.question,
      options: question.options,
      correctAnswer: question.correct_answer,
      explanation: question.explanation || ''
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
      
      const response = await axios.post(
        'http://localhost:3001/api/quiz',
        {
          question: formData.question,
          options: formData.options,
          correctAnswer: formData.correctAnswer,
          explanation: formData.explanation
        },
        getAuthHeaders()
      );

      if (response.data.success) {
        showSuccess('Thêm câu hỏi thành công');
        setShowAddModal(false);
        fetchQuestions();
      } else {
        showError('Lỗi khi thêm câu hỏi: ' + response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi thêm câu hỏi:', error);
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
      
      const response = await axios.put(
        `http://localhost:3001/api/quiz/${currentQuestion.id}`,
        {
        question: formData.question,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation
        },
        getAuthHeaders()
      );

      if (response.data.success) {
        showSuccess('Cập nhật câu hỏi thành công');
        setShowEditModal(false);
        fetchQuestions();
        } else {
        showError('Lỗi khi cập nhật câu hỏi: ' + response.data.message);
        }
      } catch (error) {
      console.error('Lỗi khi cập nhật câu hỏi:', error);
      showError('Lỗi kết nối đến server');
      }
  };

  // Xử lý xóa câu hỏi
  const handleDeleteQuestion = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/api/quiz/${currentQuestion.id}`,
        getAuthHeaders()
      );
      
      if (response.data.success) {
        showSuccess('Xóa câu hỏi thành công');
        setShowDeleteModal(false);
        fetchQuestions();
      } else {
        showError('Lỗi khi xóa câu hỏi: ' + response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);
      showError('Lỗi kết nối đến server');
    }
  };

  return (
    <div className="quiz-manager">
      <div className="quiz-header">
        <div className="quiz-title">
          <h2>📝 Quản lý câu hỏi "Hỏi Ngu"</h2>
          <p>Tổng số câu hỏi: {totalQuestions}</p>
        </div>
        <div className="quiz-actions">
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
              questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <div className="question-header">
                    <span className="question-number">Câu hỏi #{question.id}</span>
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
                <h4>{question.question}</h4>
                <div className="options-grid">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`option-item ${
                            optIndex === question.correct_answer ? "correct" : ""
                      }`}
                    >
                      <span className="option-letter">
                            {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="option-text">{option}</span>
                          {optIndex === question.correct_answer && (
                        <span className="correct-badge">✓</span>
                      )}
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
          <Button
            variant="secondary"
                onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
                ← Trang trước
          </Button>
          <span className="page-info">
                Trang {currentPage}/{totalPages}
          </span>
          <Button
            variant="secondary"
                onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
                Trang sau →
          </Button>
        </div>
      )}
        </>
      )}

      {/* Modal thêm câu hỏi */}
      <Modal
        isOpen={showAddModal}
        title="➕ Thêm câu hỏi mới"
        onClose={() => setShowAddModal(false)}
        onConfirm={handleAddQuestion}
        confirmText="Thêm câu hỏi"
      >
              <div className="form-group">
          <label>Câu hỏi:</label>
                <textarea
            name="question"
                  value={formData.question}
            onChange={handleFormChange}
            placeholder="Nhập câu hỏi..."
            rows="2"
                />
              </div>
                {formData.options.map((option, index) => (
          <div className="form-group" key={index}>
            <label>
              Phương án {String.fromCharCode(65 + index)}
              {index === formData.correctAnswer && " (Đáp án đúng)"}:
            </label>
            <div className="option-input">
                    <input
                      type="text"
                name={`option${index}`}
                      value={option}
                onChange={handleFormChange}
                placeholder={`Nhập phương án ${String.fromCharCode(65 + index)}...`}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                value={index}
                      checked={formData.correctAnswer === index}
                onChange={handleFormChange}
                    />
            </div>
                  </div>
                ))}
              <div className="form-group">
          <label>Giải thích (tùy chọn):</label>
                <textarea
            name="explanation"
                  value={formData.explanation}
            onChange={handleFormChange}
            placeholder="Nhập giải thích..."
                  rows="2"
                />
              </div>
      </Modal>

      {/* Modal sửa câu hỏi */}
      <Modal
        isOpen={showEditModal}
        title="✏️ Sửa câu hỏi"
        onClose={() => setShowEditModal(false)}
        onConfirm={handleUpdateQuestion}
        confirmText="Cập nhật"
      >
        <div className="form-group">
          <label>Câu hỏi:</label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleFormChange}
            placeholder="Nhập câu hỏi..."
            rows="2"
          />
        </div>
        {formData.options.map((option, index) => (
          <div className="form-group" key={index}>
            <label>
              Phương án {String.fromCharCode(65 + index)}
              {index === formData.correctAnswer && " (Đáp án đúng)"}:
            </label>
            <div className="option-input">
              <input
                type="text"
                name={`option${index}`}
                value={option}
                onChange={handleFormChange}
                placeholder={`Nhập phương án ${String.fromCharCode(65 + index)}...`}
              />
              <input
                type="radio"
                name="correctAnswer"
                value={index}
                checked={formData.correctAnswer === index}
                onChange={handleFormChange}
              />
            </div>
          </div>
        ))}
        <div className="form-group">
          <label>Giải thích (tùy chọn):</label>
          <textarea
            name="explanation"
            value={formData.explanation}
            onChange={handleFormChange}
            placeholder="Nhập giải thích..."
            rows="2"
          />
        </div>
      </Modal>

      {/* Modal xóa câu hỏi */}
      <Modal
        isOpen={showDeleteModal}
        title="🗑️ Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa câu hỏi "${currentQuestion?.question}"?`}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteQuestion}
        confirmText="Xóa"
      />
    </div>
  );
};

export default QuizManager; 