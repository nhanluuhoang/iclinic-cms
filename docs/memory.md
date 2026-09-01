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

- Có các nghiệp vụ bệnh nhân, danh mục thuốc, kho thuốc và thứ tự khám; trang demo
  Tasks và route `/tasks` đã được xóa.
- `/medicines` là feature danh mục thuốc độc lập. `/inventory` quản lý tồn kho,
  lô, phiếu nhập, phiếu xuất và kiểm kê bằng API thật; dòng phiếu xuất dùng field
  `quantity`, thuốc/lô được tìm kiếm server-side.
- Trang “Thứ tự khám” chia tab `Đang khám` và `Đã xử lý`, có tìm kiếm và phân
  trang server-side 20 lượt/trang; hỗ trợ tiếp nhận bệnh nhân, gọi lượt tiếp theo,
  check-in, xem hồ sơ khám, kê toa và chuyển trạng thái theo backend.
- Form kê toa bắt buộc chọn thuốc từ danh mục; hồ sơ khám hỗ trợ tối đa 10 tệp
  đính kèm ảnh, PDF hoặc video theo giới hạn dung lượng đã cấu hình.
- Chưa kiểm thử end-to-end trên trình duyệt với backend đang chạy. Cần kiểm tra
  bằng tài khoản `DOCTOR` thuộc tenant có dữ liệu bệnh nhân và thuốc.

