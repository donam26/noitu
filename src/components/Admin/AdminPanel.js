import React, { useState } from 'react';
import QuizManager from './QuizManager';
import AIAssistant from './AIAssistant';
import Button from '../common/Button';
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
  const handleAddQuestions = async (newQuestions) => {
    console.log(`🤖 AI thêm ${newQuestions.length} câu hỏi mới`);
    
    try {
      // Gọi API để cập nhật file quizQuestions.js
      const response = await fetch('http://localhost:3001/api/update-quiz-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestions)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Đã cập nhật file quizQuestions.js thành công');
        console.log('📄', result.output);
        
        // Emit event để QuizManager reload
        window.dispatchEvent(new CustomEvent('questionsUpdated'));
        console.log('📡 Đã emit event questionsUpdated');
        
        // Thông báo thành công
        alert(`✅ Đã thêm ${newQuestions.length} câu hỏi vào file quizQuestions.js!`);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Lỗi khi cập nhật file');
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật file:', error);
      alert(`❌ Lỗi: ${error.message}\n\nVui lòng kiểm tra API server có đang chạy không.`);
      return false;
    }
  };

  const tabs = [
    {
      id: 'quiz',
      label: '📝 Quản lý Câu hỏi',
      icon: '📝',
      component: QuizManager
    },
    {
      id: 'ai',
      label: '🤖 AI Assistant',
      icon: '🤖', 
      component: AIAssistant
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
              <span className="nav-label">{tab.label}</span>
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