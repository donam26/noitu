import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { showSuccess, showError } from '../../utils/toast';
import './EditableQuestionCard.css';

const EditableQuestionCard = ({ initialQuestion, api, onSaveSuccess, questionType }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData({
        question: initialQuestion.question || '',
        options: initialQuestion.options || ['', '', '', ''],
        correctAnswer: initialQuestion.correct_answer !== undefined ? initialQuestion.correct_answer : 0,
        explanation: initialQuestion.explanation || '',
        category: initialQuestion.category || '',
        difficulty: initialQuestion.difficulty || 'medium',
    });
  }, [initialQuestion]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('option')) {
      const index = parseInt(name.replace('option', ''));
      const newOptions = [...formData.options];
      newOptions[index] = value;
      setFormData({ ...formData, options: newOptions });
    } else {
      setFormData({ ...formData, [name]: name === 'correctAnswer' ? parseInt(value) : value });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const questionData = { ...formData, type: questionType };
    const response = await api.addQuestion(questionData);
    setIsSaving(false);

    if (response.success) {
      showSuccess('Đã lưu câu hỏi thành công!');
      onSaveSuccess(initialQuestion); // Gửi lại câu hỏi gốc để xóa khỏi danh sách preview
    } else {
      showError(response.message || 'Không thể lưu câu hỏi.');
    }
  };

  return (
    <div className="editable-question-card">
      <div className="form-group">
        <label>Câu hỏi:</label>
        <textarea name="question" value={formData.question} onChange={handleFormChange} />
      </div>
      <div className="form-group">
        <label>Các lựa chọn:</label>
        {formData.options && formData.options.map((opt, index) => (
          <div key={index} className="option-input">
            <input type="radio" name="correctAnswer" value={index} checked={formData.correctAnswer === index} onChange={handleFormChange} />
            <input type="text" name={`option${index}`} value={opt} onChange={handleFormChange} />
          </div>
        ))}
      </div>
      <div className="form-group">
        <label>Giải thích:</label>
        <textarea name="explanation" value={formData.explanation} onChange={handleFormChange} />
      </div>
      <div className="form-actions">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Đang lưu...' : 'Lưu câu hỏi này'}
        </Button>
      </div>
    </div>
  );
};

export default EditableQuestionCard;

