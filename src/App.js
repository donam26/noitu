import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/HomePage';
import WordChainPage from './pages/WordChainPage';
import WordScramblePage from './pages/WordScramblePage';
import QuizPage from './pages/QuizPage';
import BehaviorQuizPage from './pages/BehaviorQuizPage';
import KnowledgeQuizPage from './pages/KnowledgeQuizPage';
import UniverseAnswerPage from './pages/UniverseAnswerPage';
import GuessWhoPage from './pages/GuessWhoPage';
import WordlePage from './pages/WordlePage';
import AdminPage from './pages/Admin/AdminPage';
import './App.css';

/**
 * Component App chính - Điều khiển routing của ứng dụng
 */
function App() {
  return (
    <Router>
      <div className="App">
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        <Routes>
          {/* Trang chủ */}
          <Route 
            path="/" 
            element={
              <UserLayout layoutType="home">
                <HomePage />
              </UserLayout>
            } 
          />
          
          {/* Trang game nối từ - full screen không có header/footer */}
          <Route 
            path="/word-chain" 
            element={
              <UserLayout showHeader={false} showFooter={false} fullscreen={true} layoutType="game">
                <WordChainPage />
              </UserLayout>
            } 
          />
          
          {/* Trang game sắp xếp từ - full screen không có header/footer */}
          <Route 
            path="/word-scramble" 
            element={
              <UserLayout showHeader={false} showFooter={false} fullscreen={true} layoutType="game">
                <WordScramblePage />
              </UserLayout>
            } 
          />
          
          {/* Trang game hỏi ngu - full screen không có header/footer */}
          <Route 
            path="/quiz" 
            element={
              <UserLayout showHeader={false} showFooter={false} fullscreen={true} layoutType="game">
                <QuizPage />
              </UserLayout>
            } 
          />
          
          {/* Trang game Vua ứng xử - full screen không có header/footer */}
          <Route 
            path="/behavior-quiz" 
            element={
              <UserLayout showHeader={false} showFooter={false} fullscreen={true} layoutType="game">
                <BehaviorQuizPage />
              </UserLayout>
            } 
          />
          
          {/* Trang game Vua kiến thức - full screen không có header/footer */}
          <Route 
            path="/knowledge-quiz" 
            element={
              <UserLayout showHeader={false} showFooter={false} fullscreen={true} layoutType="game">
                <KnowledgeQuizPage />
              </UserLayout>
            } 
          />
          
          {/* Trang game Câu trả lời từ vũ trụ - full screen không có header/footer */}
          <Route 
            path="/universe-answer" 
            element={
              <UserLayout showHeader={false} showFooter={false} fullscreen={true} layoutType="game">
                <UniverseAnswerPage />
              </UserLayout>
            } 
          />
          
          {/* Trang game Tôi là ai - full screen không có header/footer */}
          <Route 
            path="/guess-who" 
            element={
              <UserLayout showHeader={false} showFooter={false} fullscreen={true} layoutType="game">
                <GuessWhoPage />
              </UserLayout>
            } 
          />
          
          {/* Trang game Wordle Tiếng Việt - full screen không có header/footer */}
          <Route 
            path="/wordle" 
            element={
              <UserLayout showHeader={false} showFooter={false} fullscreen={true} layoutType="game">
                <WordlePage />
              </UserLayout>
            } 
          />
          
          {/* Trang admin - không public, không có header/footer */}
          <Route path="/admin/*" element={<AdminPage />} />
          
          {/* Route 404 - có thể thêm sau */}
          <Route 
            path="*" 
            element={
              <UserLayout layoutType="default">
                <div style={{ 
                  textAlign: 'center', 
                  padding: '100px 20px',
                  color: '#666'
                }}>
                  <h2>404 - Trang không tồn tại</h2>
                  <p>Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
                </div>
              </UserLayout>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
