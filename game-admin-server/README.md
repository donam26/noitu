# NoiTu Game Hub - Backend Server

Backend API cho ứng dụng NoiTu Game Hub, xử lý quản lý câu hỏi và dữ liệu game.

## Cài đặt

### Yêu cầu

- Node.js v14.0.0 trở lên
- MySQL v5.7 trở lên

### Bước 1: Cài đặt dependencies

```bash
cd game-admin-server
npm install
```

### Bước 2: Cấu hình môi trường

Tạo file `.env` trong thư mục `game-admin-server` dựa trên mẫu đã cung cấp:

```
# Cấu hình server
PORT=3001
NODE_ENV=development

# Cấu hình Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=noitu_game

# Cấu hình JWT
JWT_SECRET=noitu_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# Cấu hình Upload
UPLOAD_PATH=public/uploads
MAX_FILE_SIZE=5242880  # 5MB
```

Chỉnh sửa các thông số kết nối MySQL theo cấu hình của bạn.

### Bước 3: Tạo database

Đảm bảo MySQL đang chạy, sau đó tạo database mới:

```sql
CREATE DATABASE noitu_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Bước 4: Khởi tạo cơ sở dữ liệu và dữ liệu mẫu

```bash
node setup.js
```

Script sẽ tạo các bảng và dữ liệu mẫu từ file JS hiện có. Sau khi hoàn tất, bạn sẽ có tài khoản admin mặc định:
- Username: `admin`
- Password: `admin123`

## Chạy server

### Chế độ development

```bash
npm run dev
```

### Chế độ production

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Đăng nhập admin
- `GET /api/auth/profile` - Lấy thông tin admin
- `POST /api/auth/change-password` - Đổi mật khẩu

### Quiz Questions

- `GET /api/quiz` - Lấy danh sách câu hỏi
- `POST /api/quiz` - Tạo câu hỏi mới
- `GET /api/quiz/:id` - Lấy chi tiết câu hỏi
- `PUT /api/quiz/:id` - Cập nhật câu hỏi
- `DELETE /api/quiz/:id` - Xóa câu hỏi
- `POST /api/quiz/bulk` - Thêm nhiều câu hỏi cùng lúc

### Wordle Words

- `GET /api/wordle` - Lấy danh sách từ Wordle
- `POST /api/wordle` - Thêm từ Wordle mới
- `DELETE /api/wordle/:id` - Xóa từ Wordle

### Health Check

- `GET /api/health` - Kiểm tra trạng thái API

## Tích hợp với Frontend

Frontend đã được cập nhật để sử dụng API qua axios. Các component chính đã được chỉnh sửa để gọi API:

- `LoginForm.js` - Đăng nhập admin
- `QuizManager.js` - Quản lý câu hỏi

Để chạy toàn bộ ứng dụng (backend + frontend):

```bash
cd ..  # Di chuyển về thư mục gốc
npm run dev
```

## Xác thực và Phân quyền

Hệ thống sử dụng JWT (JSON Web Tokens) để xác thực. Mỗi token có thời hạn 24 giờ.

Có hai loại quyền:
- `admin`: Quyền quản trị thông thường
- `super_admin`: Quyền cao nhất, có thể tạo tài khoản admin khác

## Hỗ trợ

Nếu bạn gặp vấn đề, vui lòng mở issue hoặc liên hệ đội phát triển. 