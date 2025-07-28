import React, { useState } from 'react';
import Button from '../common/Button';
import { showSuccess, showError } from '../../utils/toast';
import { authAPI } from '../../services/api';
import './LoginForm.css';

/**
 * Component LoginForm - Form đăng nhập Admin
 * @param {Object} props - Props của component
 * @param {Function} props.onLogin - Callback khi đăng nhập thành công
 */
const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    try {
      setLoading(true);
      setError('');

      // Gọi API đăng nhập
      const response = await authAPI.login({
        username,
        password
      });
      
      console.log("Login response:", response);
      
      if (response && response.success) {
        // Hiển thị thông báo thành công
        showSuccess(`Đăng nhập thành công! Xin chào ${username}`);
        
        // Callback đăng nhập thành công
        console.log("Calling onLogin callback with:", true);
        onLogin(true);
      } else {
        // Hiển thị lỗi
        const errorMessage = response?.message || 'Đăng nhập không thành công';
        setError(errorMessage);
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      
      const errorMessage = error?.response?.data?.message || 'Không thể kết nối đến server. Vui lòng thử lại sau.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h2>⚡ Admin Panel</h2>
          <p>Đăng nhập để tiếp tục</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              disabled={loading}
              autoFocus
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
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <div className="login-footer">
          <p>© Game Hub Admin - {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 