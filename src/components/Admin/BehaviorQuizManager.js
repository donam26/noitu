import React, { useState, useEffect } from 'react';
import { behaviorQuestions } from '../../data/behaviorQuestions';
import Button from '../common/Button';
import Modal from '../common/Modal';
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

  const itemsPerPage = 5;

  // Khởi tạo dữ liệu từ file gốc
  useEffect(() => {
    const loadQuestions = () => {
      // Import lại module để lấy dữ liệu mới nhất
      import('../../data/behaviorQuestions').then(module => {
        const questions = module.behaviorQuestions;
        console.log(`📚 Load câu hỏi ứng xử từ file: ${questions.length} câu hỏi`);
        setQuestions(questions.map((q, index) => ({ ...q, id: index })));
      }).catch(error => {
        console.error('Error loading behavior questions:', error);
        setQuestions(behaviorQuestions.map((q, index) => ({ ...q, id: index })));
      });
    };

    loadQuestions();

    // Lắng nghe sự kiện từ AI Assistant
    const handleQuestionsUpdated = () => {
      console.log('🔄 Nhận được event behaviorQuestionsUpdated, đang reload module...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    window.addEventListener('behaviorQuestionsUpdated', handleQuestionsUpdated);

    return () => {
      window.removeEventListener('behaviorQuestionsUpdated', handleQuestionsUpdated);
    };
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  // Lọc câu hỏi theo search
  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
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
    setFormData({ ...question });
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
      // Lọc bỏ câu hỏi cần xóa
      const updatedQuestions = questions.filter(q => q.id !== questionToDelete.id);
      
      // Chuẩn bị dữ liệu để gửi API
      const questionsData = updatedQuestions.map(({ id, ...q }) => q);
      
      // Gọi API cập nhật toàn bộ file
      const response = await fetch('http://localhost:3001/api/update-all-behavior-questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionsData)
      });

      if (response.ok) {
        console.log('✅ Đã xóa câu hỏi ứng xử khỏi file thành công');
        
        // Cập nhật state
        setQuestions(updatedQuestions);
        
        // Emit event để reload
        window.dispatchEvent(new CustomEvent('behaviorQuestionsUpdated'));
        
      } else {
        throw new Error('Lỗi khi xóa câu hỏi ứng xử');
      }
    } catch (error) {
      console.error('❌ Lỗi:', error);
      alert(`❌ Không thể xóa: ${error.message}`);
    }
    
    setShowDeleteConfirm(false);
    setQuestionToDelete(null);
  };

  // Lưu câu hỏi
  const handleSave = async () => {
    if (!formData.question.trim() || formData.options.some(opt => !opt.trim())) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (editingQuestion) {
      // Cập nhật câu hỏi hiện có
      try {
        const updatedQuestions = questions.map(q =>
          q.id === editingQuestion.id ? { ...formData, id: editingQuestion.id } : q
        );
        
        // Chuẩn bị dữ liệu để gửi API
        const questionsData = updatedQuestions.map(({ id, ...q }) => q);
        
        // Gọi API cập nhật toàn bộ file
        const response = await fetch('http://localhost:3001/api/update-all-behavior-questions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionsData)
        });

        if (response.ok) {
          console.log('✅ Đã cập nhật câu hỏi ứng xử trong file thành công');
          
          // Cập nhật state
          setQuestions(updatedQuestions);
          
          // Emit event để reload
          window.dispatchEvent(new CustomEvent('behaviorQuestionsUpdated'));
          
          alert('✅ Đã cập nhật câu hỏi trong file behaviorQuestions.js!');
        } else {
          throw new Error('Lỗi khi cập nhật câu hỏi ứng xử');
        }
      } catch (error) {
        console.error('❌ Lỗi:', error);
        alert(`❌ Không thể cập nhật: ${error.message}`);
        return;
      }
    } else {
      // Thêm câu hỏi mới vào file
      const newQuestionData = {
        question: formData.question,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation
      };

      try {
        const response = await fetch('http://localhost:3001/api/update-behavior-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([newQuestionData])
        });

        if (response.ok) {
          console.log('✅ Đã thêm câu hỏi ứng xử mới vào file thành công');
          
          // Cập nhật local state
          const newQuestion = { ...newQuestionData, id: questions.length };
          setQuestions([...questions, newQuestion]);
          
          // Emit event để reload
          window.dispatchEvent(new CustomEvent('behaviorQuestionsUpdated'));
          
          alert('✅ Đã thêm câu hỏi mới vào file behaviorQuestions.js!');
        } else {
          throw new Error('Lỗi khi thêm câu hỏi ứng xử');
        }
      } catch (error) {
        console.error('❌ Lỗi:', error);
        alert(`❌ Không thể thêm: ${error.message}`);
        return;
      }
    }

    setShowModal(false);
    resetForm();
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

  // Export dữ liệu
  const handleExport = () => {
    const dataStr = JSON.stringify(questions.map(({ id, ...q }) => q), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'behavior_questions_export.json';
    link.click();
    
    alert(`✅ Đã export ${questions.length} câu hỏi ứng xử!`);
  };

  return (
    <div className="quiz-manager">
      <div className="quiz-header">
        <div className="quiz-title">
          <h2>🤝 Quản lý Câu hỏi Ứng Xử</h2>
          <p>Tổng số: {questions.length} câu hỏi về đạo đức và giáo dục công dân</p>
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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
      </div>

      {/* Questions List */}
      <div className="questions-list">
        {paginatedQuestions.length > 0 ? (
          paginatedQuestions.map((question, index) => (
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
                        optIndex === question.correctAnswer ? 'correct' : ''
                      }`}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      <span className="option-text">{option}</span>
                      {optIndex === question.correctAnswer && (
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
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default BehaviorQuizManager; 