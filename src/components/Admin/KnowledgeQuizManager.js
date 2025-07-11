import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { showSuccess, showError, showInfo } from '../../utils/toast';
import { getAuthHeaders } from '../../utils/auth';
import './QuizManager.css';

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

  // API headers với token
  const getHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
  };

  // Lấy danh sách câu hỏi từ API
  const fetchQuestions = async (signal) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:3001/api/knowledge?page=${currentPage}&limit=5`, {
        ...getAuthHeaders(),
        signal
      });
      
      if (response.data.success) {
        setQuestions(response.data.data.questions);
        setTotalPages(response.data.data.pagination.pages);
        setTotalQuestions(response.data.data.pagination.total);
      } else {
        setError('Không thể tải danh sách câu hỏi kiến thức');
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Lỗi khi tải danh sách câu hỏi kiến thức:', error);
        setError('Lỗi kết nối đến server');
      }
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
      
      const response = await axios.post(
        'http://localhost:3001/api/knowledge',
        {
          question: formData.question,
          options: formData.options,
          correctAnswer: formData.correctAnswer,
          explanation: formData.explanation,
          category: formData.category,
          difficulty: formData.difficulty
        },
        getHeaders()
      );

      if (response.data.success) {
        showSuccess('Thêm câu hỏi kiến thức thành công');
        setShowAddModal(false);
        fetchQuestions();
      } else {
        showError('Lỗi khi thêm câu hỏi: ' + response.data.message);
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
      
      const response = await axios.put(
        `http://localhost:3001/api/knowledge/${currentQuestion.id}`,
        {
          question: formData.question,
          options: formData.options,
          correctAnswer: formData.correctAnswer,
          explanation: formData.explanation,
          category: formData.category,
          difficulty: formData.difficulty
        },
        getHeaders()
      );

      if (response.data.success) {
        showSuccess('Cập nhật câu hỏi kiến thức thành công');
        setShowEditModal(false);
        fetchQuestions();
      } else {
        showError('Lỗi khi cập nhật câu hỏi: ' + response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật câu hỏi kiến thức:', error);
      showError('Lỗi kết nối đến server');
    }
  };

  // Xử lý xóa câu hỏi
  const handleDeleteQuestion = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/api/knowledge/${currentQuestion.id}`,
        getHeaders()
      );
      
      if (response.data.success) {
        showSuccess('Xóa câu hỏi kiến thức thành công');
        setShowDeleteModal(false);
        fetchQuestions();
      } else {
        showError('Lỗi khi xóa câu hỏi: ' + response.data.message);
      }
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi kiến thức:', error);
      showError('Lỗi kết nối đến server');
    }
  };

  // Lọc câu hỏi theo search
  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export dữ liệu
  const handleExport = () => {
    const dataStr = JSON.stringify(questions.map(({ id, ...q }) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation || '',
      category: q.category || '',
      difficulty: q.difficulty || 'medium'
    })), null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'knowledge_questions_export.json';
    link.click();
    
    showSuccess(`Đã export ${questions.length} câu hỏi kiến thức!`);
  };

  return (
    <div className="quiz-manager">
      <div className="quiz-header">
        <div className="quiz-title">
          <h2>🧠 Quản lý Câu hỏi Kiến Thức</h2>
          <p>Tổng số: {totalQuestions} câu hỏi về khoa học, thiên nhiên và văn hóa</p>
        </div>
        <div className="quiz-actions">
          <Button
            variant="secondary"
            onClick={handleExport}
            className="export-btn"
          >
            📥 Export JSON
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            className="add-btn"
          >
            ➕ Thêm câu hỏi
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm câu hỏi..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="questions-list">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <div className="question-number">
                      #{(currentPage - 1) * 5 + index + 1}
                    </div>
                    <div className="question-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleOpenEditModal(question)}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleOpenDeleteModal(question)}
                        title="Xóa"
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
                            optIndex === question.correct_answer ? 'correct' : ''
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
                        <strong>💡 Giải thích:</strong> {question.explanation}
                      </div>
                    )}
                    {question.category && (
                      <div className="category-tag">
                        <span className="tag">🏷️ {question.category}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>🔍 Không tìm thấy câu hỏi nào</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ← Trước
              </Button>
              
              <span className="page-info">
                Trang {currentPage} / {totalPages}
              </span>
              
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau →
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <Modal
        title="➕ Thêm câu hỏi kiến thức"
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddQuestion}
        submitText="Thêm câu hỏi"
        show={showAddModal}
      >
        <div className="form-group">
          <label>Câu hỏi kiến thức *</label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleFormChange}
            placeholder="Nhập câu hỏi về khoa học, thiên nhiên, văn hóa..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Các lựa chọn *</label>
          {formData.options.map((option, index) => (
            <div key={index} className="option-input">
              <div className="option-prefix">
                <input
                  type="radio"
                  name="correctAnswer"
                  value={index}
                  checked={formData.correctAnswer === index}
                  onChange={handleFormChange}
                />
                <span>{String.fromCharCode(65 + index)}</span>
              </div>
              <input
                type="text"
                name={`option${index}`}
                value={option}
                onChange={handleFormChange}
                placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
              />
            </div>
          ))}
          <p className="help-text">📌 Chọn radio button bên cạnh đáp án đúng</p>
        </div>

        <div className="form-group">
          <label>Danh mục (tùy chọn)</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleFormChange}
            placeholder="Ví dụ: Khoa học, Lịch sử, Địa lý, ..."
          />
        </div>

        <div className="form-group">
          <label>Độ khó</label>
          <select 
            name="difficulty"
            value={formData.difficulty}
            onChange={handleFormChange}
          >
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>

        <div className="form-group">
          <label>Giải thích (tuỳ chọn)</label>
          <textarea
            name="explanation"
            value={formData.explanation}
            onChange={handleFormChange}
            placeholder="Giải thích khoa học chi tiết về đáp án đúng..."
            rows="2"
          />
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="✏️ Chỉnh sửa câu hỏi kiến thức"
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateQuestion}
        submitText="Cập nhật"
        show={showEditModal}
      >
        <div className="form-group">
          <label>Câu hỏi kiến thức *</label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleFormChange}
            placeholder="Nhập câu hỏi về khoa học, thiên nhiên, văn hóa..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Các lựa chọn *</label>
          {formData.options.map((option, index) => (
            <div key={index} className="option-input">
              <div className="option-prefix">
                <input
                  type="radio"
                  name="correctAnswer"
                  value={index}
                  checked={formData.correctAnswer === index}
                  onChange={handleFormChange}
                />
                <span>{String.fromCharCode(65 + index)}</span>
              </div>
              <input
                type="text"
                name={`option${index}`}
                value={option}
                onChange={handleFormChange}
                placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
              />
            </div>
          ))}
          <p className="help-text">📌 Chọn radio button bên cạnh đáp án đúng</p>
        </div>

        <div className="form-group">
          <label>Danh mục (tùy chọn)</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleFormChange}
            placeholder="Ví dụ: Khoa học, Lịch sử, Địa lý, ..."
          />
        </div>

        <div className="form-group">
          <label>Độ khó</label>
          <select 
            name="difficulty"
            value={formData.difficulty}
            onChange={handleFormChange}
          >
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>

        <div className="form-group">
          <label>Giải thích (tuỳ chọn)</label>
          <textarea
            name="explanation"
            value={formData.explanation}
            onChange={handleFormChange}
            placeholder="Giải thích khoa học chi tiết về đáp án đúng..."
            rows="2"
          />
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="🗑️ Xác nhận xóa câu hỏi kiến thức"
        onClose={() => setShowDeleteModal(false)}
        onSubmit={handleDeleteQuestion}
        submitText="Xóa câu hỏi"
        submitVariant="danger"
        show={showDeleteModal}
      >
        <div className="question-preview">
          <p>Bạn có chắc muốn xóa câu hỏi:</p>
          <p><strong>{currentQuestion?.question}</strong></p>
          <p>Hành động này không thể hoàn tác.</p>
        </div>
      </Modal>
    </div>
  );
};

export default KnowledgeQuizManager; 