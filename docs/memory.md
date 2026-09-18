# Memory

Role `ASSISTANT` cannot access the three statistics pages or prescribe in the CMS;
the backend create/update medical-history APIs remain restricted to `DOCTOR`.
Monthly and yearly statistics read precomputed snapshots from `/statistics/monthly`
and `/statistics/yearly`; only daily statistics still use the queue dashboard API.
Monthly/yearly views include visit outcomes and durations, new/returning patients,
and low-stock/expiring-batch alerts from those snapshots.

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

- Các nhãn, nút, placeholder, thông báo và trang lỗi còn dùng tiếng Anh trong CMS đã được chuẩn hóa sang tiếng Việt, gồm thành phần dùng chung, đăng nhập, quản trị viên, cấu hình chung, bài viết, menu và thiết lập.

- Tenant admin có mục “Thông tin phòng khám” tại `/settings/tenant`: sửa tên và địa chỉ; xem mã tenant, subdomain, tên gói, trạng thái và hạn thuê bao. Các vai trò khác không thấy menu và bị chặn route.
- Menu cài đặt tài khoản dùng nhãn “Hồ sơ cá nhân” và có trang `/settings/change-password`; đổi mật khẩu yêu cầu mật khẩu hiện tại. Sidebar đổi “Master Data” thành “Cấu hình chung” và có trang `/clinic-days-off`, lưu ngày nghỉ lặp hằng năm dạng `MM-DD` trong master data.
- Trang `/settings` dùng dữ liệu thật từ auth store, hiển thị đầy đủ hồ sơ và lưu họ tên, email, điện thoại, giới tính, ngày sinh, địa chỉ, ghi chú qua `PATCH /auth/profile`; tên đăng nhập chỉ đọc.

- CMS có trang `/landing-config` cho tenant admin chỉnh thương hiệu, phần giới thiệu đầu trang, bác sĩ phụ trách, dịch vụ, giờ đặt lịch, liên hệ, SEO và trạng thái công khai; dữ liệu dùng API `GET/PUT /landing-config`.
- Trang `/posts` quản lý bài viết theo tenant bằng API `/posts`: tạo, sửa, xóa, tìm kiếm, lọc bản nháp/công khai. Popup tạo/sửa nằm giữa màn hình như trang Bệnh nhân; nội dung dùng Tiptap với toolbar định dạng tối giản và lưu HTML.
- Ảnh đại diện bài viết dùng `POST /images/upload?resource=POST`, có vùng chọn file, trạng thái tải, preview 16:9 và gợi ý 1200 × 675 px (JPG/PNG/WebP, tối đa 5 MB); URL public dùng `/images/thumbnail/:fileName`. Ảnh kê toa tiếp tục upload mặc định với resource `PATIENT`.
- Trang `/landing-config` cho chọn tối đa 3 bài đã công khai để hiển thị trên home, lưu theo thứ tự chọn qua `featuredPostIds`.
- Trang quản lý banner và route `/banners` đã được xóa khỏi CMS.

- Authenticated layout hiển thị cảnh báo nhỏ ở đầu CMS khi gói trả phí còn tối đa 7 ngày hoặc đã hết hạn; dữ liệu lấy từ `subscriptionEndsAt` của tenant trong profile, không dùng hạn trial.

- Landing config uses flat typed API fields rather than a JSON object. Clinic name and address are read-only values sourced from `Tenant`, and brand colors provide both a native color picker and a HEX input.

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
