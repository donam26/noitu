import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AdminHeader from '../components/Admin/AdminHeader';
import AdminFooter from '../components/Admin/AdminFooter';
import { quizAPI, behaviorAPI, knowledgeAPI, guessWhoAPI } from '../services/api';
import './AdminLayout.css';

/**
 * AdminLayout - Layout for admin pages with completely separate design from user pages
 * @param {Object} props - Props của component
 * @param {React.ReactNode} props.children - Nội dung của trang
 */
const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [quizCount, setQuizCount] = useState(0);
  const [behaviorCount, setBehaviorCount] = useState(0);
  const [knowledgeCount, setKnowledgeCount] = useState(0);
  const [guessWhoCount, setGuessWhoCount] = useState(0);
  
  // Xác định tab đang active dựa vào đường dẫn hiện tại
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/quiz')) return 'quiz';
    if (path.includes('/admin/behavior')) return 'behavior';
    if (path.includes('/admin/knowledge')) return 'knowledge';
    if (path.includes('/admin/guess-who')) return 'guess-who';
    if (path.includes('/admin/vocabulary')) return 'vocabulary';
    if (path.includes('/admin/ai')) return 'ai';
    return 'dashboard'; // Mặc định là dashboard
  };
  
  const activeTab = getActiveTab();

  // Hàm lấy số lượng câu hỏi từ API
  const loadQuestionCounts = async () => {
    // Nếu đang tải dữ liệu, không gọi API lần nữa
    if (isLoadingCounts) return;
    
    setIsLoadingCounts(true);
    
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
      const [quizResponse, behaviorResponse, knowledgeResponse, guessWhoResponse] = await Promise.allSettled([
        fetchWithTimeout(() => quizAPI.getQuestions(1, 1)),
        fetchWithTimeout(() => behaviorAPI.getQuestions(1, 1)),
        fetchWithTimeout(() => knowledgeAPI.getQuestions(1, 1)),
        fetchWithTimeout(() => guessWhoAPI.getCharacters(1, 1))
      ]);
      
      // Xử lý kết quả cho quiz
      if (quizResponse.status === 'fulfilled' && quizResponse.value.success) {
        const total = quizResponse.value.data?.pagination?.total || 0;
        setQuizCount(total);
      }
      
      // Xử lý kết quả cho behavior
      if (behaviorResponse.status === 'fulfilled' && behaviorResponse.value.success) {
        const total = behaviorResponse.value.data?.pagination?.total || 0;
        setBehaviorCount(total);
      }
      
      // Xử lý kết quả cho knowledge
      if (knowledgeResponse.status === 'fulfilled' && knowledgeResponse.value.success) {
        const total = knowledgeResponse.value.data?.pagination?.total || 0;
        setKnowledgeCount(total);
      }

      // Xử lý kết quả cho guess who
      if (guessWhoResponse.status === 'fulfilled' && guessWhoResponse.value.success) {
        const total = guessWhoResponse.value.pagination?.total || 0;
        setGuessWhoCount(total);
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy số lượng câu hỏi:', error);
    } finally {
      setIsLoadingCounts(false);
    }
  };

  // Load số lượng câu hỏi khi component mount
  useEffect(() => {
    loadQuestionCounts();
  }, []);
  
  // Đăng ký event listener riêng cho các sự kiện cập nhật
  useEffect(() => {
    const handleQuestionsUpdated = () => {
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
    if (activeTab === 'quiz' && quizCount === 0) {
      loadQuestionCounts();
    } else if (activeTab === 'behavior' && behaviorCount === 0) {
      loadQuestionCounts();
    } else if (activeTab === 'knowledge' && knowledgeCount === 0) {
      loadQuestionCounts();
    } else if (activeTab === 'guess-who' && guessWhoCount === 0) {
      loadQuestionCounts();
    }
  }, [activeTab, quizCount, behaviorCount, knowledgeCount, guessWhoCount]);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: '📊',
      path: '/admin/dashboard',
      count: null
    },
    {
      id: 'quiz',
      label: 'Vua Hỏi Ngu',
      icon: '📝',
      path: '/admin/quiz',
      count: quizCount
    },
    {
      id: 'behavior',
      label: 'Vua Ứng Xử',
      icon: '🤝',
      path: '/admin/behavior',
      count: behaviorCount
    },
    {
      id: 'knowledge',
      label: 'Vua Kiến Thức',
      icon: '🧠',
      path: '/admin/knowledge',
      count: knowledgeCount
    },
    {
      id: 'guess-who',
      label: 'Tôi là ai?',
      icon: '👤',
      path: '/admin/guess-who',
      count: guessWhoCount
    },
    {
      id: 'vocabulary',
      label: 'Quản lý từ vựng',
      icon: '📚',
      path: '/admin/vocabulary',
      count: null
    },
    {
      id: 'ai',
      label: 'AI Assistant',
      icon: '🤖',
      path: '/admin/ai',
      count: null
    }
  ];

  return (
    <div className="admin-panel">
      {/* Admin Header */}
      <AdminHeader />

      <div className="admin-container">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <h2>Admin Menu</h2>
          </div>

          <nav className="sidebar-nav">
            {tabs.map(tab => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
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
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <div className="admin-content">
            {children}
          </div>
        </main>
      </div>

      {/* Admin Footer */}
      <AdminFooter />
    </div>
  );
};

export default AdminLayout; 