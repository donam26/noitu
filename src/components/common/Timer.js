import React, { useState, useEffect } from 'react';
import './Timer.css';

/**
 * Component Timer đếm ngược
 * @param {Object} props - Props của timer
 * @param {number} props.duration - Thời gian giới hạn (giây)
 * @param {Function} props.onTimeUp - Callback khi hết thời gian
 * @param {Function} props.onTimeUpdate - Callback khi thời gian thay đổi
 * @param {boolean} props.isActive - Trạng thái hoạt động của timer
 */
const Timer = ({ duration, onTimeUp, onTimeUpdate, isActive = true }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  // Reset timeLeft khi duration thay đổi
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);
  
  // Thông báo timeLeft ban đầu qua onTimeUpdate
  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(timeLeft);
    }
  }, [timeLeft, onTimeUpdate]);

  useEffect(() => {
    // Nếu không active thì không làm gì
    if (!isActive) return;

    // Nếu hết thời gian thì gọi callback
    if (timeLeft === 0) {
      onTimeUp && onTimeUp();
      return;
    }

    // Tạo interval để đếm ngược
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev <= 1 ? 0 : prev - 1;
        
        if (newTime <= 0) {
          clearInterval(timer);
          onTimeUp && onTimeUp();
        }
        
        return newTime;
      });
    }, 1000);

    // Cleanup interval khi component unmount hoặc isActive/timeLeft thay đổi
    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeUp]);

  const percentage = (timeLeft / duration) * 100;
  const isWarning = timeLeft <= 10;

  return (
    <div className="timer-container">
      <div className="timer-display">
        <span className={`timer-text ${isWarning ? 'warning' : ''}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="timer-bar">
        <div 
          className={`timer-progress ${isWarning ? 'warning' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Timer; 