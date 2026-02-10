import React, { useState } from 'react';
import { getCommonStyles, copyToClipboard } from './shared';

interface ToolProps {
    theme: 'light' | 'dark';
}

export const Base64Tool: React.FC<ToolProps> = ({ theme }) => {
    const [base64Input, setBase64Input] = useState('');
    const [base64Output, setBase64Output] = useState('');
    const [base64Error, setBase64Error] = useState('');

    const styles = getCommonStyles(theme);

    const handleBase64Encode = () => {
        try {
            setBase64Output(btoa(unescape(encodeURIComponent(base64Input))));
            setBase64Error('');
        } catch {
            setBase64Error('编码失败：包含无效字符');
        }
    };

    const handleBase64Decode = () => {
        try {
            setBase64Output(decodeURIComponent(escape(atob(base64Input))));
            setBase64Error('');
        } catch {
            setBase64Error('解码失败：无效的 Base64 字符串');
        }
    };

    return (
        <section>
            <div className={styles.sectionTitleClass}>
                <div className={`${styles.sectionDotClass} bg-blue-500`} />
                <h4 className={styles.sectionHeadingClass}>Base64 转换</h4>
            </div>
            <div className={styles.cardClass}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 ml-1">输入</label>
                        <textarea
                            value={base64Input}
                            onChange={(e) => setBase64Input(e.target.value)}
                            className={`${styles.textareaClass} h-40`}
                            placeholder="输入要编码或解码的内容..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 ml-1">输出</label>
                        <textarea
                            readOnly
                            value={base64Output}
                            className={`${styles.textareaClass} h-40 bg-transparent`}
                            placeholder="转换结果将显示在这里..."
                        />
                    </div>
                </div>
                {base64Error && <p className="text-red-500 text-xs mt-2 ml-1">{base64Error}</p>}
                <div className="flex gap-2 mt-4">
                    <button onClick={handleBase64Encode} className={styles.primaryButtonClass}>
                        Base64 编码
                    </button>
                    <button onClick={handleBase64Decode} className={styles.buttonClass}>
                        Base64 解码
                    </button>
                    {base64Output && (
                        <button onClick={() => copyToClipboard(base64Output)} className={styles.buttonClass}>
                            复制结果
                        </button>
                    )}
                    <button onClick={() => { setBase64Input(''); setBase64Output(''); setBase64Error(''); }} className={styles.buttonClass}>
                        清空
                    </button>
                </div>
            </div>
        </section>
    );
};
