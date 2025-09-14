# Nội Tú Game App

Ứng dụng trò chơi Nội Tú với nhiều trò chơi tiếng Việt thú vị.

## Cấu trúc dự án

- `game-admin-server/`: Backend server (Node.js/Express)
- `src/`: Frontend React application

## Cài đặt và chạy

### Cài đặt

1. Cài đặt các dependencies:

```bash
# Cài đặt dependencies cho frontend
npm install

# Cài đặt dependencies cho backend
npm run setup
```

2. Cấu hình database:

- Tạo một file `.env` trong thư mục `game-admin-server/` với nội dung:

```
DB_NAME=noitu_game
DB_USER=root
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_secret_key
```

### Chạy ứng dụng

#### Chạy cả frontend và backend:

```bash
npm run dev:all
```

#### Hoặc chạy riêng:

```bash
# Chạy frontend (port 3000)
npm start

# Chạy backend (port 3001)
npm run backend
```

## Các trò chơi

- **Word Chain** (Nối Từ): Trò chơi nối tiếp các từ
- **Word Scramble** (Sắp Xếp Từ): Sắp xếp lại các từ bị xáo trộn
- **Quiz** (Hỏi Ngu): Trò chơi câu hỏi đố vui
- **Behavior Quiz** (Vua Ứng Xử): Câu hỏi về hành vi ứng xử
- **Knowledge Quiz** (Vua Kiến Thức): Câu hỏi về kiến thức chung
- **Universe Answer** (Câu Trả Lời Từ Vũ Trụ): Trả lời ngẫu nhiên
- **Guess Who** (Tôi Là Ai): Đoán nhân vật qua mô tả
- **Wordle** (Đoán Từ): Phiên bản tiếng Việt của trò chơi Wordle

## Các chức năng chính

1. Frontend:
   - Giao diện đơn giản, trực quan
   - Các trang trò chơi
   - Giao diện admin

2. Backend:
   - API RESTful
   - Xử lý logic trò chơi
   - Quản lý từ vựng và câu hỏi
   - Xác thực người dùng admin

## Cải tiến đã thực hiện

- Chuyển toàn bộ logic từ script frontend sang API backend
- Loại bỏ các file dữ liệu tĩnh không cần thiết
- Cấu trúc lại cách lấy dữ liệu cho các trò chơi 