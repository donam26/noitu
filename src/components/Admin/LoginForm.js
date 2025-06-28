import React, { useState } from 'react';
import Button from '../common/Button';
import './LoginForm.css';

/**
 * Component LoginForm - Form đăng nhập admin
 * @param {Object} props - Props của component
 * @param {Function} props.onLogin - Callback khi đăng nhập thành công
 */
const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple authentication (in real app, this should be server-side)
    if (username === 'admin' && password === 'admin') {
      // Store auth token in localStorage
      localStorage.setItem('adminToken', 'authenticated');
      onLogin(true);
    } else {
      setError('Tài khoản hoặc mật khẩu không đúng');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h2>🔐 Admin Panel</h2>
          <p>Đăng nhập để truy cập trang quản trị</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tài khoản</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tài khoản"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? '🔄 Đang xử lý...' : '🚀 Đăng nhập'}
          </Button>
        </form>

        <div className="login-footer">
          <p>💡 <strong>Demo:</strong> admin / admin</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 