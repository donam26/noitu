import React, { useState, useEffect } from 'react';
import './Timer.css';

/**
 * Component Timer đếm ngược
 * @param {Object} props - Props của timer
 * @param {number} props.timeLimit - Thời gian giới hạn (giây)
 * @param {Function} props.onTimeUp - Callback khi hết thời gian
 * @param {boolean} props.isActive - Trạng thái hoạt động của timer
 */
const Timer = ({ timeLimit, onTimeUp, isActive = true }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft === 0) {
      onTimeUp && onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeUp && onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeUp]);

  const percentage = (timeLeft / timeLimit) * 100;
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