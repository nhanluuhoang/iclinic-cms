# Progress

## Done

- 2026-08-28: Thêm page `/examination-queue` dùng API thật của backend: dashboard
  theo ngày, thống kê, danh sách lượt khám, tiếp nhận bệnh nhân, gọi lượt kế tiếp,
  check-in lịch hẹn và chuyển trạng thái đúng state machine. Đã thêm route/sidebar;
  ESLint feature và `tsc -b` chạy sạch.
- 2026-08-28: Bỏ các ô liều dùng, tần suất và thời gian dùng khỏi form kê toa; FE
  gửi giá trị `Theo chỉ định` cho ba field bắt buộc tương ứng của backend.
- 2026-08-28: Đổi trường thuốc trong đơn sang combobox tìm kiếm theo tên/hàm lượng;
  xóa lựa chọn và ô nhập thuốc ngoài danh mục, bắt buộc chọn `medicineId` từ API.
- 2026-08-28: Thêm UI upload nhiều tệp chẩn đoán tại trang kê toa: ảnh có preview,
  PDF có thẻ thông tin, video có trình phát, hỗ trợ xóa từng tệp. Giới hạn tổng 10
  tệp; JPG/PNG/PDF tối đa 5 MB, MP4/WebM/MOV tối đa 100 MB. FE gửi multipart field
  `files` tới `POST /medical-histories/:id/attachments`.
- 2026-08-28: Thay toàn bộ mock in-memory của kho thuốc bằng API thật từ
  `iclinic-backend`; ánh xạ response thuốc/lô/phiếu nhập/kiểm kê sang model UI và
  xóa `src/features/inventory/api/mock-db.ts`.
- Thao tác hủy tồn lô được ghi nhận qua phiếu kiểm kê của backend.
- ESLint lớp API kho và `tsc -b` chạy thành công.
- 2026-08-28: Thêm trang `/prescriptions` để bác sĩ ghi nhận lượt khám, chẩn đoán,
  hướng điều trị và kê nhiều thuốc cho bệnh nhân theo contract `iclinic-backend`.
- Kết nối danh sách bệnh nhân `/users`, thuốc `/inventory/medicines`, tạo hồ sơ khám
  `/medical-histories` và tạo đơn `/prescriptions`.
- Thêm route và mục menu “Kê toa thuốc”.
- ESLint riêng tính năng mới chạy sạch; TypeScript không phát sinh lỗi mới.

## In progress

- Chưa kiểm thử tương tác với backend đang chạy trên trình duyệt.

## Next up

- Kiểm thử end-to-end với tài khoản vai trò `DOCTOR` và tenant có dữ liệu bệnh nhân,
  thuốc.
- Xử lý các lỗi build có sẵn của toàn dự án khi được yêu cầu.
