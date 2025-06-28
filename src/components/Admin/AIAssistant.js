import React, { useState } from 'react';
import Button from '../common/Button';
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

  // API key cố định (đã được fix)
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  // Prompt cố định cho câu hỏi "ngu" và vui nhộn
  const DEFAULT_PROMPT = `Tạo 5 câu hỏi "hỏi ngu" vui nhộn và hài hước cho game quiz tiếng Việt. 
  Câu hỏi phải có tính chất đánh lừa nhẹ nhàng, có twist bất ngờ, hoặc câu trả lời không như người chơi nghĩ.
  Mỗi câu hỏi cần có 4 lựa chọn và 1 đáp án đúng thú vị.
  
  Ví dụ:
  - "Một tháng mù đi du lịch ở bắc cực thấy gì?" → "Thấy toàn màu đen"
  - "Nếu bạn có 10 ngón tay và cắt đi 2 ngón, bạn còn bao nhiêu ngón tay?" → "10 ngón (chỉ cắt đi chứ không mất)"
  - "Cái gì càng nhiều càng ít thấy?" → "Sương mù"
  
  Hãy tạo câu hỏi theo phong cách này.`;

  // Call OpenAI API
  const callOpenAI = async (prompt) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Bạn là một chuyên gia tạo câu hỏi quiz thú vị bằng tiếng Việt. 
              Trả lời theo định dạng JSON chính xác như sau:
              {
                "questions": [
                  {
                    "question": "Nội dung câu hỏi",
                    "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
                    "correctAnswer": 0,
                    "explanation": "Giải thích đáp án"
                  }
                ]
              }`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.8
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'API call failed');
      }

      const content = data.choices[0].message.content;
      const result = JSON.parse(content);
      return result.questions || [];
      
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  };

  // Tạo câu hỏi "ngu" và vui nhộn
  const generateQuestions = async (useCustom = false) => {
    const prompt = useCustom && customPrompt.trim() ? customPrompt : DEFAULT_PROMPT;
    
    if (useCustom && !customPrompt.trim()) {
      alert('⚠️ Vui lòng nhập yêu cầu tùy chỉnh!');
      return;
    }

    setIsGenerating(true);

    try {
      const questions = await callOpenAI(prompt);
      
      if (questions && questions.length > 0) {
        setGeneratedQuestions(questions);
        setSelectedQuestions(new Set());
      } else {
        throw new Error('No questions generated');
      }

    } catch (error) {
      console.error('Error:', error);
      
      // Fallback mock data
      const mockQuestions = [
        {
          question: "Nếu bạn có 10 ngón tay và cắt đi 2 ngón, bạn còn bao nhiêu ngón tay?",
          options: ["8 ngón", "10 ngón", "2 ngón", "Không còn ngón nào"],
          correctAnswer: 1,
          explanation: "Bạn vẫn có 10 ngón tay! Chỉ cắt đi 2 ngón chứ không phải mất 2 ngón."
        },
        {
          question: "Cái gì càng nhiều càng ít thấy?",
          options: ["Ánh sáng", "Bóng tối", "Sương mù", "Nước"],
          correctAnswer: 2,
          explanation: "Sương mù càng nhiều thì tầm nhìn càng hạn chế!"
        },
        {
          question: "Tại sao người ta nói 'ngủ như chết'?",
          options: ["Vì ngủ rất sâu", "Vì không động đậy", "Vì không nghe tiếng động", "Vì giống như chết thật"],
          correctAnswer: 0,
          explanation: "Đây là cách nói về giấc ngủ rất sâu và ngon!"
        }
      ];

      setGeneratedQuestions(mockQuestions);
      setSelectedQuestions(new Set());
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
      onAddQuestions(selectedData);
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

  // Export câu hỏi đã chọn
  const exportSelected = () => {
    if (selectedQuestions.size === 0) {
      alert('⚠️ Vui lòng chọn ít nhất 1 câu hỏi!');
      return;
    }

    const selectedData = Array.from(selectedQuestions).map(index => 
      generatedQuestions[index]
    );

    const dataStr = JSON.stringify(selectedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai_generated_questions.json';
    link.click();

    alert(`✅ Đã export ${selectedQuestions.size} câu hỏi!`);
  };

  return (
    <div className="ai-assistant-simple">
      <div className="ai-header">
        <h2>🤪 Trợ lý Tạo Câu "Hỏi Ngu"</h2>
        <p>Tạo câu hỏi vui nhộn và hài hước cho game quiz</p>
      </div>

      {/* Quick Generate */}
      <div className="quick-section">
        <div className="quick-card">
          <div className="quick-info">
            <h3>🎯 Tạo câu hỏi "Hỏi Ngu"</h3>
            <p>AI sẽ tự động tạo 5 câu hỏi vui nhộn với twist bất ngờ</p>
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
               <Button
                 variant="secondary"
                 onClick={exportSelected}
                 disabled={selectedQuestions.size === 0}
               >
                 📥 Export JSON
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