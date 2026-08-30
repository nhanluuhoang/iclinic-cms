# Memory

## User

Nói tiếng Việt, muốn trả lời bằng tiếng Việt. Làm sản phẩm quản lý dược `simplemdg`.
Ưu tiên thay đổi gọn, hỏi lại khi yêu cầu có nhiều cách hiểu ảnh hưởng đáng kể.

## Project

`simplemdg_ui_react` là admin CMS dựa trên `shadcn-admin`. Branch chính: `develop`.
Package manager: pnpm.

## Architecture

React 19, TypeScript, Vite 8, TanStack Router/Query, Tailwind 4, shadcn/ui,
zustand, react-hook-form, zod và axios. Feature đặt trong `src/features/<name>`, route
đặt trong `src/routes/_authenticated/<name>`. Axios interceptor trả trực tiếp
`response.data`.

Kho thuốc gọi API thật từ `iclinic-backend` qua `VITE_APP_API_URL`; lớp mock
in-memory đã được xóa.

## State

- Có trang bệnh nhân `/patients` và kho thuốc `/inventory`.
- Có trang kê toa `/prescriptions`: chọn bệnh nhân, lưu thông tin khám/chẩn đoán qua
  `/medical-histories`, sau đó tạo đơn qua `/prescriptions`; danh mục thuốc lấy từ
  `/inventory/medicines`.
- Có trang hàng đợi khám `/examination-queue`: dashboard theo ngày, tiếp nhận bệnh
  nhân, gọi lượt tiếp theo, check-in lịch hẹn và chuyển trạng thái theo backend.
- Route kê toa đã được sinh vào `src/routeTree.gen.ts` và đã thêm vào sidebar.
- ESLint feature hàng đợi và `tsc -b` đều chạy sạch tại lần kiểm tra gần nhất.
