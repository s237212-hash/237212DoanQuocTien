# 237212DoanQuocTien — Quản lý món ăn trên nền tảng đám mây

Ứng dụng quản lý thực đơn Việt Nam gồm giao diện React, REST API Node.js/Express và MongoDB Atlas. Tên database: `237212DoanQuocTien`; collection: `foods`.

## Công nghệ
- React + Vite: giao diện thêm, xem, tìm kiếm, cập nhật và xóa món ăn.
- Node.js + Express + Mongoose: REST API và kiểm tra dữ liệu.
- MongoDB Atlas: lưu trữ dữ liệu đám mây.
- Docker / Docker Hub: đóng gói backend và frontend.
- Render: triển khai dịch vụ web và giao diện tĩnh.

## Cấu trúc
```text
backend/                 Express API, schema và dữ liệu mẫu
  src/server.js
  src/seed.js
  Dockerfile
frontend/                React + Vite
  src/main.jsx
  src/style.css
  Dockerfile
  nginx.conf
docker-compose.yml       Chạy cả hai ứng dụng cục bộ
render.yaml              Blueprint tham khảo cho hai dịch vụ Render
```

## Cấu hình an toàn
Không commit tệp `.env`, mật khẩu, token hoặc URI MongoDB có thông tin xác thực. Sao chép `backend/.env.example` thành `backend/.env` và điền URI mới của MongoDB Atlas:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/237212DoanQuocTien?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
```
Chuỗi kết nối Atlas cần chỉ định database `237212DoanQuocTien` (URI path hoặc tùy chọn `dbName`). Tạo database user riêng với quyền tối thiểu cần thiết và cấp phép IP theo môi trường sử dụng. Không tái sử dụng mật khẩu MongoDB từng dán trong chat; hãy tạo lại credential trước khi triển khai.

## Chạy cục bộ
Yêu cầu Node.js 20 trở lên và MongoDB Atlas URI đã cấu hình.
1. Trong `backend`, chạy `npm install`, sau đó `npm run seed` để thêm ba món mẫu (chạy seed nhiều lần không tạo trùng).
2. Chạy backend bằng `npm run dev` (mặc định `http://localhost:5000`).
3. Sao chép `frontend/.env.example` thành `frontend/.env`; khi chạy local, đặt `VITE_API_URL=http://localhost:5000`.
4. Trong `frontend`, chạy `npm install` rồi `npm run dev`; mở `http://localhost:5173`.

## API
| Phương thức | Endpoint | Chức năng |
|---|---|---|
| GET | `/health` | Health check và trạng thái kết nối DB |
| GET | `/api/foods` | Danh sách món ăn |
| GET | `/api/foods?search=pho` | Tìm theo tên, loại món hoặc vùng miền |
| GET | `/api/foods/:id` | Chi tiết món theo MongoDB ID |
| POST | `/api/foods` | Thêm món (JSON) |
| PUT | `/api/foods/:id` | Cập nhật món (JSON) |
| DELETE | `/api/foods/:id` | Xóa món |

Ví dụ JSON cho POST/PUT:
```json
{
  "foodId": "PHO-002", "name": "Phở gà", "category": "Món nước",
  "cuisine": "Miền Bắc", "ingredients": ["bánh phở", "thịt gà", "hành"],
  "price": 55000, "quantity": 12,
  "description": "Phở gà với nước dùng thanh ngọt.", "imageUrl": ""
}
```
`foodId` không được trùng; giá và số lượng không âm; lỗi đầu vào, bản ghi không tồn tại và xung đột mã món trả về mã HTTP phù hợp.

## Docker
Tạo `.env` ở thư mục gốc chứa `MONGODB_URI` (không commit), sau đó:
```sh
docker compose up --build
```
Giao diện ở `http://localhost:8080`, API ở `http://localhost:5000`. Hoặc xây dựng riêng:
```sh
docker build -t 237212doanquoctien/backend ./backend
docker run --rm -p 5000:5000 -e MONGODB_URI="<uri>" -e CLIENT_ORIGIN="http://localhost:8080" 237212doanquoctien/backend
docker build --build-arg VITE_API_URL="https://two37212doanquoctien.onrender.com" -t 237212doanquoctien/frontend ./frontend
docker run --rm -p 8080:80 237212doanquoctien/frontend
```
Đăng nhập Docker Hub trên máy của bạn rồi push hai image bằng `docker push 237212doanquoctien/backend` và `docker push 237212doanquoctien/frontend`. Cần tài khoản Docker Hub `237212doanquoctien` hoặc đổi namespace thành tài khoản thực tế của bạn.

### Tự động build và push qua GitHub Actions

Workflow `.github/workflows/docker-publish.yml` build và push cả hai image khi có commit lên `main`. Trong Settings → Secrets and variables → Actions, tạo secrets `DOCKERHUB_USERNAME` và `DOCKERHUB_TOKEN` (access token Docker Hub). Không dùng mật khẩu Docker Hub thường hoặc đưa token vào file.

## Triển khai Render
Backend Render hiện có URL `https://two37212doanquoctien.onrender.com`. Frontend `web-237212` dùng biến `VITE_API_URL` trỏ trực tiếp tới API này. Giữ bí mật `MONGODB_URI` trong Environment của dịch vụ backend; không đưa URI vào repo.

Kiểm tra API: `https://two37212doanquoctien.onrender.com/health`. Frontend: `https://web-237212.onrender.com`.

## Tài nguyên bài nộp
- GitHub: `https://github.com/s237212-hash/237212DoanQuocTien`.
- Docker Hub backend: `https://hub.docker.com/r/237212doanquoctien/backend`.
- Docker Hub frontend: `https://hub.docker.com/r/237212doanquoctien/frontend`.
- Render frontend: `https://web-237212.onrender.com` (đã triển khai; hiển thị ba món mẫu từ Atlas).
- Render API: `https://two37212doanquoctien.onrender.com`.
- MongoDB Atlas database: `237212DoanQuocTien`, collection `foods`.

## Ghi chú tiến độ
Workflow Docker Hub cần secrets `DOCKERHUB_USERNAME` và `DOCKERHUB_TOKEN`. Ba món mẫu đã được thêm vào Atlas; giao diện và API Render đã được kiểm tra cùng nhau.
