/**
 * Tiện ích quản lý authentication
 */

// Lấy token từ localStorage
export const getToken = () => {
  return localStorage.getItem('adminToken');
};

// Lấy headers cho API request
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Kiểm tra trạng thái đăng nhập
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Lưu token và thông tin đăng nhập
export const setAuth = (token, userData) => {
  localStorage.setItem('adminToken', token);
  if (userData) {
    localStorage.setItem('adminData', JSON.stringify(userData));
  }
};

// Xóa thông tin đăng nhập
export const clearAuth = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
};

// Lấy thông tin người dùng đã đăng nhập
export const getUser = () => {
  const userDataStr = localStorage.getItem('adminData');
  if (!userDataStr) return null;
  
  try {
    return JSON.parse(userDataStr);
  } catch (error) {
    console.error('Lỗi khi parse thông tin người dùng:', error);
    return null;
  }
}; 