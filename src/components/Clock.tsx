import React, { useState, useEffect } from 'react';
import { type Theme } from '../constants';

interface ClockProps {
  theme: Theme;
  showDate?: boolean;
  showSeconds?: boolean;
}

export const Clock: React.FC<ClockProps> = ({ theme, showDate = true, showSeconds = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // 始終使用 1000ms 間隔以確保時間準確性，無論是否顯示秒
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [showSeconds]);

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

  const isLight = theme === 'light';

  // 自定义文字阴影以提高对比度
  // 日间模式（深色文字）：增强白色光晕，防止在复杂背景下看不清
  // 夜间模式（白色文字）：深色阴影 + 模糊
  const customStyle = isLight
    ? { textShadow: '0 0 30px rgba(255,255,255,0.6), 0 0 10px rgba(255,255,255,0.8), 0 0 2px rgba(255,255,255,1)' }
    : { textShadow: '0 8px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)' };

  const textColor = isLight ? 'text-gray-900' : 'text-white';
  const subTextColor = isLight ? 'text-gray-800' : 'text-white/90';

  return (
    <div
      className={`flex flex-col items-center justify-center select-none transition-all duration-500 py-10 ${textColor}`}
      style={customStyle}
    >
      <div className="relative">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extralight tracking-tight leading-none tabular-nums font-mono">
          {formatTime(time)}
        </h1>
      </div>
      {showDate && (
        <p className={`mt-5 text-lg font-medium tracking-[0.4em] uppercase ${subTextColor}`}>
          {formatDate(time)}
        </p>
      )}
    </div>
  );
};