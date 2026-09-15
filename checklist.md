
## 🚀 PHẦN B: HƯỚNG DẪN ĂN TỐI ĐA 10 ĐIỂM BONUS (MỞ RỘNG KỸ THUẬT)

Điểm Bonus (Tối đa 10 điểm) dành cho **một Chức Năng Mới Mở Rộng ngoài luồng cơ bản đã chốt**.

### 💡 Ý Tưởng Chức Năng Bonus Tiêu Biểu:
- **IT Helpdesk**: Chức năng *"Gia hạn/Cấp bù hạn dùng VPN/Mật khẩu tạm thời"* hoặc *"Đặt lịch hỗ trợ kỹ thuật tận nơi (On-site Booking)"*.
- **Bán hàng**: Chức năng *"Kiểm tra điều kiện & tính phí đổi trả sản phẩm"*.
- **Thư viện**: Chức năng *"Gia hạn thời gian mượn sách trực tuyến"*.
- **Du lịch**: Chức năng *"Tra cứu tình trạng đặt chỗ & đổi vé nhanh"*.

---

1. extend_vpn_access — Gia hạn thời gian / Đăng ký truy cập VPN khẩn cấp (Nên chọn nhất)
Mô tả: Cho phép người dùng gửi yêu cầu gia hạn VPN hoặc cấp quyền truy cập VPN từ xa cho tài khoản nhân viên.
Tham số (JSON Schema):
employee_id (string, required): Mã nhân viên (ví dụ EMP-1002).
duration_days (integer, default: 7): Số ngày gia hạn (1, 3, 7, 30).
reason (string, required): Lý do cần gia hạn (ví dụ: "Công tác xa nhà").
Lý do nên chọn: Thực tế, dễ hiểu, phù hợp với các tool IT Support hiện tại (search_kb, check_service_status).

### 📋 Checklist 4 Bước Để Trọn Vẹn 10 Điểm Bonus:

#### 1. Tính Hữu Ích & Thiết Kế (3 Điểm)
- [x] Chọn **1 Chức năng mở rộng mới** chưa có trong 9 tool cơ bản (`extend_vpn_access`).
- [x] Khai báo Tool mới (ví dụ: `book_onsite_support` hoặc `extend_vpn_access`) vào file [starter_v0/artifacts/tools.yaml](file:///c:/AI/vinai20k/K4-L3B-Day04-Prompt-Engineering-Tool-Calling-Labs/starter_v0/artifacts/tools.yaml) kèm mô tả & JSON schema tham số rõ ràng.

#### 2. Tích Hợp Kỹ Thuật Backend (2 Điểm)
- [x] Viết hàm Python thực thi tool mới trong `starter_v0/tools/` (hoặc đăng ký vào `starter_v0/tools/__init__.py`).
- [x] Bổ sung dữ liệu giả lập (mock data) tương ứng nếu cần.


#### 3. Kiểm Thử Với Test Cases (3 Điểm)
- [x] Tạo thêm **2-3 test cases mới** cho tool bonus trong `data/eval_group.json` (`G11_bonus_extend_vpn_access`, `G12_bonus_extend_vpn_default_days`).
- [x] Chạy eval chứng minh Agent chọn đúng tool mới và truyền đúng tham số (Đạt **100% PASS** - 12/12 cases).


#### 4. An Toàn & Demo Thực Tế Trên UI (2 Điểm)
- [x] Đảm bảo tool mới tuân thủ ranh giới an toàn (Read tool chạy ngay, Write tool bắt buộc hỏi `clarify` xác nhận).
- [x] Bổ sung thông tin chứng cứ vào mục **B5. Optional và bonus tool evidence** trong [REPORT.md](file:///c:/AI/vinai20k/K4-L3B-Day04-Prompt-Engineering-Tool-Calling-Labs/starter_v0/artifacts/REPORT.md).
- [x] Biểu diễn được tool mới hoạt động trên Chat UI.

---

## 🧹 CHUẨN BỊ CUỐI CÙNG TRƯỚC KHI NỘP BÀI

- [x] **Clean-up check**: Kiểm tra `.gitignore` không commit file `.env`, API key, `.venv`, cache hay `tickets/`.
- [x] **Nộp VLearn**: Mỗi thành viên tự nộp cùng URL Repo nhóm lên VLearn trước deadline **23:59**.

