import React, { useState, useEffect } from 'react';
import { quizAPI, behaviorAPI, knowledgeAPI } from '../../services/api';
import './DashboardPage.css';

/**
 * DashboardPage - Trang tổng quan admin
 */
const DashboardPage = () => {
  const [stats, setStats] = useState({
    quiz: { total: 0, loading: true },
    behavior: { total: 0, loading: true },
    knowledge: { total: 0, loading: true },
    wordchain: { total: 0, loading: true }
  });

  // Lấy thống kê từ API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Lấy số lượng câu hỏi quiz
        const quizResponse = await quizAPI.getQuestions(1, 1);
        if (quizResponse.success) {
          setStats(prev => ({
            ...prev,
            quiz: {
              total: quizResponse.data?.pagination?.total || 0,
              loading: false
            }
          }));
        }

        // Lấy số lượng câu hỏi behavior
        const behaviorResponse = await behaviorAPI.getQuestions(1, 1);
        if (behaviorResponse.success) {
          setStats(prev => ({
            ...prev,
            behavior: {
              total: behaviorResponse.data?.pagination?.total || 0,
              loading: false
            }
          }));
        }

        // Lấy số lượng câu hỏi knowledge
        const knowledgeResponse = await knowledgeAPI.getQuestions(1, 1);
        if (knowledgeResponse.success) {
          setStats(prev => ({
            ...prev,
            knowledge: {
              total: knowledgeResponse.data?.pagination?.total || 0,
              loading: false
            }
          }));
        }

      } catch (error) {
        console.error('Lỗi khi lấy thống kê:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Tổng quan hệ thống</h1>
        <p>Thống kê và quản lý game hub</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon quiz-icon">📝</div>
          <div className="stat-content">
            <h3>Vua Hỏi Ngu</h3>
            <div className="stat-value">
              {stats.quiz.loading ? (
                <span className="loading-indicator">Đang tải...</span>
              ) : (
                <span>{stats.quiz.total} câu hỏi</span>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon behavior-icon">🤝</div>
          <div className="stat-content">
            <h3>Vua Ứng Xử</h3>
            <div className="stat-value">
              {stats.behavior.loading ? (
                <span className="loading-indicator">Đang tải...</span>
              ) : (
                <span>{stats.behavior.total} câu hỏi</span>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon knowledge-icon">🧠</div>
          <div className="stat-content">
            <h3>Vua Kiến Thức</h3>
            <div className="stat-value">
              {stats.knowledge.loading ? (
                <span className="loading-indicator">Đang tải...</span>
              ) : (
                <span>{stats.knowledge.total} câu hỏi</span>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon wordchain-icon">🔄</div>
          <div className="stat-content">
            <h3>Từ vựng nối từ</h3>
            <div className="stat-value">
              {stats.wordchain.loading ? (
                <span className="loading-indicator">Đang tải...</span>
              ) : (
                <span>Đang phát triển</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Trạng thái hệ thống</h2>
        <div className="system-status">
          <div className="status-item">
            <span className="status-label">API Server:</span>
            <span className="status-value online">Hoạt động</span>
          </div>
          <div className="status-item">
            <span className="status-label">Database:</span>
            <span className="status-value online">Kết nối</span>
          </div>
          <div className="status-item">
            <span className="status-label">OpenAI API:</span>
            <span className="status-value online">Sẵn sàng</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Hoạt động gần đây</h2>
        <div className="recent-activities">
          <div className="activity-item">
            <div className="activity-time">Hôm nay</div>
            <div className="activity-content">Thêm mới từ vựng nối từ</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">Hôm qua</div>
            <div className="activity-content">Cập nhật câu hỏi Vua Kiến Thức</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">3 ngày trước</div>
            <div className="activity-content">Thêm mới câu hỏi Vua Ứng Xử</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 