import React, { useState, useEffect, useCallback } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { showSuccess, showError } from '../../utils/toast';
import { quizGameAPI } from '../../services/quizGameApi'; // Corrected import
import AIQuestionGenerator from './AIQuestionGenerator';
import './QuizManager.css';

const QuizManager = ({ quizType, title }) => {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const itemsPerPage = 5;

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await quizGameAPI.getQuestions(quizType, currentPage, itemsPerPage, { search: searchTerm });
      if (response.success) {
        setQuestions(response.data.questions);
        setPagination(response.data.pagination);
      } else {
        showError(response.message || 'Không thể tải danh sách câu hỏi');
      }
    } catch (error) {
      showError('Lỗi kết nối khi tải câu hỏi.');
    } finally {
      setLoading(false);
    }
  }, [quizType, currentPage, searchTerm]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: '',
    difficulty: 'medium',
  });

  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      category: '',
      difficulty: 'medium',
    });
    setEditingQuestion(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (question) => {
    setFormData({
      ...question,
      correctAnswer: question.correct_answer,
      options: question.options || ['', '', '', ''],
    });
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleDelete = (question) => {
    setQuestionToDelete(question);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    const response = await quizGameAPI.deleteQuestion(quizType, questionToDelete.id);
    if (response.success) {
      showSuccess('Đã xóa câu hỏi thành công!');
      fetchQuestions();
    } else {
      showError(response.message || 'Lỗi khi xóa câu hỏi');
    }
    setShowDeleteConfirm(false);
    setQuestionToDelete(null);
  };

  const handleSave = async () => {
    if (!formData.question.trim() || formData.options.some(opt => !opt.trim())) {
      showError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const questionData = {
        ...formData,
        correct_answer: formData.correctAnswer,
    };

    const apiCall = editingQuestion
      ? quizGameAPI.updateQuestion(quizType, editingQuestion.id, questionData)
      : quizGameAPI.addQuestion(quizType, questionData);

    const response = await apiCall;
    if (response.success) {
      showSuccess(editingQuestion ? 'Cập nhật thành công!' : 'Thêm câu hỏi thành công!');
      fetchQuestions();
      setShowModal(false);
      resetForm();
    } else {
      showError(response.message || 'Lỗi khi lưu câu hỏi');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    updateFormData('options', newOptions);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchQuestions();
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="quiz-manager">
      <div className="quiz-header">
        <div className="quiz-title">
          <h2>{title}</h2>
          <p>Tổng số câu hỏi: {pagination.total}</p>
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
          <Button onClick={() => setShowAIModal(true)} className="ai-btn">🤖 Tạo bằng AI</Button>
          <Button onClick={handleAdd} className="add-btn">➕ Thêm câu hỏi</Button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><p>Đang tải dữ liệu...</p></div>
      ) : questions.length === 0 ? (
        <div className="empty-state"><p>Chưa có câu hỏi nào.</p></div>
      ) : (
        <>
          <div className="questions-list">
            {questions.map((q) => (
              <div key={q.id} className="question-card">
                 <div className="question-header">
                  <div className="question-actions">
                    <button className="edit-btn" onClick={() => handleEdit(q)} title="Sửa">✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(q)} title="Xóa">🗑️</button>
                  </div>
                </div>
                <div className="question-content">
                  <h3>{q.question}</h3>
                  <div className="options-list">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={`option ${idx === q.correct_answer ? 'correct' : ''}`}>
                        {String.fromCharCode(65 + idx)}. {opt}
                        {idx === q.correct_answer && <span className="correct-badge">✓</span>}
                      </div>
                    ))}
                  </div>
                  {q.explanation && <div className="explanation"><strong>Giải thích:</strong> {q.explanation}</div>}
                </div>
              </div>
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="pagination">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage <= 1}>&laquo; Trước</button>
              <span>Trang {currentPage} / {pagination.pages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, pagination.pages))} disabled={currentPage >= pagination.pages}>Sau &raquo;</button>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}>
        <div className="question-form">
            <div className="form-group">
                <label>Câu hỏi:</label>
                <textarea value={formData.question} onChange={(e) => updateFormData('question', e.target.value)} />
            </div>
            <div className="form-group options-group">
                <label>Các phương án:</label>
                {formData.options.map((opt, idx) => (
                    <div key={idx} className="option-input">
                        <span>{String.fromCharCode(65 + idx)}</span>
                        <input type="text" value={opt} onChange={(e) => updateOption(idx, e.target.value)} />
                        <input type="radio" name="correctAnswer" value={idx} checked={formData.correctAnswer === idx} onChange={() => updateFormData('correctAnswer', idx)} />
                    </div>
                ))}
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Danh mục:</label>
                    <input type="text" value={formData.category} onChange={(e) => updateFormData('category', e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Độ khó:</label>
                    <select value={formData.difficulty} onChange={(e) => updateFormData('difficulty', e.target.value)}>
                        <option value="easy">Dễ</option>
                        <option value="medium">Trung bình</option>
                        <option value="hard">Khó</option>
                    </select>
                </div>
            </div>
            <div className="form-group">
                <label>Giải thích:</label>
                <textarea value={formData.explanation} onChange={(e) => updateFormData('explanation', e.target.value)} />
            </div>
            <div className="form-actions">
                <Button onClick={() => setShowModal(false)} variant="secondary">Hủy</Button>
                <Button onClick={handleSave}>{editingQuestion ? 'Lưu' : 'Thêm'}</Button>
            </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Xác nhận xóa" size="small">
        <div className="confirm-delete">
          <p>Bạn có chắc chắn muốn xóa câu hỏi này?</p>
          <div className="form-actions">
            <Button onClick={() => setShowDeleteConfirm(false)} variant="secondary">Hủy</Button>
            <Button onClick={confirmDelete} variant="danger">Xóa</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAIModal} onClose={() => setShowAIModal(false)} title={`Tạo câu hỏi ${title} bằng AI`}>
        <AIQuestionGenerator
          quizType={quizType}
          onQuestionsGenerated={() => {
            setShowAIModal(false);
            fetchQuestions();
          }}
        />
      </Modal>
    </div>
  );
};

export default QuizManager;
