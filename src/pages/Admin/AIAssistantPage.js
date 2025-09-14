import React, { useState, useEffect } from 'react';
import { gameDataAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import './AIAssistant.css';

const AIAssistant = () => {
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIStatus = async () => {
      try {
        const response = await gameDataAPI.checkAIStatus();
        if (response.success) {
          setAiStatus(response.data);
        } else {
          showError('Không thể kiểm tra trạng thái AI');
        }
      } catch (error) {
        showError('Lỗi kết nối server');
      } finally {
        setLoading(false);
      }
    };

    fetchAIStatus();
  }, []);

  return (
    <div className="ai-assistant-manager">
      <div className="header">
        <h2>Quản lý Trợ lý AI</h2>
        <p>Theo dõi trạng thái và cấu hình các dịch vụ AI cho game.</p>
      </div>

      <div className="status-section">
        <h3>Trạng thái Dịch vụ AI</h3>
        {loading ? (
          <p>Đang tải...</p>
        ) : aiStatus ? (
          <div className={`status-card ${aiStatus.available ? 'available' : 'unavailable'}`}>
            <p>Trạng thái: <strong>{aiStatus.available ? 'Sẵn sàng' : 'Không sẵn sàng'}</strong></p>
            {aiStatus.message && <p>Thông điệp: {aiStatus.message}</p>}
          </div>
        ) : (
          <p>Không thể lấy trạng thái AI.</p>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
