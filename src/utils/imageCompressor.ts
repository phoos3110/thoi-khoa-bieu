/**
 * Nén ảnh trên trình duyệt bằng HTML5 Canvas để lưu trữ offline vào LocalStorage,
 * không chiếm dụng bộ nhớ (thường dưới 300KB sau nén).
 */
export async function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Không thể tải ảnh'));
      img.onload = () => {
        // Tính toán kích thước mới giữ nguyên tỷ lệ
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas không được hỗ trợ'));

        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
