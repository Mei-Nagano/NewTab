import React, { useState, useEffect } from 'react';
import { getCommonStyles, copyToClipboard } from './shared';

interface ToolProps {
    theme: 'light' | 'dark';
}

export const TimestampTool: React.FC<ToolProps> = ({ theme }) => {
    const [currentTimestamp, setCurrentTimestamp] = useState(() => Math.floor(Date.now() / 1000));
    const [tsInput, setTsInput] = useState('');
    const [tsOutput, setTsOutput] = useState('');

    const styles = getCommonStyles(theme);

    // Update current timestamp
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTimestamp(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTimestamp = (ts: number) => {
        try {
            const date = new Date(ts * 1000);
            return date.toLocaleString();
        } catch {
            return '无效的时间戳';
        }
    };

    const handleTsConvert = () => {
        const ts = parseInt(tsInput);
        if (isNaN(ts)) {
            setTsOutput('请输入有效的时间戳');
            return;
        }
        setTsOutput(formatTimestamp(ts));
    };

    const handleDateToTs = () => {
        try {
            const date = new Date(tsInput);
            if (isNaN(date.getTime())) {
                setTsOutput('请输入有效的日期字符串');
                return;
            }
            setTsOutput(Math.floor(date.getTime() / 1000).toString());
        } catch {
            setTsOutput('转换失败');
        }
    };

    return (
        <section>
            <div className={styles.sectionTitleClass}>
                <div className={`${styles.sectionDotClass} bg-orange-500`} />
                <h4 className={styles.sectionHeadingClass}>时间戳工具</h4>
            </div>
            <div className={styles.cardClass}>
                <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <div className="space-y-1">
                        <span className="text-xs text-gray-500 font-medium">当前 Unix 时间戳 (秒)</span>
                        <div className="text-2xl font-mono font-bold text-orange-500 tracking-wider">
                            {currentTimestamp}
                        </div>
                    </div>
                    <button
                        onClick={() => copyToClipboard(currentTimestamp.toString())}
                        className={styles.buttonClass}
                    >
                        复制
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 ml-1">转换工具</label>
                        <input
                            type="text"
                            value={tsInput}
                            onChange={(e) => setTsInput(e.target.value)}
                            className={styles.textareaClass}
                            placeholder="输入时间戳或日期字符串..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 ml-1">结果</label>
                        <div className="relative">
                            <input
                                readOnly
                                value={tsOutput}
                                className={`${styles.textareaClass} bg-transparent`}
                                placeholder="转换结果..."
                            />
                            {tsOutput && (
                                <button
                                    onClick={() => copyToClipboard(tsOutput)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-400"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={handleTsConvert} className={styles.primaryButtonClass}>
                        时间戳 转 日期
                    </button>
                    <button onClick={handleDateToTs} className={styles.buttonClass}>
                        日期 转 时间戳
                    </button>
                </div>
            </div>
        </section>
    );
};
