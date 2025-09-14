import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { showSuccess, showError, showInfo } from '../../utils/toast';
import './QuizManager.css';
import { behaviorAPI } from '../../services/api';
import AIQuestionGenerator from './AIQuestionGenerator';

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
  const [showAIModal, setShowAIModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 5;

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
      // Sử dụng service API thay vì gọi axios trực tiếp
      const response = await behaviorAPI.getQuestions(currentPage, itemsPerPage, {
        search: searchTerm
      });

      if (response.success) {
        const { questions, pagination } = response.data;
        setQuestions(questions);
        setTotalQuestions(pagination.total);
        setTotalPages(pagination.pages);
        console.log(`📚 Đã tải ${questions.length}/${pagination.total} câu hỏi ứng xử`);
      } else {
        showError(response.message || 'Không thể tải danh sách câu hỏi');
      }
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi ứng xử:', error);
      showError('Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.');
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
      // Sử dụng service API thay vì gọi axios trực tiếp
      const response = await behaviorAPI.deleteQuestion(questionToDelete.id);

      if (response.success) {
        console.log('✅ Đã xóa câu hỏi ứng xử thành công');
        
        // Cập nhật danh sách câu hỏi
        fetchQuestions();
        
        // Hiển thị thông báo thành công
        showSuccess(response.message || 'Đã xóa câu hỏi thành công!');
      } else {
        throw new Error(response.message || 'Lỗi khi xóa câu hỏi ứng xử');
      }
    } catch (error) {
      console.error('❌ Lỗi:', error);
      showError(`Không thể xóa: ${error.message}`);
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
        response = await behaviorAPI.updateQuestion(editingQuestion.id, questionData);

        if (response.success) {
          console.log('✅ Đã cập nhật câu hỏi ứng xử thành công');
          showSuccess(response.message || 'Đã cập nhật câu hỏi thành công!');
        } else {
          throw new Error(response.message || 'Lỗi khi cập nhật câu hỏi');
        }
      } else {
        // Thêm câu hỏi mới
        response = await behaviorAPI.addQuestion(questionData);

        if (response.success) {
          console.log('✅ Đã thêm câu hỏi ứng xử mới thành công');
          showSuccess(response.message || 'Đã thêm câu hỏi mới thành công!');
        } else {
          throw new Error(response.message || 'Lỗi khi thêm câu hỏi');
        }
      }

      // Cập nhật danh sách câu hỏi
      fetchQuestions();
      
      // Đóng modal và reset form
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('❌ Lỗi:', error);
      showError(`Không thể lưu: ${error.message}`);
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

  const handleSearch = () => {
    setCurrentPage(1); // Quay về trang 1 khi tìm kiếm
    fetchQuestions();
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const difficultyLabels = {
    easy: '🟢 Dễ',
    medium: '🟡 Trung bình',
    hard: '🔴 Khó'
  };

  // Render component
  return (
    <div className="quiz-manager">
      <div className="quiz-header">
        <div className="quiz-title">
          <h2>🧠 Quản lý câu hỏi "Vua Ứng Xử"</h2>
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
          <Button onClick={handleAdd} className="add-btn">
            ➕ Thêm câu hỏi
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có câu hỏi nào. Hãy thêm câu hỏi mới!</p>
        </div>
      ) : (
        <>
          <div className="questions-list">
            {questions.map((question) => (
              <div key={question.id} className="question-card">
                <div className="question-header">
                  <div className="question-actions">
                    <button 
                      className="edit-btn" 
                      onClick={() => handleEdit(question)}
                      title="Sửa câu hỏi"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(question)}
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
            ))}
          </div>
          
          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
              >
                &laquo; Trước
              </button>
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
              >
                Sau &raquo;
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal thêm/sửa câu hỏi */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingQuestion ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
      >
        <div className="question-form">
          <div className="form-group">
            <label htmlFor="question">Câu hỏi:</label>
            <textarea
              id="question"
              value={formData.question}
              onChange={(e) => updateFormData('question', e.target.value)}
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
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Phương án ${String.fromCharCode(65 + index)}...`}
                />
                <input
                  type="radio"
                  name="correctAnswer"
                  value={index}
                  checked={formData.correctAnswer === index}
                  onChange={() => updateFormData('correctAnswer', index)}
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
                value={formData.category}
                onChange={(e) => updateFormData('category', e.target.value)}
                placeholder="Danh mục câu hỏi (tùy chọn)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="difficulty">Độ khó:</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => updateFormData('difficulty', e.target.value)}
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
              value={formData.explanation}
              onChange={(e) => updateFormData('explanation', e.target.value)}
              placeholder="Giải thích đáp án..."
            />
          </div>
          
          <div className="form-actions">
            <Button onClick={() => setShowModal(false)} variant="secondary">
              Hủy bỏ
            </Button>
            <Button onClick={handleSave}>
              {editingQuestion ? "Lưu thay đổi" : "Thêm câu hỏi"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Xác nhận xóa"
        size="small"
      >
        <div className="confirm-delete">
          <p>Bạn có chắc chắn muốn xóa câu hỏi này không?</p>
          <div className="form-actions">
            <Button onClick={() => setShowDeleteConfirm(false)} variant="secondary">
              Hủy bỏ
            </Button>
            <Button onClick={confirmDelete} variant="danger">
              Xóa câu hỏi
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal tạo câu hỏi bằng AI */}
      <Modal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        title="Tạo câu hỏi Vua Ứng Xử bằng AI"
      >
        <AIQuestionGenerator
          api={behaviorAPI}
          onQuestionsGenerated={() => {
            setShowAIModal(false);
            fetchQuestions();
          }}
          questionType="behavior"
        />
      </Modal>
    </div>
  );
};

export default BehaviorQuizManager; 