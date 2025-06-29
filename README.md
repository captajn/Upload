# Upload App với SharePoint Integration

Ứng dụng web cho phép upload và quản lý file thông qua SharePoint, hỗ trợ xem video/audio trực tuyến với nhiều định dạng khác nhau.

## Tính năng

- Upload file với phân loại tự động
- Xem trước file (ảnh, video, audio, PDF)
- Hỗ trợ video streaming (HLS)
- Giao diện thân thiện, responsive
- Tích hợp với SharePoint để lưu trữ

## Cài đặt

1. Clone repository

```bash
git clone <repository-url>
cd upload-app
```

2. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

3. Tạo file `.env` từ mẫu

```bash
cp .env.example .env
```

## Cấu hình SharePoint

Để ứng dụng hoạt động, bạn cần cấu hình SharePoint App Registration. Làm theo các bước sau:

### 1. Đăng ký Azure AD App

1. Đăng nhập vào [Azure Portal](https://portal.azure.com)
2. Tìm và chọn "App registrations"
3. Click "New registration"
4. Điền thông tin:
   - Name: Tên ứng dụng của bạn
   - Supported account types: "Accounts in this organizational directory only"
   - Redirect URI: Web - http://localhost:3000 (cho development)
5. Click "Register"

### 2. Cấu hình Permissions

1. Trong app registration vừa tạo, chọn "API permissions"
2. Click "Add a permission"
3. Chọn "Microsoft Graph"
4. Chọn "Application permissions"
5. Thêm các quyền sau:
   - Files.Read.All
   - Files.ReadWrite.All
   - Sites.Read.All
   - Sites.ReadWrite.All
6. Click "Grant admin consent"

### 3. Tạo Client Secret

1. Chọn "Certificates & secrets"
2. Click "New client secret"
3. Thêm mô tả và chọn thời hạn
4. **QUAN TRỌNG**: Copy giá trị secret ngay lập tức vì nó sẽ không hiển thị lại

### 4. Lấy thông tin cấu hình

Từ app registration, lấy các thông tin sau:

- Application (client) ID -> NEXT_PUBLIC_CLIENT_ID
- Directory (tenant) ID -> NEXT_PUBLIC_TENANT_ID
- Client Secret đã tạo -> SHAREPOINT_CLIENT_SECRET

### 5. Lấy thông tin SharePoint site

1. Truy cập SharePoint site của bạn
2. URL có dạng: https://{domain}.sharepoint.com/sites/{site-name}
   - Domain -> NEXT_PUBLIC_SHAREPOINT_DOMAIN (ví dụ: company.sharepoint.com)
   - Site path -> NEXT_PUBLIC_SITE_PATH (ví dụ: /sites/mysite)

### 6. Cập nhật file .env

```env
# SharePoint Configuration
NEXT_PUBLIC_TENANT_ID="your-tenant-id"
NEXT_PUBLIC_CLIENT_ID="your-client-id"
SHAREPOINT_CLIENT_SECRET="your-client-secret"

# SharePoint Site Path
NEXT_PUBLIC_SITE_PATH="/sites/your-site"
NEXT_PUBLIC_SHAREPOINT_DOMAIN="your-domain.sharepoint.com"
```

## Khởi chạy

Development:

```bash
npm run dev
# hoặc
yarn dev
```

Production:

```bash
npm run build
npm start
# hoặc
yarn build
yarn start
```

## Bảo mật

⚠️ **QUAN TRỌNG**:

- KHÔNG commit file `.env` vào repository
- Bảo vệ client secret và các thông tin nhạy cảm
- Sử dụng environment variables trong production
- Giới hạn IP trong Azure AD nếu cần thiết

## Đóng góp

Mọi đóng góp đều được chào đón! Tạo issue hoặc pull request để cải thiện ứng dụng.

## License

MIT
