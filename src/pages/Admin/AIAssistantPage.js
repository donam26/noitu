import React from 'react';
import AIAssistant from '../../components/Admin/AIAssistant';
import { quizAPI, behaviorAPI, knowledgeAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import './AIAssistantPage.css';

/**
 * AIAssistantPage - Trang AI Assistant để tạo câu hỏi tự động
 */
const AIAssistantPage = () => {
  // Callback để thêm câu hỏi từ AI vào hệ thống
  const handleAddQuestions = async (newQuestions, questionType = 'quiz') => {
    console.log(`🤖 AI thêm ${newQuestions.length} câu hỏi ${questionType} mới`);
    
    try {
      let response;
      let eventName;
      
      switch (questionType) {
        case 'behavior':
          response = await behaviorAPI.bulkAddQuestions(newQuestions);
          eventName = 'behaviorQuestionsUpdated';
          break;
        case 'knowledge':
          response = await knowledgeAPI.bulkAddQuestions(newQuestions);
          eventName = 'knowledgeQuestionsUpdated';
          break;
        default:
          response = await quizAPI.bulkAddQuestions(newQuestions);
          eventName = 'questionsUpdated';
      }

      if (response.success) {
        console.log(`✅ Đã thêm câu hỏi ${questionType} thành công vào database`);
        
        // Emit event để manager tương ứng reload
        window.dispatchEvent(new CustomEvent(eventName));
        console.log(`📡 Đã emit event ${eventName}`);
        
        // Thông báo thành công
        showSuccess(`✅ Đã thêm ${newQuestions.length} câu hỏi ${questionType} vào database!`);
        return true;
      } else {
        throw new Error(response.message || 'Lỗi khi thêm câu hỏi');
      }
    } catch (error) {
      console.error('❌ Lỗi khi thêm câu hỏi:', error);
      showError(`❌ Lỗi: ${error.message}\n\nVui lòng kiểm tra API server có đang chạy không.`);
      return false;
    }
  };

  return (
    <div className="ai-assistant-page">
      <AIAssistant onAddQuestions={handleAddQuestions} />
    </div>
  );
};

export default AIAssistantPage; 