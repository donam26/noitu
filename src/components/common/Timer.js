import React, { useState, useEffect, useRef } from 'react';
import './Timer.css';

/**
 * Component Timer - Hiển thị đồng hồ đếm ngược
 * @param {Object} props - Props của component
 * @param {number} props.duration - Thời gian đếm ngược (giây)
 * @param {Function} props.onTimeUp - Callback khi hết thời gian
 * @param {Function} props.onTimeUpdate - Callback để cập nhật thời gian còn lại
 * @param {boolean} props.isActive - Trạng thái hoạt động của timer
 */
const Timer = ({ 
  duration = 30, 
  onTimeUp, 
  onTimeUpdate, 
  isActive = true 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);
  const timerRef = useRef(null);
  
  // Khởi tạo timer khi component mount
  useEffect(() => {
    setTimeLeft(duration);
    return () => clearInterval(timerRef.current);
  }, [duration]);
  
  // Xử lý timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          // Nếu thời gian còn dưới 10s, hiển thị cảnh báo
          if (prevTime <= 10) {
            setIsWarning(true);
          }
          
          // Cập nhật thời gian
          const newTime = prevTime - 1;
          
          // Thông báo thời gian còn lại
          if (onTimeUpdate) {
            onTimeUpdate(newTime);
          }
          
          // Kết thúc timer khi hết thời gian
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            if (onTimeUp) {
              onTimeUp();
            }
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isActive, onTimeUp, onTimeUpdate]);
  
  // Tính toán phần trăm thời gian còn lại
  const progressPercentage = (timeLeft / duration) * 100;
  
  return (
    <div className="timer-container">
      <div className="timer-progress">
        <div 
          className={`timer-progress-bar ${isWarning ? 'warning' : ''}`} 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className={`timer-time ${isWarning ? 'warning' : ''}`}>
        {timeLeft} giây
      </div>
    </div>
  );
};

export default Timer; 