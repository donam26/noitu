import { useState, useCallback } from 'react';
import { questionAPI } from '../services/api';

/**
 * Custom hook để quản lý dữ liệu câu hỏi từ model Question hợp nhất
 * @returns {Object} - Các state và functions để quản lý dữ liệu câu hỏi
 */
const useQuestionData = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);

  /**
   * Lấy danh sách câu hỏi theo loại
   * @param {string} type - Loại câu hỏi ('quiz', 'knowledge', 'behavior')
   * @param {number} page - Trang hiện tại
   * @param {number} limit - Số lượng câu hỏi mỗi trang
   * @param {string} category - Danh mục câu hỏi
   * @param {string} difficulty - Độ khó ('easy', 'medium', 'hard')
   */
  const fetchQuestions = useCallback(async (
    type = null,
    page = 1,
    limit = 20,
    category = null,
    difficulty = null
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await questionAPI.getQuestions(type, page, limit, category, difficulty);
      
      if (response.success) {
        setQuestions(response.data.data);
        setPagination({
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.total_pages
        });
      } else {
        setError(response.message || 'Có lỗi khi lấy danh sách câu hỏi');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Lỗi khi lấy danh sách câu hỏi:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy chi tiết câu hỏi theo ID
   * @param {number} id - ID của câu hỏi
   */
  const fetchQuestionById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await questionAPI.getQuestionById(id);
      
      if (response.success) {
        setCurrentQuestion(response.data.data);
      } else {
        setError(response.message || 'Có lỗi khi lấy chi tiết câu hỏi');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Lỗi khi lấy chi tiết câu hỏi:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy câu hỏi ngẫu nhiên theo loại
   * @param {string} type - Loại câu hỏi ('quiz', 'knowledge', 'behavior')
   * @param {string} category - Danh mục câu hỏi
   * @param {string} difficulty - Độ khó ('easy', 'medium', 'hard')
   */
  const getRandomQuestion = useCallback(async (
    type = null,
    category = null,
    difficulty = null
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await questionAPI.getRandomQuestion(
        type,
        usedQuestionIds,
        category,
        difficulty
      );
      
      if (response.success) {
        const question = response.data.data;
        setCurrentQuestion(question);
        
        // Thêm ID của câu hỏi vào danh sách đã sử dụng
        setUsedQuestionIds(prev => [...prev, question.id]);
        
        return question;
      } else {
        setError(response.message || 'Có lỗi khi lấy câu hỏi ngẫu nhiên');
        return null;
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Lỗi khi lấy câu hỏi ngẫu nhiên:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [usedQuestionIds]);

  /**
   * Thêm câu hỏi mới
   * @param {Object} questionData - Dữ liệu câu hỏi mới
   */
  const addQuestion = useCallback(async (questionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await questionAPI.addQuestion(questionData);
      
      if (response.success) {
        return { success: true, data: response.data.data };
      } else {
        setError(response.message || 'Có lỗi khi thêm câu hỏi');
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Lỗi khi thêm câu hỏi:', err);
      return { success: false, message: 'Không thể kết nối đến server' };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cập nhật câu hỏi
   * @param {number} id - ID của câu hỏi
   * @param {Object} questionData - Dữ liệu cập nhật
   */
  const updateQuestion = useCallback(async (id, questionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await questionAPI.updateQuestion(id, questionData);
      
      if (response.success) {
        // Cập nhật câu hỏi trong danh sách nếu có
        setQuestions(prev => prev.map(q => 
          q.id === id ? { ...q, ...questionData } : q
        ));
        
        return { success: true, data: response.data.data };
      } else {
        setError(response.message || 'Có lỗi khi cập nhật câu hỏi');
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Lỗi khi cập nhật câu hỏi:', err);
      return { success: false, message: 'Không thể kết nối đến server' };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Xóa câu hỏi
   * @param {number} id - ID của câu hỏi cần xóa
   */
  const deleteQuestion = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await questionAPI.deleteQuestion(id);
      
      if (response.success) {
        // Xóa câu hỏi khỏi danh sách
        setQuestions(prev => prev.filter(q => q.id !== id));
        
        return { success: true };
      } else {
        setError(response.message || 'Có lỗi khi xóa câu hỏi');
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Lỗi khi xóa câu hỏi:', err);
      return { success: false, message: 'Không thể kết nối đến server' };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset danh sách câu hỏi đã sử dụng
   */
  const resetUsedQuestions = useCallback(() => {
    setUsedQuestionIds([]);
  }, []);

  return {
    questions,
    currentQuestion,
    loading,
    error,
    pagination,
    usedQuestionIds,
    fetchQuestions,
    fetchQuestionById,
    getRandomQuestion,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    resetUsedQuestions
  };
};

export default useQuestionData; 