# TEAM — Day04, K4-L3B

**Làm nhóm.** Mỗi người tự viết và commit phần INDIVIDUAL của mình.

## Thông tin bài nộp

- Tên nhóm: T021
- Người đại diện / MSSV: Tiến /2A202602873
- Tên repo: `K4-L3-DAY04-ThaiPhucTien-2A202602873-PromptEngineeringToolCalling`
- URL repo, nhánh nộp, commit chốt: https://github.com/tom-e666/K4-L3-DAY04-ThaiPhucTien-2A202602873-PromptEngineeringToolCalling
- Deadline áp dụng và link thông báo đổi hạn nếu có:

## Thành viên

| Họ và tên | MSSV | GitHub | Vai trò và công việc | File/commit/PR |
|---|---|---|---|---|
|Thái Phúc Tiến |2A202602873 | tom-e666 | Tool, managing | https://github.com/tom-e666/K4-L3-DAY04-ThaiPhucTien-2A202602873-PromptEngineeringToolCalling/commit/133931aef0ac22d9798b7cb8714a0f2e2394c027 |
Nguyễn Đức Long | 2A202602917 | duclongt23 | prompt, tool, runs| https://github.com/tom-e666/K4-L3-DAY04-ThaiPhucTien-2A202602873-PromptEngineeringToolCalling/commit/198b1f36d091e8b16dc54e334a2026d2e8b7786a |
|Trần Đình Duy |2A202602631 | Duytd26 | UI/UX, evaluation|https://github.com/tom-e666/K4-L3-DAY04-ThaiPhucTien-2A202602873-PromptEngineeringToolCalling/commit/72e78e8857c750617fa0444e0fc21cda50a119a6|

## Nhận xét chung

- Kết quả và bằng chứng: Tỉ lệ chính xác (case_accuracy) của bộ Group Eval 10 cases cải thiện vượt bậc từ 50.0% (v0 Baseline) lên 100.0% (v3 Final). Minh chứng chi tiết lưu tại [version_log.csv](starter_v0/artifacts/version_log.csv), báo cáo [REPORT.md](starter_v0/artifacts/REPORT.md) và các file run JSON: [v3_B_base_openrouter_20260915T185411871703.json](starter_v0/runs/v3_B_base_openrouter_20260915T185411871703.json) (10/10 PASS) cùng [v3_B_adversarial_openrouter_20260915T185705801441.json](starter_v0/runs/v3_B_adversarial_openrouter_20260915T185705801441.json) (8/12 PASS).
- Thay đổi hiệu quả nhất: Bổ sung các quy tắc rõ ràng trong [system_prompt.md](starter_v0/artifacts/system_prompt.md): (1) Giữ nguyên từ khóa người dùng khi tìm KB; (2) Ép buộc dùng tool `clarify` (choice) khi môi trường mơ hồ; (3) Siết chặt Action Boundary bằng `clarify` (yes_no) trước khi tạo ticket; và (4) Tôn trọng lệnh HỦY của người dùng mà không kích hoạt tool.
- Giới hạn còn lại: Với bộ Adversarial Red-Team, một số ca tấn công nhúng pseudo-code phức tạp đòi hỏi kiểm soát và lọc dữ liệu nhạy cảm kỹ lưỡng hơn nữa ở tầng code adapter.
- Cách phân công và tích hợp: Nhóm phân công rõ ràng: Thái Phúc Tiến (Trưởng nhóm, quản lý repo, tích hợp tool & tối ưu prompt v3), Nguyễn Đức Long (phát triển prompt, chạy thực nghiệm runs & version log), Trần Đình Duy (thiết kế UI/UX Demo Console & kiểm thử). Tích hợp liên tục thông qua quy trình Git Rebase và chạy script kiểm thử tự động `run_eval.py`.

## INDIVIDUAL

### Thái Phúc Tiến — 2A202602873

- Phần việc và file/commit/PR: Trưởng nhóm, quản lý repo, tối ưu [system_prompt.md](starter_v0/artifacts/system_prompt.md) v3 (đạt 100% PASS), chuẩn hóa bộ [eval_group.json](starter_v0/data/eval_group.json) và xây dựng Next.js Chat UI. Commit: [133931a](https://github.com/tom-e666/K4-L3-DAY04-ThaiPhucTien-2A202602873-PromptEngineeringToolCalling/commit/133931aef0ac22d9798b7cb8714a0f2e2394c027).
- Quyết định, khó khăn và cách xử lý: Gặp lỗi mismatch chuỗi query và tự động gọi `create_ticket` khi chưa được người dùng xác nhận ở v2. Xử lý bằng cách bổ sung quy tắc phân định Read/Write tool, buộc dùng `clarify` (yes_no) và giữ nguyên từ khóa tìm kiếm KB.
- Điều đã học: Hiểu sâu về cơ chế Native Tool Calling của LLM, kỹ thuật Prompt Engineering dựa trên dữ liệu thực nghiệm (Empirical Evidence) và kỹ năng giải quyết xung đột Git Rebase khi làm việc nhóm.
- AI/công cụ đã dùng và cách kiểm tra: OpenRouter API (gpt-4o-mini), Antigravity AI assistant, kiểm tra trực tiếp qua `run_eval.py`.
- Thời điểm đã tự nộp URL repo chung trên VLearn: 19:40 ngày 15/09/2026.

### Nguyễn Đức Long — 2A202602917

- Phần việc và file/commit/PR:
  - Phân tích log test case sai và trực tiếp tối ưu 2 file: `system_prompt.md` và `tools.yaml`.
  - Link commit: [198b1f3](https://github.com/tom-e666/K4-L3-DAY04-ThaiPhucTien-2A202602873-PromptEngineeringToolCalling/commit/198b1f36d091e8b16dc54e334a2026d2e8b7786a), [5dba6bb](https://github.com/tom-e666/K4-L3-DAY04-ThaiPhucTien-2A202602873-PromptEngineeringToolCalling/commit/5dba6bb131b6a287fb85a609530ff700e4c2c031).

- Quyết định, khó khăn và cách xử lý:
  - LLM tự bịa ID mẫu (LT-XXXX, EMP-XXXX), gọi nhầm tool khi thiếu ID hoặc bỏ trống category khi tìm KB.
  - Xử lý: Thêm quy tắc cấm dùng chuỗi mẫu (bắt buộc gọi clarify khi thiếu ID), phân định rõ luồng phụ thuộc dữ liệu và bổ sung ánh xạ category cho `search_kb`.

- Điều đã học:
  - Kỹ năng phân tích log JSON để tìm lỗi gốc rễ (Root Cause) của Tool Calling.
  - Tư duy thiết kế System Prompt & Tool Schema chuẩn kiến trúc (Type Safety, Anti-Hallucination, Tool Boundary).

- AI/công cụ đã dùng và cách kiểm tra:
  - Antigravity AI (Gemini 3.6 Flash) hỗ trợ soi log sai và gợi ý cấu trúc prompt.

- Thời điểm đã tự nộp URL repo chung trên VLearn: 19:45 ngày 15/09/2026.


### Trần Đình Duy — 2A202602631

- Phần việc và file/commit/PR:
  - Thiết kế và xây dựng UI/UX cho giao diện demo AI Agent, tập trung thể hiện conversation, tool call, tool input/output, agent trace, confirmation, error và safety flow.
  - Xây dựng và hoàn thiện team evaluation cases gồm 5 case một lượt và 5 case nhiều lượt trong `starter_v0/data/eval_group.json`.
  - Hỗ trợ kiểm thử giao diện, kiểm tra các luồng demo và tổng hợp evidence cho báo cáo.
  - File/commit chính: `starter_v0/data/eval_group.json`, UI/UX files; commit: `feat: build AI agent demo dashboard UI/UX`.

- Quyết định, khó khăn và cách xử lý:
  - Ưu tiên thiết kế UI theo mục tiêu của bài lab: không chỉ hiển thị câu trả lời mà phải làm rõ quá trình tool calling và observable agent behavior.
  - Gặp conflict khi đồng bộ branch `main` với thay đổi của teammate; xử lý bằng cách kiểm tra branch, đồng bộ remote và tách phần phát triển UI trên branch cá nhân `feature/duytd` trước khi merge.
  - Với UI, giữ phạm vi ở frontend/presentation layer, không thay đổi agent loop, tool implementation hoặc evaluation logic.

- Điều đã học:
  - Hiểu rõ hơn cách thiết kế giao diện cho AI Agent thay vì chatbot thông thường.
  - Hiểu vai trò của tool call, tool input, tool result, confirmation và multi-turn interaction trong việc đánh giá agent.
  - Cải thiện kỹ năng làm việc với Git branch, merge, conflict resolution và phối hợp code trong nhóm.

- AI/công cụ đã dùng và cách kiểm tra:
  - Sử dụng AI coding assistant để hỗ trợ thiết kế và triển khai UI/UX.
  - Sử dụng VS Code/Antigravity để phát triển và kiểm tra giao diện.
  - Sử dụng Git/GitHub để quản lý branch và commit.
  - Kiểm tra bằng cách chạy UI local, kiểm tra các scenario/demo flow, quan sát tool call/trace states và kiểm tra thay đổi bằng Git.
