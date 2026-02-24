import React, { useState, useEffect } from 'react';

interface ClockProps {
  showTime?: boolean;
  showDate?: boolean;
  showSeconds?: boolean;
}

export const Clock: React.FC<ClockProps> = ({ showTime = true, showDate = true, showSeconds = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (!showTime && !showDate) return;
    // 始終使用 1000ms 間隔以確保時間準確性，無論是否顯示秒
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [showSeconds, showTime, showDate]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // 统一采用一样的字体样式：白色文字 + 深色阴影
  const customStyle = { textShadow: '0 8px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)' };

  const textColor = 'text-white';
  const subTextColor = 'text-white/90';

  return (
    <div
      className={`flex flex-col items-center justify-center select-none transition-all duration-500 py-10 ${textColor}`}
      style={customStyle}
    >
      {showTime && (
        <div className="relative">
          <h1 className="text-8xl font-extralight tracking-tight leading-none tabular-nums font-mono">
            {formatTime(time)}
          </h1>
        </div>
      )}
      {showDate && (
        <p className={`mt-5 text-lg font-medium tracking-[0.4em] uppercase ${subTextColor}`}>
          {formatDate(time)}
        </p>
      )}
    </div>
  );
};
