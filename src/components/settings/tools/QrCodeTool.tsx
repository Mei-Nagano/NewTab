import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import jsQR from 'jsqr';
import { QrCode, Upload, X, Download } from 'lucide-react';
import { getCommonStyles } from './shared';

interface ToolProps {
    theme: 'light' | 'dark';
}

export const QrCodeTool: React.FC<ToolProps> = ({ theme }) => {
    const [qrCodeInput, setQrCodeInput] = useState('');
    const [qrError, setQrError] = useState('');

    const styles = getCommonStyles(theme);

    const handleDownloadQr = () => {
        const canvas = document.querySelector('#qr-code-canvas') as HTMLCanvasElement;
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = 'qrcode.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const handleUploadQr = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    setQrCodeInput(code.data);
                    setQrError('');
                } else {
                    setQrError('无法识别二维码，请确保图片清晰且包含有效的二维码');
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
        // Reset input value to allow selecting the same file again
        e.target.value = '';
    };

    return (
        <section>
            <div className={styles.sectionTitleClass}>
                <div className={`${styles.sectionDotClass} bg-purple-500`} />
                <h4 className={styles.sectionHeadingClass}>二维码生成</h4>
            </div>
            <div className={styles.cardClass}>
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="space-y-4 flex-1 w-full">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-medium text-gray-500">输入内容</label>
                                    <div className="flex gap-2">
                                        <label className={`cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-white/10 hover:bg-white/20 text-gray-300'}`}>
                                            <Upload size={12} />
                                            识别二维码
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={handleUploadQr}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <textarea
                                    value={qrCodeInput}
                                    onChange={(e) => setQrCodeInput(e.target.value)}
                                    className={`${styles.textareaClass} h-32`}
                                    placeholder="输入网址或文本..."
                                />
                            </div>
                            {qrError && (
                                <p className="text-red-500 text-xs ml-1 flex items-center gap-1">
                                    <X size={12} /> {qrError}
                                </p>
                            )}
                            <div className="text-xs text-gray-500 ml-1">
                                支持文本、网址、邮箱等格式。
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl md:w-64 md:h-64 shadow-sm border border-gray-100 flex-shrink-0">
                            {qrCodeInput ? (
                                <QRCodeCanvas id="qr-code-canvas" value={qrCodeInput} size={180} />
                            ) : (
                                <div className="text-gray-300 flex flex-col items-center gap-2">
                                    <QrCode size={48} className="opacity-20" />
                                    <span className="text-xs">等待输入...</span>
                                </div>
                            )}
                        </div>
                        {qrCodeInput && (
                            <button 
                                onClick={handleDownloadQr}
                                className={styles.buttonClass}
                            >
                                <Download size={14} />
                                下载图片
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
