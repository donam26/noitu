import React from 'react';
import KnowledgeQuizManager from '../../components/Admin/KnowledgeQuizManager';
import './KnowledgeQuizAdminPage.css';

/**
 * KnowledgeQuizAdminPage - Trang quản lý câu hỏi Vua Kiến Thức
 */
const KnowledgeQuizAdminPage = () => {
  return (
    <div className="knowledge-quiz-admin-page">
      <KnowledgeQuizManager />
    </div>
  );
};

export default KnowledgeQuizAdminPage; 