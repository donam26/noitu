import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Hiển thị thông báo thành công
 * @param {string} message - Nội dung thông báo
 */
export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
};

/**
 * Hiển thị thông báo lỗi
 * @param {string} message - Nội dung thông báo
 */
export const showError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
};

/**
 * Hiển thị thông báo cảnh báo
 * @param {string} message - Nội dung thông báo
 */
export const showWarning = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
};

/**
 * Hiển thị thông báo thông tin
 * @param {string} message - Nội dung thông báo
 */
export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  });
};

/**
 * Hiển thị thông báo xác nhận
 * @param {string} message - Nội dung thông báo
 * @param {Function} onConfirm - Callback khi xác nhận
 * @param {Function} onCancel - Callback khi hủy
 */
export const showConfirm = (message, onConfirm, onCancel) => {
  const toastId = toast.info(
    <div>
      <p>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <button
          onClick={() => {
            toast.dismiss(toastId);
            if (onCancel) onCancel();
          }}
          style={{
            padding: '5px 10px',
            background: '#f1f1f1',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Hủy
        </button>
        <button
          onClick={() => {
            toast.dismiss(toastId);
            if (onConfirm) onConfirm();
          }}
          style={{
            padding: '5px 10px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Xác nhận
        </button>
      </div>
    </div>,
    {
      position: "top-center",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
      closeButton: false
    }
  );
}; 