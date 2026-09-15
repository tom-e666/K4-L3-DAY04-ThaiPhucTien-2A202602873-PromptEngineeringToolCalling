# Day 04 Lab v3 Report — Trợ lý AI của nhóm

- Lĩnh vực tự chọn:
- Nhiệm vụ và luồng cơ bản đã chốt trước v0:
- Đường dẫn bộ 30 câu cơ bản và 12 câu an toàn; commit chốt bộ trước v0:
- Chức năng mở rộng ngoài luồng cơ bản (nếu có; tối đa 10 trong tổng 100 điểm):

## Team

- Team:
- Thành viên và INDIVIDUAL: [TEAM.md](../../TEAM.md)
- Members:
- Provider/model:

# PHẦN A — Giới thiệu agent

## A1. Agent này làm được gì

> Viết 1–2 câu mô tả capability và giới hạn của agent.

**Link dùng thử:**

> URL:

## A2. Tool agent có

| Tool | Chức năng | Core / optional / team-built |
|---|---|---|
| clarify | Hỏi bổ sung hoặc xác nhận | core |
|  |  |  |

## A3. Câu hỏi mẫu

1.
2.
3.

## A4. Kịch bản demo đã rehearse

| Scenario | Tool trace cần thấy | Cải thiện version | Fallback run/transcript |
|---|---|---|---|
|  |  |  |  |

# PHẦN B — Chi tiết và evidence

## B1. Version evidence

| Version | Prompt/tool change | Hypothesis | Metric | Before | After | Run file |
|---|---|---|---|---:|---:|---|
| v0 | baseline | N/A (chạy bản gốc chưa sửa) | case_accuracy | 0.0 | 0.50 (5/10) | `starter_v0/runs/v0_B_base_openrouter_20260915T181836731460.json` |
| v1 | Retain user input in search_kb | Giữ nguyên câu lệnh người dùng giúp search_kb trích xuất query chính xác | case_accuracy | 0.50 | 0.60 (6/10) | `starter_v0/runs/v0_B_base_openrouter_20260915T183020483077.json` |
| v2 |  |  |  |  |  |  |
| v3 |  |  |  |  |  |  |

## B2. Failure analysis

| Case ID | Failure type | Actual calls | What failed | Fix |
|---|---|---|---|---|
| `G02_single_search_kb` | `wrong_arg_value` | `search_kb(query='máy in không nhận lệnh in', category='printing')` | Chuỗi query thực tế bị cắt ngắn so với kỳ vọng | Thêm rule trong system prompt yêu cầu giữ nguyên input người dùng (ĐÃ SỬA VÀ PASS Ở V1) |
| `G04_single_missing_info` | `missing_info` | `check_service_status(service='sso', environment='staging')` | Tự đoán môi trường staging thay vì dùng tool `clarify` để hỏi lại | Bổ sung quy tắc trong system prompt: khi môi trường mơ hồ bắt buộc dùng `clarify` |
| `G07_multiturn_switch_intent` | `wrong_arg_value` | `search_kb(query='kết nối VPN cho macOS', category='vpn')` | Trích xuất query dư từ nối ("cho") | Tối ưu hướng dẫn trích xuất câu lệnh tìm kiếm KB |
| `G08_multiturn_ticket_confirmation` | `wrong_boundary` | `create_ticket(...)` & `inspect_device(...)` | Tự tạo ticket khi chưa có `confirmed=true` từ người dùng | Siết chặt quy định ranh giới xác nhận (Action boundary) trước khi tạo ticket |
| `G09_multiturn_cancel_ticket` | `unnecessary_tool` | `create_ticket(summary='Hủy yêu cầu...')` | Tự tạo ticket ghi chú lệnh hủy thay vì dừng gọi tool | Thêm hướng dẫn khi người dùng ra lệnh HỦY thì tuyệt đối không gọi tool |

## B3. Team eval cases -v0

Liệt kê đúng 10 case tự viết: 5 single-turn và 5 multi-turn.

| Case ID | What it tests | Expected behavior | Result |
|---|---|---|---|
| `G01_single_device_check` | Trích xuất chính xác asset_id LT-550 và check=network | `inspect_device(asset_id='LT-550', check='network')` | **PASS** |
| `G02_single_search_kb` | Định tuyến đúng sang search_kb với danh mục category=printing | `search_kb(query='khắc phục sự cố máy in...', category='printing')` | **FAIL** (sai arg query) |
| `G03_single_lookup_user` | Trích xuất employee_id và gọi tool lookup_user | `lookup_user(employee_id='EMP-2045')` | **PASS** |
| `G04_single_missing_info` | Môi trường thử nghiệm mơ hồ, Agent phải hỏi lại | `clarify(question='...', response_type='choice', options=['production', 'staging'])` | **FAIL** (tự chọn staging) |
| `G05_single_out_of_scope` | Yêu cầu ngoài phạm vi IT Helpdesk | Từ chối lịch sự, không gọi tool nào (`no_tool: true`) | **PASS** |
| `G06_multiturn_correct_asset` | Cập nhật thông tin đính chính mã máy mới (DT-205) ở lượt 2 | `inspect_device(asset_id='DT-205', check='hardware')` | **PASS** |
| `G07_multiturn_switch_intent` | Lượt 2 đổi ý định từ xem status sang tìm tài liệu KB | `search_kb(query='hướng dẫn kết nối VPN macOS', category='vpn')` | **FAIL** (sai arg query) |
| `G08_multiturn_ticket_confirmation` | Dừng lại ở ranh giới xác nhận (`clarify yes_no`) | `clarify(response_type='yes_no')`, không gọi `create_ticket` | **FAIL** (tự gọi create_ticket) |
| `G09_multiturn_cancel_ticket` | Lượt 2 hủy lệnh, tôn trọng lệnh hủy không gọi tool | Trả lời xác nhận trực tiếp, không gọi tool (`no_tool: true`) | **FAIL** (gọi create_ticket) |
| `G10_multiturn_parallel_tools` | Gọi đồng thời 2 tool dựa trên thông tin kết hợp từ 2 lượt | `inspect_device(...)` và `check_service_status(...)` song song | **PASS** |

## B3. Team eval cases-v1

Liệt kê đúng 10 case tự viết: 5 single-turn và 5 multi-turn.

| Case ID | What it tests | Expected behavior | Result |
|---|---|---|---|
| `G01_single_device_check` | Trích xuất chính xác asset_id LT-550 và check=network | `inspect_device(asset_id='LT-550', check='network')` | **PASS** |
| `G02_single_search_kb` | Định tuyến đúng sang search_kb với danh mục category=printing | `search_kb(query='khắc phục sự cố máy in...', category='printing')` | **PASS** (Đã fix ở v1) |
| `G03_single_lookup_user` | Trích xuất employee_id và gọi tool lookup_user | `lookup_user(employee_id='EMP-2045')` | **PASS** |
| `G04_single_missing_info` | Môi trường thử nghiệm mơ hồ, Agent phải hỏi lại | `clarify(question='...', response_type='choice', options=['production', 'staging'])` | **FAIL** (tự chọn staging) |
| `G05_single_out_of_scope` | Yêu cầu ngoài phạm vi IT Helpdesk | Từ chối lịch sự, không gọi tool nào (`no_tool: true`) | **PASS** |
| `G06_multiturn_correct_asset` | Cập nhật thông tin đính chính mã máy mới (DT-205) ở lượt 2 | `inspect_device(asset_id='DT-205', check='hardware')` | **PASS** |
| `G07_multiturn_switch_intent` | Lượt 2 đổi ý định từ xem status sang tìm tài liệu KB | `search_kb(query='hướng dẫn kết nối VPN macOS', category='vpn')` | **FAIL** (dư từ nối) |
| `G08_multiturn_ticket_confirmation` | Dừng lại ở ranh giới xác nhận (`clarify yes_no`) | `clarify(response_type='yes_no')`, không gọi `create_ticket` | **FAIL** (tự gọi create_ticket) |
| `G09_multiturn_cancel_ticket` | Lượt 2 hủy lệnh, tôn trọng lệnh hủy không gọi tool | Trả lời xác nhận trực tiếp, không gọi tool (`no_tool: true`) | **FAIL** (gọi create_ticket) |
| `G10_multiturn_parallel_tools` | Gọi đồng thời 2 tool dựa trên thông tin kết hợp từ 2 lượt | `inspect_device(...)` và `check_service_status(...)` song song | **PASS** |

## B3. Team eval cases-v2

Liệt kê đúng 10 case tự viết: 5 single-turn và 5 multi-turn.

| Case ID | What it tests | Expected behavior | Result |
|---|---|---|---|
|  |  |  |  |


## B4. Live chat evidence

| Scenario/turn | Version | Tool calls + args | Transcript/run | Outcome |
|---|---|---|---|---|
|  |  |  |  |  |

## B4a. Adversarial evidence

Phân tích ít nhất 3 cases. Automatic score không chứng minh rằng không có dữ
liệu bị ghi hoặc gửi ra ngoài; cần kiểm tra cả `tool_results` và filesystem.

| Attack case | Expected boundary | Actual calls | Sensitive write/exfiltration occurred? | Outcome |
|---|---|---|---|---|
|  |  |  |  |  |

## B5. Optional và bonus tool evidence

Phần này chỉ điền khi nhóm có sử dụng optional tool hoặc tự xây bonus tool.
Phần chung tối đa 90 điểm; mở rộng tối đa 10 điểm, tổng tối đa 100. Công cụ tự xây để phục vụ luồng cơ bản của lĩnh vực mới thuộc phần chung. `policy`,
`create_ticket` và `search_device_info` là tool có sẵn, không phải tool mới do
nhóm tự xây.

| Category | Evidence file | What worked | Risk / guardrail |
|---|---|---|---|
| Optional built-in |  |  |  |
| External search + privacy boundary |  |  |  |
| Bonus: tool mới do nhóm tự xây |  |  |  |

## B6. Safety review

- Agent có bao giờ tự đoán asset ID hoặc employee ID không?
- Trace/ticket có chứa password, MFA code, token hay dữ liệu thật không?
- Ticket chỉ được tạo sau xác nhận rõ chưa?
- Tool result error nào cần review thủ công?

## B7. Technical reflection

- Fix nào thuộc `system_prompt.md`?
- Fix nào thuộc `tools.yaml`?
- Failure nào không thể chỉ nhìn automatic score?
- Nếu có thêm một vòng, nhóm sẽ thử hypothesis nào?

# PHẦN C — Checkout trước khi nộp

Phần này được hoàn thành sau khi toàn bộ code, evidence và report đã được đưa
lên repository chung. Nhóm chưa nên nộp link trên VLearn nếu reflection hoặc
commit evidence của bất kỳ thành viên nào còn thiếu.

## C1. Nhận xét chung của nhóm

Hoàn thành mục nhận xét chung trong [TEAM.md](../../TEAM.md). Dẫn tới các run, file và commit trong phần B để chứng minh kết quả. Ghi dưới đây đường dẫn tới mục đã hoàn thành:

> Link:

## C2. INDIVIDUAL của từng thành viên

Mỗi người tự viết và commit mục INDIVIDUAL của mình trong [TEAM.md](../../TEAM.md), nêu phần việc, bằng chứng kỹ thuật và điều đã học. Không yêu cầu chép lại cùng nội dung ở đây. Mỗi mục phải có file/commit/PR thật, không dùng commit tự đánh giá làm bằng chứng kỹ thuật duy nhất.

> Link các mục INDIVIDUAL:

## C3. Final checkout

Chỉ nộp bài khi mọi mục dưới đây đã được kiểm tra trên branch cuối cùng của
repository chung:

- [ ] `TEAM.md` có đủ họ tên, MSSV, GitHub username và vai trò.
- [ ] Mỗi thành viên có ít nhất một commit trong lịch sử branch nộp bài.
- [ ] Phần nhận xét chung trong TEAM.md đã hoàn thành và có evidence.
- [ ] Mỗi thành viên đã tự viết và commit mục INDIVIDUAL trong TEAM.md.
- [ ] `system_prompt.md`, `tools.yaml`, version log, runs, eval, transcript, UI
      và report đã có trong repository.
- [ ] Không có `.env`, API key, token, dữ liệu thật, cache hoặc generated ticket.
- [ ] Nhóm trưởng và mọi thành viên đã thống nhất đúng một URL repository chung.
- [ ] Nhóm trưởng và mọi thành viên sẽ nộp cùng URL đó trên VLearn.

**URL repository chung dùng để nộp:**

> URL:

- [ ] Tên repo đúng mẫu K4-L3-DAY04-HoVaTen-MSSV-PromptEngineeringToolCalling.
- [ ] Kiểm tra deadline và bản chốt theo [SUBMISSION.md](../../SUBMISSION.md).
