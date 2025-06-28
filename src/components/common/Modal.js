import React from 'react';
import Button from './Button';
import './Modal.css';

/**
 * Component Modal để hiển thị popup
 * @param {Object} props - Props của modal
 * @param {boolean} props.isOpen - Trạng thái mở/đóng modal
 * @param {string} props.title - Tiêu đề modal
 * @param {string} props.message - Nội dung modal
 * @param {Function} props.onClose - Callback khi đóng modal
 * @param {Function} props.onConfirm - Callback khi xác nhận
 * @param {string} props.confirmText - Text nút xác nhận
 * @param {string} props.cancelText - Text nút hủy
 */
const Modal = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Hủy'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          {onConfirm && (
            <Button 
              variant="primary" 
              onClick={onConfirm}
              className="modal-btn"
            >
              {confirmText}
            </Button>
          )}
          <Button 
            variant="secondary" 
            onClick={onClose}
            className="modal-btn"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal; 