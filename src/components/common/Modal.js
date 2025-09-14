import React, { useEffect } from 'react';
import Button from './Button';
import './Modal.css';

/**
 * Component Modal - Hiển thị modal dialog
 * @param {Object} props - Props của component
 * @param {string} props.title - Tiêu đề của modal
 * @param {React.ReactNode} props.children - Nội dung của modal
 * @param {Function} props.onClose - Callback khi đóng modal
 * @param {Function} props.onConfirm - Callback khi xác nhận (alias cho onSubmit)
 * @param {Function} props.onSubmit - Callback khi xác nhận
 * @param {Function} props.onCancel - Callback khi hủy
 * @param {string} props.confirmText - Nội dung nút xác nhận (alias cho submitText)
 * @param {string} props.submitText - Nội dung nút xác nhận (mặc định: "Xác nhận")
 * @param {string} props.cancelText - Nội dung nút hủy (mặc định: "Tiếp tục")
 * @param {string} props.submitVariant - Variant của nút xác nhận (mặc định: "primary")
 * @param {string} props.cancelVariant - Variant của nút hủy (mặc định: "secondary")
 * @param {boolean} props.show - Hiển thị modal hay không
 * @param {boolean} props.isOpen - Hiển thị modal hay không (alias cho show)
 * @param {string} props.message - Nội dung message của modal
 */
const Modal = ({ 
  title, 
  children, 
  message,
  onClose, 
  onConfirm,
  onSubmit,
  onCancel,
  confirmText,
  submitText = "Xác nhận",
  cancelText = "Tiếp tục",
  submitVariant = "primary",
  cancelVariant = "secondary",
  show = true,
  isOpen
}) => {
  // Hỗ trợ cả isOpen và show
  const isVisible = isOpen !== undefined ? isOpen : show;
  
  // Hỗ trợ cả onConfirm và onSubmit
  const handleSubmit = onConfirm || onSubmit;
  
  // Hỗ trợ cả confirmText và submitText
  const buttonText = confirmText || submitText;
  
  // Hỗ trợ callback khi đóng/hủy
  const handleCancel = onCancel || onClose;
  
  // Ngăn cuộn trang khi modal hiển thị
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  // Ngăn sự kiện click truyền ra ngoài
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // Nếu không hiển thị, không render gì cả
  if (!isVisible) return null;

  // Xử lý xuống dòng trong message
  const formatMessage = (messageText) => {
    if (!messageText) return null;
    
    // Tách message thành các dòng
    const lines = messageText.split('\n');
    
    return (
      <div className="modal-message">
        {lines.map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={handleModalClick}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="modal-content">
          {message && formatMessage(message)}
          {children}
        </div>
        
                {(handleSubmit || onCancel) && (
          <div className="modal-footer">
            {onCancel && (
              <Button variant={cancelVariant} onClick={handleCancel}>
                {cancelText}
              </Button>
            )}
            {handleSubmit && (
              <Button variant={submitVariant} onClick={handleSubmit}>
                {buttonText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal; 