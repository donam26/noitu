import React, { useState, useEffect } from 'react';
import QuizManager from './QuizManager';
import BehaviorQuizManager from './BehaviorQuizManager';
import KnowledgeQuizManager from './KnowledgeQuizManager';
import AIAssistant from './AIAssistant';
import Button from '../common/Button';
import { showSuccess, showError } from '../../utils/toast';
import './AdminPanel.css';

/**
 * Component AdminPanel - Trang quản trị chính
 * @param {Object} props - Props của component
 * @param {Function} props.onLogout - Callback khi đăng xuất
 */
const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('quiz');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    onLogout();
  };

  // Callback để thêm câu hỏi từ AI vào hệ thống
  const handleAddQuestions = async (newQuestions, questionType = 'quiz') => {
    console.log(`🤖 AI thêm ${newQuestions.length} câu hỏi ${questionType} mới`);
    
    try {
      let apiEndpoint;
      let eventName;
      let fileName;
      
      switch (questionType) {
        case 'behavior':
          apiEndpoint = 'update-behavior-questions';
          eventName = 'behaviorQuestionsUpdated';
          fileName = 'behaviorQuestions.js';
          break;
        case 'knowledge':
          apiEndpoint = 'update-knowledge-questions';
          eventName = 'knowledgeQuestionsUpdated';
          fileName = 'knowledgeQuestions.js';
          break;
        default:
          apiEndpoint = 'update-quiz-questions';
          eventName = 'questionsUpdated';
          fileName = 'quizQuestions.js';
      }
      
      // Gọi API để cập nhật file
      const response = await fetch(`http://localhost:3001/api/${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestions)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Đã cập nhật file ${fileName} thành công`);
        console.log('📄', result.output);
        
        // Emit event để manager tương ứng reload
        window.dispatchEvent(new CustomEvent(eventName));
        console.log(`📡 Đã emit event ${eventName}`);
        
        // Thông báo thành công
        showSuccess(`✅ Đã thêm ${newQuestions.length} câu hỏi vào file ${fileName}!`);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Lỗi khi cập nhật file');
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật file:', error);
      showError(`❌ Lỗi: ${error.message}\n\nVui lòng kiểm tra API server có đang chạy không.`);
      return false;
    }
  };

  // Import data để hiển thị số lượng
  const [quizCount, setQuizCount] = useState(0);
  const [behaviorCount, setBehaviorCount] = useState(0);
  const [knowledgeCount, setKnowledgeCount] = useState(0);

  // Load counts
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [quiz, behavior, knowledge] = await Promise.all([
          import('../../data/quizQuestions'),
          import('../../data/behaviorQuestions'), 
          import('../../data/knowledgeQuestions')
        ]);
        setQuizCount(quiz.quizQuestions?.length || 0);
        setBehaviorCount(behavior.behaviorQuestions?.length || 0);
        setKnowledgeCount(knowledge.knowledgeQuestions?.length || 0);
      } catch (error) {
        console.log('Không thể load counts:', error);
      }
    };
    loadCounts();
    
    // Chỉ load một lần khi component mount
  }, []); // Empty dependency array

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
                  <span className="nav-count">{tab.count} câu hỏi</span>
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