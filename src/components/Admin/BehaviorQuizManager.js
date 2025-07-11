import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { showSuccess, showError, showInfo } from '../../utils/toast';
import { getAuthHeaders } from '../../utils/auth';
import './QuizManager.css';

/**
 * Component BehaviorQuizManager - Quản lý CRUD câu hỏi Vua Ứng Xử
 */
const BehaviorQuizManager = () => {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 5;
  const API_URL = 'http://localhost:3001/api';

  // Khởi tạo dữ liệu từ API
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

  // Hàm lấy danh sách câu hỏi từ API
  const fetchQuestions = async (signal) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/behavior`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm
        },
        ...getAuthHeaders(),
        signal
      });

      if (response.data.success) {
        const { questions, pagination } = response.data.data;
        setQuestions(questions);
        setTotalQuestions(pagination.total);
        setTotalPages(pagination.pages);
        console.log(`📚 Đã tải ${questions.length}/${pagination.total} câu hỏi ứng xử`);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Lỗi khi tải câu hỏi ứng xử:', error);
        showError('Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: '',
    difficulty: 'medium'
  });

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
    setEditingQuestion(null);
  };

  // Mở modal thêm câu hỏi
  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  // Mở modal sửa câu hỏi
  const handleEdit = (question) => {
    const formattedQuestion = {
      ...question,
      correctAnswer: question.correct_answer,
      options: question.options || ['', '', '', '']
    };
    setFormData(formattedQuestion);
    setEditingQuestion(question);
    setShowModal(true);
  };

  // Xóa câu hỏi
  const handleDelete = (question) => {
    setQuestionToDelete(question);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(`${API_URL}/behavior/${questionToDelete.id}`, getAuthHeaders());

      if (response.data.success) {
        console.log('✅ Đã xóa câu hỏi ứng xử thành công');
        
        // Cập nhật danh sách câu hỏi
        fetchQuestions();
        
        // Hiển thị thông báo thành công
        showSuccess('Đã xóa câu hỏi thành công!');
      } else {
        throw new Error('Lỗi khi xóa câu hỏi ứng xử');
      }
    } catch (error) {
      console.error('❌ Lỗi:', error);
      showError(`Không thể xóa: ${error.response?.data?.message || error.message}`);
    }
    
    setShowDeleteConfirm(false);
    setQuestionToDelete(null);
  };

  // Lưu câu hỏi
  const handleSave = async () => {
    if (!formData.question.trim() || formData.options.some(opt => !opt.trim())) {
      showError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const questionData = {
        question: formData.question,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        category: formData.category,
        difficulty: formData.difficulty
      };

      let response;

      if (editingQuestion) {
        // Cập nhật câu hỏi hiện có
        response = await axios.put(`${API_URL}/behavior/${editingQuestion.id}`, questionData, getAuthHeaders());

        if (response.data.success) {
          console.log('✅ Đã cập nhật câu hỏi ứng xử thành công');
          showSuccess('Đã cập nhật câu hỏi thành công!');
        }
      } else {
        // Thêm câu hỏi mới
        response = await axios.post(`${API_URL}/behavior`, questionData, getAuthHeaders());

        if (response.data.success) {
          console.log('✅ Đã thêm câu hỏi ứng xử mới thành công');
          showSuccess('Đã thêm câu hỏi mới thành công!');
        }
      }

      // Cập nhật danh sách câu hỏi
      fetchQuestions();
      
      // Đóng modal và reset form
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('❌ Lỗi:', error);
      showError(`Không thể lưu: ${error.response?.data?.message || error.message}`);
    }
  };

  // Cập nhật input của form
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Cập nhật option
  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    updateFormData('options', newOptions);
  };

  // Tìm kiếm câu hỏi
  const handleSearch = () => {
    setCurrentPage(1);
    fetchQuestions();
  };

  // Export dữ liệu
  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/behavior`, {
        params: { limit: 1000 }, // Lấy tất cả câu hỏi
        ...getAuthHeaders()
      });

      if (response.data.success) {
        const allQuestions = response.data.data.questions;
        const formattedQuestions = allQuestions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
          category: q.category,
          difficulty: q.difficulty
        }));
        
        const dataStr = JSON.stringify(formattedQuestions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'behavior_questions_export.json';
        link.click();
        
        showSuccess(`Đã export ${formattedQuestions.length} câu hỏi ứng xử!`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi export:', error);
      showError(`Không thể export: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="quiz-manager">
      <div className="quiz-header">
        <div className="quiz-title">
          <h2>🤝 Quản lý Câu hỏi Ứng Xử</h2>
          <p>Tổng số: {totalQuestions} câu hỏi về đạo đức và giáo dục công dân</p>
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
            onClick={handleAdd}
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
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
        />
        <Button variant="secondary" onClick={handleSearch}>Tìm kiếm</Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-container">
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Questions List */}
      <div className="questions-list">
        {!loading && questions.length > 0 ? (
          questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <div className="question-header">
                <div className="question-number">
                  #{(currentPage - 1) * itemsPerPage + index + 1}
                </div>
                <div className="question-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(question)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(question)}
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
                        {String.fromCharCode(65 + optIndex)}.
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
              </div>
            </div>
          ))
        ) : !loading && (
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="quiz-modal">
            <div className="modal-header">
              <h3>
                {editingQuestion ? '✏️ Chỉnh sửa câu hỏi ứng xử' : '➕ Thêm câu hỏi ứng xử'}
              </h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Câu hỏi ứng xử *</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => updateFormData('question', e.target.value)}
                  placeholder="Nhập câu hỏi về đạo đức, ứng xử, giáo dục công dân..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Các lựa chọn *</label>
                {formData.options.map((option, index) => (
                  <div key={index} className="option-input">
                    <span className="option-prefix">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                      required
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() => updateFormData('correctAnswer', index)}
                      title="Đáp án đúng"
                    />
                  </div>
                ))}
                <p className="help-text">📌 Chọn radio button bên cạnh đáp án đúng</p>
              </div>

              <div className="form-group">
                <label>Giải thích (tuỳ chọn)</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => updateFormData('explanation', e.target.value)}
                  placeholder="Giải thích tại sao đáp án này đúng và tầm quan trọng của hành vi này..."
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Danh mục (tuỳ chọn)</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => updateFormData('category', e.target.value)}
                    placeholder="Ví dụ: Đạo đức, Lễ nghĩa, Giao tiếp..."
                  />
                </div>

                <div className="form-group">
                  <label>Độ khó</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => updateFormData('difficulty', e.target.value)}
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                variant="primary"
                onClick={handleSave}
                className="save-btn"
              >
                💾 {editingQuestion ? 'Cập nhật' : 'Thêm'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                ❌ Hủy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        title="🗑️ Xác nhận xóa câu hỏi ứng xử"
        message={`Bạn có chắc muốn xóa câu hỏi: "${questionToDelete?.question}"?`}
        onConfirm={confirmDelete}
        onClose={() => setShowDeleteConfirm(false)}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
    </div>
  );
};

export default BehaviorQuizManager; 