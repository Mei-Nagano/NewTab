import React, { useState } from 'react';
import { getCommonStyles, copyToClipboard } from './shared';

interface ToolProps {
    theme: 'light' | 'dark';
}

export const JsonTool: React.FC<ToolProps> = ({ theme }) => {
    const [jsonInput, setJsonInput] = useState('');
    const [jsonOutput, setJsonOutput] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [jsonFormatMode, setJsonFormatMode] = useState<'pretty' | 'minified'>('pretty');

    const styles = getCommonStyles(theme);
    const labelClass = `text-xs font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-500'}`;
    const toggleIdleClass = theme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-500 hover:text-gray-300';

    const handleJsonFormat = () => {
        try {
            const obj = JSON.parse(jsonInput);
            if (jsonFormatMode === 'pretty') {
                setJsonOutput(JSON.stringify(obj, null, 4));
            } else {
                setJsonOutput(JSON.stringify(obj));
            }
            setJsonError('');
        } catch (e: unknown) {
            setJsonError(`格式化失败：${e instanceof Error ? e.message : String(e)}`);
            setJsonOutput('');
        }
    };

    return (
        <section>
            <div className={styles.sectionTitleClass}>
                <div className={`${styles.sectionDotClass} bg-emerald-500`} />
                <h4 className={styles.sectionHeadingClass}>JSON 格式化</h4>
            </div>
            <div className={styles.cardClass}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className={labelClass}>JSON 内容</label>
                            <div className={`flex p-0.5 rounded-lg border transition-all ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/5'}`}>
                                <button 
                                    onClick={() => setJsonFormatMode('pretty')}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${jsonFormatMode === 'pretty' 
                                        ? (theme === 'light' ? 'bg-white text-blue-600 shadow-sm' : 'bg-white/10 text-blue-400') 
                                        : toggleIdleClass}`}
                                >
                                    美化
                                </button>
                                <button 
                                    onClick={() => setJsonFormatMode('minified')}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${jsonFormatMode === 'minified' 
                                        ? (theme === 'light' ? 'bg-white text-blue-600 shadow-sm' : 'bg-white/10 text-blue-400') 
                                        : toggleIdleClass}`}
                                >
                                    最简
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className={`${styles.textareaClass} h-32`}
                            placeholder="在此粘贴 JSON 字符串进行格式化..."
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className={labelClass}>格式化结果</label>
                        </div>
                        <textarea
                            readOnly
                            value={jsonOutput}
                            className={`${styles.textareaClass} h-64 bg-transparent`}
                            placeholder="格式化后的内容将显示在这里..."
                        />
                    </div>
                </div>
                {jsonError && <p className="text-red-500 text-xs mt-2 ml-1">{jsonError}</p>}
                <div className="flex gap-2 mt-4">
                    <button onClick={handleJsonFormat} className={styles.primaryButtonClass}>
                        执行格式化
                    </button>
                    {jsonOutput && (
                        <button onClick={() => copyToClipboard(jsonOutput)} className={styles.buttonClass}>
                            复制结果
                        </button>
                    )}
                    <button onClick={() => { setJsonInput(''); setJsonOutput(''); setJsonError(''); }} className={styles.buttonClass}>
                        清空
                    </button>
                </div>
            </div>
        </section>
    );
};
