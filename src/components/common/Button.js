import React from 'react';
import './Button.css';

/**
 * Component Button tái sử dụng
 * @param {Object} props - Props của button
 * @param {string} props.children - Nội dung button
 * @param {Function} props.onClick - Hàm xử lý click
 * @param {string} props.variant - Kiểu button (primary, secondary)
 * @param {boolean} props.disabled - Trạng thái disable
 * @param {string} props.className - Class CSS bổ sung
 */
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  className = '',
  ...props 
}) => {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 