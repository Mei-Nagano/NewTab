// 获取图片主色调亮度，用于自适应主题
export const getDominantBrightness = (imageUrl: string): Promise<'light' | 'dark'> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    // 超时保护，避免图片加载过慢导致挂起
    const timeout = setTimeout(() => resolve('dark'), 3000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        // 使用小尺寸提高性能
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('dark');
          return;
        }

        ctx.drawImage(img, 0, 0, 50, 50);

        const imageData = ctx.getImageData(0, 0, 50, 50);
        const data = imageData.data;
        let totalBrightness = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // 感知亮度计算公式
          const brightness = Math.sqrt(
            0.299 * (r * r) +
            0.587 * (g * g) +
            0.114 * (b * b)
          );

          totalBrightness += brightness;
        }

        const avgBrightness = totalBrightness / (data.length / 4);

        // 如果是明亮背景，返回'light'（使用深色文字）
        // 阈值设为180（满分255），倾向于使用白色文字（深色模式）
        // 因为白色文字配合阴影在复杂背景上通常更易读
        resolve(avgBrightness > 180 ? 'light' : 'dark');

      } catch (e) {
        // CORS错误时的降级处理
        resolve('dark');
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve('dark');
    };
  });
};