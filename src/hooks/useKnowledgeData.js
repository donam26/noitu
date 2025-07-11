import { useState, useCallback } from 'react';
import { quizAPI } from '../services/api';

/**
 * Hook quản lý dữ liệu cho Knowledge Quiz
 * @returns {Object} - Các function và data cần thiết
 */
const useKnowledgeData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState([]);

  /**
   * Lấy câu hỏi kiến thức ngẫu nhiên
   * @returns {Promise<Object>} Câu hỏi kiến thức
   */
  const getRandomQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        exclude: usedQuestions.join(',')
      };
      
      const response = await quizAPI.getRandomKnowledgeQuestion(params);
      
      if (response.success) {
        // Thêm id câu hỏi vào danh sách đã sử dụng
        if (response.data && response.data.id) {
          setUsedQuestions(prev => [...prev, response.data.id]);
        }
        
        return {
          question: response.data,
          success: true
        };
      } else {
        setError(response.message || 'Không thể lấy câu hỏi kiến thức');
        return { success: false };
      }
    } catch (err) {
      console.error('Lỗi khi lấy câu hỏi kiến thức:', err);
      setError('Không thể kết nối đến server');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [usedQuestions]);

  /**
   * Reset danh sách câu hỏi đã sử dụng
   */
  const resetUsedQuestions = useCallback(() => {
    setUsedQuestions([]);
  }, []);

  return {
    loading,
    error,
    usedQuestions,
    getRandomQuestion,
    resetUsedQuestions
  };
};

export default useKnowledgeData; 