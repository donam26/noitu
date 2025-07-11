import { useState, useEffect, useCallback } from 'react';
import { quizAPI } from '../services/api';

/**
 * Hook sử dụng API để lấy và quản lý dữ liệu câu hỏi quiz
 * @returns {Object} - Dữ liệu và hàm quản lý
 */
const useQuizData = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState([]);

  /**
   * Lấy danh sách câu hỏi
   */
  const fetchQuestions = useCallback(async (page = 1, limit = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quizAPI.getQuestions(page, limit);
      
      if (response.success) {
        setQuestions(response.data.questions);
      } else {
        setError(response.message || 'Có lỗi khi lấy dữ liệu');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Lỗi khi lấy câu hỏi quiz:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy câu hỏi ngẫu nhiên
   * @returns {Object|null} - Câu hỏi và index
   */
  const getRandomQuestion = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await quizAPI.getRandomQuestion(usedQuestions);
      
      if (response.success && response.data) {
        const question = response.data.question;
        const index = response.data.index;
        
        // Cập nhật danh sách đã sử dụng
        setUsedQuestions(prev => [...prev, index]);
        
        setLoading(false);
        return { question, index };
      } else {
        setError(response.message || 'Không có câu hỏi nào khả dụng');
        setLoading(false);
        return null;
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Lỗi khi lấy câu hỏi ngẫu nhiên:', err);
      setLoading(false);
      return null;
    }
  }, [usedQuestions]);

  /**
   * Reset danh sách câu hỏi đã sử dụng
   */
  const resetUsedQuestions = useCallback(() => {
    setUsedQuestions([]);
  }, []);

  /**
   * Load dữ liệu khi component mount
   */
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    usedQuestions,
    fetchQuestions,
    getRandomQuestion,
    resetUsedQuestions
  };
};

export default useQuizData; 