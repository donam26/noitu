import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import HomePage from './pages/HomePage';
import WordChainPage from './pages/WordChainPage';
import WordScramblePage from './pages/WordScramblePage';
import QuizPage from './pages/QuizPage';
import WordlePage from './pages/WordlePage';
import AdminPage from './pages/AdminPage';
import './App.css';

/**
 * Component App chính - Điều khiển routing của ứng dụng
 */
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Trang chủ */}
          <Route 
            path="/" 
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            } 
          />
          
          {/* Trang game nối từ - full screen không có header/footer */}
          <Route 
            path="/word-chain" 
            element={
              <MainLayout showHeader={false} showFooter={false}>
                <WordChainPage />
              </MainLayout>
            } 
          />
          
          {/* Trang game sắp xếp từ - full screen không có header/footer */}
          <Route 
            path="/word-scramble" 
            element={
              <MainLayout showHeader={false} showFooter={false}>
                <WordScramblePage />
              </MainLayout>
            } 
          />
          
          {/* Trang game hỏi ngu - full screen không có header/footer */}
          <Route 
            path="/quiz" 
            element={
              <MainLayout showHeader={false} showFooter={false}>
                <QuizPage />
              </MainLayout>
            } 
          />
          
          {/* Trang game Wordle Tiếng Việt - full screen không có header/footer */}
          <Route 
            path="/wordle" 
            element={
              <MainLayout showHeader={false} showFooter={false}>
                <WordlePage />
              </MainLayout>
            } 
          />
          
          {/* Trang admin - không public, không có header/footer */}
          <Route 
            path="/admin" 
            element={<AdminPage />}
          />
          
          {/* Route 404 - có thể thêm sau */}
          <Route 
            path="*" 
            element={
              <MainLayout>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '100px 20px',
                  color: '#666'
                }}>
                  <h2>404 - Trang không tồn tại</h2>
                  <p>Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
                </div>
              </MainLayout>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
