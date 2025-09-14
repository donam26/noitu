import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  // Dữ liệu giả lập, sẽ được thay thế bằng API call sau
  const systemStatus = {
    apiServer: 'Hoạt động',
    database: 'Kết nối',
    openAI: 'Sẵn sàng',
  };

  const recentActivities = [
    { id: 1, time: 'Hôm nay', action: 'Thêm mới từ vựng nối từ' },
    { id: 2, time: 'Hôm qua', action: 'Cập nhật câu hỏi Vua Kiến Thức' },
    { id: 3, time: '3 ngày trước', action: 'Thêm mới câu hỏi Vua Ứng Xử' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tổng quan hệ thống</h1>
        <p>Thống kê và quản lý game hub</p>
      </div>

      <div className="dashboard-grid">
        {/* System Status Card */}
        <div className="card system-status-card">
          <h2>Trạng thái hệ thống</h2>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">API Server:</span>
              <span className={`status-badge status-ok`}>{systemStatus.apiServer}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Database:</span>
              <span className={`status-badge status-ok`}>{systemStatus.database}</span>
            </div>
            <div className="status-item">
              <span className="status-label">OpenAI API:</span>
              <span className={`status-badge status-ok`}>{systemStatus.openAI}</span>
            </div>
          </div>
        </div>

        {/* Recent Activities Card */}
        <div className="card recent-activities-card">
          <h2>Hoạt động gần đây</h2>
          <ul className="activity-list">
            {recentActivities.map(activity => (
              <li key={activity.id} className="activity-item">
                <span className="activity-time">{activity.time}</span>
                <span className="activity-action">{activity.action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

