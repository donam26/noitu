import React, { useState, useEffect } from 'react';
import QuizManager from './QuizManager';
import BehaviorQuizManager from './BehaviorQuizManager';
import KnowledgeQuizManager from './KnowledgeQuizManager';
import AIAssistant from './AIAssistant';
import Button from '../common/Button';
import { showSuccess, showError } from '../../utils/toast';
import './AdminPanel.css';
import { quizAPI, behaviorAPI, knowledgeAPI, questionAPI, authAPI } from '../../services/api';

/**
 * Component AdminPanel - Trang quản trị chính
 * @param {Object} props - Props của component
 * @param {Function} props.onLogout - Callback khi đăng xuất
 */
const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('quiz');
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  
  // State lưu số lượng câu hỏi
  const [quizCount, setQuizCount] = useState(0);
  const [behaviorCount, setBehaviorCount] = useState(0);
  const [knowledgeCount, setKnowledgeCount] = useState(0);

  const handleLogout = () => {
    authAPI.logout();
    onLogout();
  };

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

        // Cập nhật lại số lượng câu hỏi sau khi thêm thành công
        setTimeout(() => loadQuestionCounts(), 1000);
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

  // Hàm lấy số lượng câu hỏi từ API
  const loadQuestionCounts = async () => {
    // Nếu đang tải dữ liệu, không gọi API lần nữa
    if (isLoadingCounts) return;
    
    setIsLoadingCounts(true);
    console.log('🔄 Đang tải số lượng câu hỏi từ API...');
    
    try {
      // Gọi API với timeout để tránh treo
      const fetchWithTimeout = async (apiCall) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await apiCall();
          clearTimeout(timeoutId);
          return response;
        } catch (err) {
          console.error(`🛑 Lỗi khi gọi API:`, err);
          return { success: false, error: err.message };
        }
      };
      
      // Gọi API để lấy tổng số lượng
      const [quizResponse, behaviorResponse, knowledgeResponse] = await Promise.allSettled([
        fetchWithTimeout(() => quizAPI.getQuestions(1, 1)),
        fetchWithTimeout(() => behaviorAPI.getQuestions(1, 1)),
        fetchWithTimeout(() => knowledgeAPI.getQuestions(1, 1))
      ]);
      
      // Xử lý kết quả cho quiz
      if (quizResponse.status === 'fulfilled' && quizResponse.value.success) {
        const total = quizResponse.value.data?.pagination?.total || 0;
        console.log(`📊 Số câu hỏi Quiz: ${total}`);
        setQuizCount(total);
      }
      
      // Xử lý kết quả cho behavior
      if (behaviorResponse.status === 'fulfilled' && behaviorResponse.value.success) {
        const total = behaviorResponse.value.data?.pagination?.total || 0;
        console.log(`📊 Số câu hỏi Behavior: ${total}`);
        setBehaviorCount(total);
      }
      
      // Xử lý kết quả cho knowledge
      if (knowledgeResponse.status === 'fulfilled' && knowledgeResponse.value.success) {
        const total = knowledgeResponse.value.data?.pagination?.total || 0;
        console.log(`📊 Số câu hỏi Knowledge: ${total}`);
        setKnowledgeCount(total);
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy số lượng câu hỏi:', error);
    } finally {
      setIsLoadingCounts(false);
    }
  };

  // Load số lượng câu hỏi khi component mount
  useEffect(() => {
    // Gọi API để lấy số lượng câu hỏi khi component mount
    loadQuestionCounts();
    
    // Không thêm các event listeners vào đây để tránh gọi API quá nhiều lần
  }, []);
  
  // Đăng ký event listener riêng cho các sự kiện cập nhật
  useEffect(() => {
    const handleQuestionsUpdated = () => {
      console.log('📣 Đã nhận sự kiện cập nhật câu hỏi');
      // Đặt timeout để đảm bảo dữ liệu đã được cập nhật trên server
      setTimeout(() => loadQuestionCounts(), 500);
    };
    
    // Đăng ký lắng nghe sự kiện
    window.addEventListener('questionsUpdated', handleQuestionsUpdated);
    window.addEventListener('behaviorQuestionsUpdated', handleQuestionsUpdated);
    window.addEventListener('knowledgeQuestionsUpdated', handleQuestionsUpdated);
    
    // Cleanup
    return () => {
      window.removeEventListener('questionsUpdated', handleQuestionsUpdated);
      window.removeEventListener('behaviorQuestionsUpdated', handleQuestionsUpdated);
      window.removeEventListener('knowledgeQuestionsUpdated', handleQuestionsUpdated);
    };
  }, []);
  
  // Theo dõi sự thay đổi của tab để cập nhật số lượng nếu cần
  useEffect(() => {
    // Chỉ tải lại số lượng khi chuyển tab và chưa có dữ liệu
    if (activeTab === 'quiz' && quizCount === 0) {
      loadQuestionCounts();
    } else if (activeTab === 'behavior' && behaviorCount === 0) {
      loadQuestionCounts();
    } else if (activeTab === 'knowledge' && knowledgeCount === 0) {
      loadQuestionCounts();
    }
  }, [activeTab, quizCount, behaviorCount, knowledgeCount]);

  const tabs = [
    {
      id: 'quiz',
      label: '📝 Vua Hỏi Ngu',
      icon: '📝',
      component: QuizManager,
      count: quizCount
    },
    {
      id: 'behavior',
      label: '🤝 Vua Ứng Xử',
      icon: '🤝',
      component: BehaviorQuizManager,
      count: behaviorCount
    },
    {
      id: 'knowledge',
      label: '🧠 Vua Kiến Thức',
      icon: '🧠',
      component: KnowledgeQuizManager,
      count: knowledgeCount
    },
    {
      id: 'ai',
      label: '🤖 AI Assistant',
      icon: '🤖', 
      component: AIAssistant,
      count: null
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h1>⚡ Admin Panel</h1>
          <p>Game Hub</p>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <div className="nav-content">
                <span className="nav-label">{tab.label}</span>
                {tab.count !== null && (
                  <span className="nav-count">
                    {isLoadingCounts ? '...' : `${tab.count} câu hỏi`}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-user">
            <span className="user-info">👤 Admin</span>
          </div>
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="logout-btn"
          >
            🚪 Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="main-content">
          {ActiveComponent && activeTab === 'ai' ? (
            <ActiveComponent onAddQuestions={handleAddQuestions} />
          ) : (
            ActiveComponent && <ActiveComponent />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel; 