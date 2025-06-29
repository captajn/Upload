interface UploadPathConfig {
  path: string;
  maxSize: number; // Kích thước tối đa (bytes)
  allowedTypes: string[]; // Các loại file được phép
  description: string;
}

interface UploadConfig {
  [key: string]: UploadPathConfig;
}

// Cấu hình cho từng loại file
export const uploadConfig: UploadConfig = {
  Images: {
    path: '/Images',
    maxSize: Infinity,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    description: 'Thư mục lưu trữ hình ảnh'
  },
  Video: {
    path: '/Video',
    maxSize: Infinity,
    allowedTypes: ['video/mp4', 'video/webm', 'video/x-matroska', 'video/avi', 'video/quicktime'],
    description: 'Thư mục lưu trữ video'
  },
  Audio: {
    path: '/Audio',
    maxSize: Infinity,
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/flac'],
    description: 'Thư mục lưu trữ âm thanh'
  },
  Documents: {
    path: '/Docs',
    maxSize: Infinity,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ],
    description: 'Thư mục lưu trữ tài liệu'
  },
  Files: {
    path: '/Files',
    maxSize: Infinity,
    allowedTypes: ['*/*'],
    description: 'Thư mục lưu trữ các file khác'
  }
};

// Hàm kiểm tra kích thước file - luôn trả về true vì không còn giới hạn
export const isFileSizeValid = (): boolean => {
  return true;
};

// Hàm kiểm tra loại file
export const isFileTypeAllowed = (type: string, folderType: string): boolean => {
  const config = uploadConfig[folderType];
  if (config.allowedTypes.includes('*/*')) return true;
  return config.allowedTypes.includes(type);
};

// Hàm lấy đường dẫn upload
export const getUploadPath = (folderType: string): string => {
  return uploadConfig[folderType]?.path || '/Files';
};

// Hàm lấy kích thước tối đa cho phép - luôn trả về Infinity
export const getMaxFileSize = (): number => {
  return Infinity;
};

// Hàm lấy danh sách các loại file được phép
export const getAllowedTypes = (folderType: string): string[] => {
  return uploadConfig[folderType]?.allowedTypes || ['*/*'];
};

// Hàm format kích thước file
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}; 