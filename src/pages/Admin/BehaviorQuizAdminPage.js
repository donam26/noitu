import React from 'react';
import BehaviorQuizManager from '../../components/Admin/BehaviorQuizManager';
import './BehaviorQuizAdminPage.css';

/**
 * BehaviorQuizAdminPage - Trang quản lý câu hỏi Vua Ứng Xử
 */
const BehaviorQuizAdminPage = () => {
  return (
    <div className="behavior-quiz-admin-page">
      <BehaviorQuizManager />
    </div>
  );
};

export default BehaviorQuizAdminPage;