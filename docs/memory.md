# Memory

## User

Nói tiếng Việt, muốn trả lời bằng tiếng Việt. Làm sản phẩm quản lý dược `iclinic`.
Ưu tiên thay đổi gọn, hỏi lại khi yêu cầu có nhiều cách hiểu ảnh hưởng đáng kể.

## Project

`iclinic-cms` là admin CMS dựa trên `shadcn-admin`. Branch chính: `develop`.
Package manager: pnpm.

## Architecture

React 19, TypeScript, Vite 8, TanStack Router/Query, Tailwind 4, shadcn/ui,
zustand, react-hook-form, zod và axios. Feature đặt trong `src/features/<name>`, route
đặt trong `src/routes/_authenticated/<name>`. Axios interceptor trả trực tiếp
`response.data`.

Frontend gọi API thật từ `iclinic-backend` qua `VITE_APP_API_URL`; tìm kiếm dữ
liệu từ server dùng debounce 300 ms. Các bảng dùng chung nằm trong
`src/components/data-table`; input ngày dùng chung là `DatePickerInput`, hiển thị
`dd/mm/yyyy` và lưu `yyyy-mm-dd`.

## State

- CMS có trang `/landing-config` cho tenant admin chỉnh thương hiệu, hero, bác sĩ phụ trách, dịch vụ, giờ đặt lịch, liên hệ, SEO và trạng thái công khai; dữ liệu dùng API `GET/PUT /landing-config`.

- Authenticated layout hiển thị cảnh báo nhỏ ở đầu CMS khi gói trả phí còn tối đa 7 ngày hoặc đã hết hạn; dữ liệu lấy từ `subscriptionEndsAt` của tenant trong profile, không dùng hạn trial.

- CMS co product tour 6 buoc trong authenticated layout: tu dong mo mot lan cho
  moi tai khoan, ghi nho bang localStorage va co nut dau hoi de mo lai.
- Menu profile co 2 tour nghiep vu: quy trinh kham benh (tao benh nhan, tiep nhan,
  ke toa, xuat hoa don) va quan ly kho (danh muc, nhap, kiem ke, xuat hang).

- Có các nghiệp vụ bệnh nhân, danh mục thuốc, kho thuốc và thứ tự khám; trang demo
  Tasks và route `/tasks` đã được xóa.
- `/medicines` là feature danh mục thuốc độc lập. `/inventory` quản lý tồn kho,
  lô, phiếu nhập, phiếu xuất và kiểm kê bằng API thật; dòng phiếu xuất dùng field
  `quantity`, thuốc/lô được tìm kiếm server-side.
- Form thuốc hỗ trợ giá bán và bật/tắt kích hoạt; DTO cập nhật backend nhận
  `salePrice`. Seed thuốc có giá bán mẫu 1.000 và 2.500 đồng/viên.
- Trang “Thứ tự khám” chia tab `Đang khám` và `Đã xử lý`, có tìm kiếm và phân
  trang server-side 20 lượt/trang; hỗ trợ tiếp nhận bệnh nhân, gọi lượt tiếp theo,
  check-in, xem hồ sơ khám, kê toa và chuyển trạng thái theo backend.
- Lưu chẩn đoán/kê đơn làm mới cả danh sách và dashboard hàng đợi để số lượng
  trên tab Đang khám/Đã xử lý cập nhật cùng trạng thái lượt khám.
- Backend đã bỏ endpoint không dùng trong CMS. API khám thống nhất tại
  `medical-histories`: POST lưu chẩn đoán/kê đơn, GET đọc lịch sử,
  PATCH `/:id/prescription` sửa đơn theo ID hồ sơ khám; không còn `/prescriptions`.
- Form kê toa bắt buộc chọn thuốc từ danh mục; hồ sơ khám hỗ trợ tối đa 10 tệp
  đính kèm ảnh, PDF hoặc video theo giới hạn dung lượng đã cấu hình.
- Chưa kiểm thử end-to-end trên trình duyệt với backend đang chạy. Cần kiểm tra
  bằng tài khoản `DOCTOR` thuộc tenant có dữ liệu bệnh nhân và thuốc.
