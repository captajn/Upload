interface EnvConfig {
  apiUrl: string;
  appUrl: string;
  sharePointConfig: {
    clientId: string;
    clientSecret: string;
    tenantId: string;
    sitePath: string;
    domain: string;
  };
}

// Hàm lấy URL API dựa trên môi trường
const getApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Fallback cho development
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000/api'
    : '/api';
};

// Hàm lấy URL ứng dụng dựa trên môi trường
const getAppUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Fallback cho development
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : typeof window !== 'undefined' 
      ? window.location.origin
      : '';
};

// Cấu hình môi trường
export const envConfig: EnvConfig = {
  apiUrl: getApiUrl(),
  appUrl: getAppUrl(),
  sharePointConfig: {
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '',
    clientSecret: process.env.SHAREPOINT_CLIENT_SECRET || '',
    tenantId: process.env.NEXT_PUBLIC_TENANT_ID || '',
    sitePath: process.env.NEXT_PUBLIC_SITE_PATH || '',
    domain: process.env.NEXT_PUBLIC_SHAREPOINT_DOMAIN || ''
  }
};

// Hàm lấy URL đầy đủ cho API endpoint
export const getFullApiUrl = (endpoint: string): string => {
  const baseUrl = envConfig.apiUrl;
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Hàm lấy URL đầy đủ cho frontend route
export const getFullAppUrl = (path: string): string => {
  const baseUrl = envConfig.appUrl;
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

// Hàm lấy SharePoint site URL
export const getSharePointSiteUrl = (): string => {
  const { domain, sitePath } = envConfig.sharePointConfig;
  return `https://${domain}${sitePath}`;
}; 