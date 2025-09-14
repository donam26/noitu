import React, { useState } from 'react';
import Button from '../common/Button';
import { showSuccess, showError } from '../../utils/toast';
import EditableQuestionCard from './EditableQuestionCard';
import './AIQuestionGenerator.css';

const AIQuestionGenerator = ({ api, onQuestionsGenerated, questionType }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'medium',
    count: 1,
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'count' ? parseInt(value) : value,
    });
  };

  const handleGenerate = async () => {
    if (!formData.topic) {
      showError('Vui lòng nhập chủ đề câu hỏi.');
      return;
    }
    setLoading(true);
    setGeneratedQuestions([]);
    const result = await api.generateQuestions(
      formData.topic,
      formData.difficulty,
      formData.count
    );
    setLoading(false);

    if (result.success && result.data) {
        const questions = Array.isArray(result.data) ? result.data : [result.data];
        showSuccess(`Đã tạo thành công ${questions.length} câu hỏi. Vui lòng xem lại bên dưới.`);
        setGeneratedQuestions(questions);
    } else {
      showError(result.message || 'Không thể tạo câu hỏi bằng AI.');
    }
  };

  const handleSaveSuccess = (savedQuestion) => {
    // Xóa câu hỏi đã lưu khỏi danh sách preview
    setGeneratedQuestions(prev => prev.filter(q => q.question !== savedQuestion.question));
    // Tải lại danh sách câu hỏi chính
    onQuestionsGenerated();
  };

  return (
    <div className="ai-question-generator">
      <div className="form-group">
        <label htmlFor="topic">Chủ đề:</label>
        <input
          type="text"
          id="topic"
          name="topic"
          value={formData.topic}
          onChange={handleFormChange}
          placeholder={`Ví dụ: Lịch sử Việt Nam, Động vật...`}
        />
      </div>
      <div className="form-group-inline">
        <div className="form-group">
            <label htmlFor="difficulty">Độ khó:</label>
            <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleFormChange}>
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
            </select>
        </div>
        <div className="form-group">
            <label htmlFor="count">Số lượng:</label>
            <input type="number" id="count" name="count" value={formData.count} onChange={handleFormChange} min="1" max="10" />
        </div>
      </div>
      <Button onClick={handleGenerate} disabled={loading} className="generate-btn">
        {loading ? 'Đang tạo...' : `🚀 Tạo ${formData.count} câu hỏi`}
      </Button>

      {generatedQuestions.length > 0 && (
        <div className="generated-preview">
          <h4>Xem trước và chỉnh sửa câu hỏi đã tạo:</h4>
          {generatedQuestions.map((q, index) => (
            <EditableQuestionCard
                key={index}
                initialQuestion={q}
                api={api}
                onSaveSuccess={handleSaveSuccess}
                questionType={questionType}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AIQuestionGenerator;

