import React, { useState } from 'react';
import Button from '../common/Button';
import api from '../../services/api'; // Import a service to call the backend API
import './AIAssistant.css';

/**
 * Component AIAssistant - Trợ lý AI tạo câu hỏi "ngu" và vui nhộn
 * @param {Object} props - Props của component
 * @param {Function} props.onAddQuestions - Callback để thêm câu hỏi vào hệ thống
 */
const AIAssistant = ({ onAddQuestions }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [questionType, setQuestionType] = useState('quiz');



  // Prompt cố định cho từng loại câu hỏi
  const DEFAULT_PROMPTS = {
    quiz: `Tạo 5 câu hỏi "hỏi ngu" vui nhộn và hài hước cho game quiz tiếng Việt. 
    Câu hỏi phải có tính chất đánh lừa nhẹ nhàng, có twist bất ngờ, hoặc câu trả lời không như người chơi nghĩ.
    Mỗi câu hỏi cần có 4 lựa chọn và 1 đáp án đúng thú vị.
    
    Ví dụ:
    - "Một tháng mù đi du lịch ở bắc cực thấy gì?" → "Thấy toàn màu đen"
    - "Nếu bạn có 10 ngón tay và cắt đi 2 ngón, bạn còn bao nhiêu ngón tay?" → "10 ngón (chỉ cắt đi chứ không mất)"
    - "Cái gì càng nhiều càng ít thấy?" → "Sương mù"
    
    Hãy tạo câu hỏi theo phong cách này.`,
    
    behavior: `Tạo 5 câu hỏi về ứng xử, đạo đức và giáo dục công dân cho trẻ em Việt Nam.
    Câu hỏi nên giáo dục về cách cư xử đúng mực, tôn trọng người khác, ý thức pháp luật và giá trị đạo đức.
    Mỗi câu hỏi cần có 4 lựa chọn với 1 đáp án đúng thể hiện hành vi tích cực.
    
    Ví dụ:
    - "Khi thấy bạn bị bắt nạt ở trường, em nên làm gì?" → "Báo cho thầy cô và an ủi bạn"
    - "Khi đi trên đường, em thấy có rác, em nên?" → "Nhặt lên bỏ vào thùng rác"
    - "Nếu nhặt được tiền, em sẽ làm gì?" → "Nộp cho thầy cô hoặc công an"
    
    Hãy tạo câu hỏi giáo dục tích cực cho trẻ em.`,
    
    knowledge: `Tạo 5 câu hỏi về sự thật thú vị trong khoa học, thiên nhiên và văn hóa cho trẻ em.
    Câu hỏi nên bổ ích, dễ hiểu và kích thích trí tò mò của trẻ em về thế giới xung quanh.
    Mỗi câu hỏi cần có 4 lựa chọn với 1 đáp án đúng có giải thích khoa học hoặc văn hóa.
    
    Ví dụ:
    - "Tại sao bầu trời có màu xanh?" → "Ánh sáng xanh bị tán xạ nhiều nhất"
    - "Động vật nào có tim to nhất thế giới?" → "Cá voi xanh"
    - "Mặt trăng cách Trái đất bao xa?" → "Khoảng 384.400 km"
    
    Hãy tạo câu hỏi khoa học thú vị và bổ ích.`
  };

  // Call Backend API to generate questions with Gemini
  const callBackendAPI = async (prompt, type) => {
    try {
      const response = await api.post('/games/generate-questions', {
        topic: prompt,
        count: 5,
        difficulty: 'medium',
        type: type
      });

      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'API call failed');
      }
    } catch (error) {
      console.error('Backend API Error:', error);
      throw error;
    }
  };

  // Tạo câu hỏi theo loại đã chọn
  const generateQuestions = async (useCustom = false) => {
    const prompt = useCustom && customPrompt.trim() ? customPrompt : DEFAULT_PROMPTS[questionType];
    
   

    setIsGenerating(true);

    try {
      const questions = await callBackendAPI(prompt, questionType);
      
      if (questions && questions.length > 0) {
        setGeneratedQuestions(questions);
        setSelectedQuestions(new Set());
      } else {
        throw new Error('No questions generated');
      }

    } catch (error) {
      console.error('Error:', error);
      
    } finally {
      setIsGenerating(false);
    }
  };

  // Thêm câu hỏi đã chọn vào hệ thống
  const addToSystem = () => {
    if (selectedQuestions.size === 0) {
      alert('⚠️ Vui lòng chọn ít nhất 1 câu hỏi!');
      return;
    }

    const selectedData = Array.from(selectedQuestions).map(index => 
      generatedQuestions[index]
    );

    if (onAddQuestions) {
      onAddQuestions(selectedData, questionType);
      alert(`✅ Đã thêm ${selectedQuestions.size} câu hỏi vào hệ thống!`);
      
      // Reset sau khi thêm
      setGeneratedQuestions([]);
      setSelectedQuestions(new Set());
      setCustomPrompt('');
    }
  };

  // Toggle chọn câu hỏi
  const toggleQuestion = (index) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };


  const questionTypeLabels = {
    quiz: { icon: '🤪', title: 'Vua Hỏi Ngu', desc: 'Câu hỏi vui nhộn và hài hước' },
    behavior: { icon: '🤝', title: 'Vua Ứng Xử', desc: 'Câu hỏi về đạo đức và ứng xử' },
    knowledge: { icon: '🧠', title: 'Vua Kiến Thức', desc: 'Câu hỏi về khoa học và văn hóa' }
  };

  return (
    <div className="ai-assistant-simple">
      <div className="ai-header">
        <h2>{questionTypeLabels[questionType].icon} Trợ lý Tạo Câu {questionTypeLabels[questionType].title}</h2>
        <p>{questionTypeLabels[questionType].desc}</p>
      </div>

      {/* Question Type Selector */}
      <div className="type-selector">
        <h3>🎯 Chọn loại câu hỏi:</h3>
        <div className="type-tabs">
          {Object.entries(questionTypeLabels).map(([type, config]) => (
            <button
              key={type}
              className={`type-tab ${questionType === type ? 'active' : ''}`}
              onClick={() => setQuestionType(type)}
            >
              <span className="tab-icon">{config.icon}</span>
              <span className="tab-title">{config.title}</span>
              <span className="tab-desc">{config.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Generate */}
      <div className="quick-section">
        <div className="quick-card">
          <div className="quick-info">
            <h3>🎯 Tạo câu hỏi {questionTypeLabels[questionType].title}</h3>
            <p>AI sẽ tự động tạo 5 {questionTypeLabels[questionType].desc.toLowerCase()}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => generateQuestions(false)}
            disabled={isGenerating}
            className="quick-btn"
          >
            {isGenerating ? '🔄 Đang tạo...' : '🚀 Tạo câu hỏi ngay'}
          </Button>
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="custom-section">
        <h3>✍️ Hoặc mô tả riêng</h3>
        <div className="custom-input">
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ví dụ: 'Tạo câu hỏi về động vật với câu trả lời bất ngờ'"
            rows="3"
          />
          <Button
            variant="secondary"
            onClick={() => generateQuestions(true)}
            disabled={isGenerating || !customPrompt.trim()}
            className="custom-btn"
          >
            {isGenerating ? '🔄 Đang tạo...' : '🎯 Tạo theo mô tả'}
          </Button>
        </div>
      </div>

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>🎯 Câu hỏi được tạo ({generatedQuestions.length})</h3>
                         <div className="results-actions">
               <span className="selected-info">Đã chọn: {selectedQuestions.size}</span>
               <Button
                 variant="primary"
                 onClick={addToSystem}
                 disabled={selectedQuestions.size === 0}
                 className="add-btn"
               >
                 ➕ Thêm vào hệ thống ({selectedQuestions.size})
               </Button>
             </div>
          </div>

          <div className="questions-list">
            {generatedQuestions.map((question, index) => (
              <div
                key={index}
                className={`question-item ${selectedQuestions.has(index) ? 'selected' : ''}`}
              >
                <div className="question-select">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.has(index)}
                    onChange={() => toggleQuestion(index)}
                  />
                </div>

                <div className="question-content">
                  <h4>{question.question}</h4>
                  <div className="options">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`option ${optIndex === question.correctAnswer ? 'correct' : ''}`}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + optIndex)}.</span>
                        <span className="option-text">{option}</span>
                        {optIndex === question.correctAnswer && <span className="check">✓</span>}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant; 