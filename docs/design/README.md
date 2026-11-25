# Bản thiết kế màn hình — ReflexVocab Screens

Bản sao cục bộ của canvas **ReflexVocab Screens** (Design artifact trên claude.ai, bản `1795585145-9108`, xuất ngày 25/11/2026). Đặc tả thiết kế và token nằm ở [DESIGN.md](../../DESIGN.md); canvas là mockup để đối chiếu, **không thay requirement hoặc trạng thái trong PROGRESS**.

- Nguồn: https://claude.ai/artifact/F9e2hfGmFZeekqLfM7Lg6C (riêng tư, cần quyền truy cập).
- `canvas.json`: bố cục canvas — trang, vị trí/kích thước từng board, ghi chú phạm vi.
- `*.dc.html`: từng board, HTML tĩnh với style inline; link giữa các board (luồng prototype) dùng đường dẫn tương đối. Mỗi file nạp `./support.js` — runtime của canvas Design, không có trong repo. Font tải từ Google Fonts (DM Sans, Manrope).
- Thư mục này nằm trong `.prettierignore` để giữ nguyên bản xuất. Khi canvas đổi, tải lại toàn bộ thay vì sửa tay ở đây.

## Cách áp dụng vào implementation hiện tại

1. Dùng board để đối chiếu bố cục, phân cấp, responsive và các trạng thái tương tác. Dùng [REQUIREMENTS](../REQUIREMENTS.md) cho hành vi, [PLAN](../PLAN.md#mvp-screen-coverage) cho task sở hữu và [PROGRESS](../PROGRESS.md) cho trạng thái thực tế.
2. Copy tiếng Việt trong board là đầu vào tham khảo cho locale `vi`, không phải bản dịch đã review. Mọi màn hình phải dùng i18n với đủ `en` và `vi`; tiếng Anh là mặc định/fallback. Locale giao diện và Vietnamese learning gloss là hai khái niệm độc lập.
3. Các số `12 nghĩa từ`, `3 chủ đề`, tỷ lệ, streak và lịch trong board là dữ liệu mẫu để kiểm tra layout. UI phải đọc dữ liệu đã lưu và hiển thị empty/insufficient-data state khi chưa có dữ liệu.
4. Nhãn “đã có trong base” mô tả codebase nguồn tại thời điểm tạo artifact, **không** có nghĩa scaffold hiện tại đã implement màn đó.
5. `M02–M05` là mã task cũ trong artifact: session/intro thuộc [P03-T02](../phases/PHASE_03_LEARNING_EXPERIENCE.md#p03-t02), lesson thuộc [P04-T05](../phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t05), progress/motivation thuộc [P05-T01/P05-T02](../phases/PHASE_05_MVP_COMPLETION.md#p05-t01), và mở rộng content thuộc [P05-T03](../phases/PHASE_05_MVP_COMPLETION.md#p05-t03).
6. **ĐỀ XUẤT** chỉ đề xuất cách thể hiện. Nếu requirement bắt buộc hành vi tương ứng, task phải implement hành vi nhưng không tự động phải dùng đúng treatment đề xuất; phần không có requirement vẫn ngoài scope.

Các ghi chú bên dưới chép lại nội dung canvas để bảo toàn handoff; khi có khác biệt, sáu quy tắc trên là cách diễn giải hiện hành.

## Đăng nhập & Onboarding

_Đăng nhập → onboarding 3 bước → phiên đầu tiên_

| Board | File | Khung |
|---|---|---|
| Đăng nhập | [Login.dc.html](Login.dc.html) | 1440×900 |
| Onboarding 1/3 · thời lượng (MVP) | [OB-Time.dc.html](OB-Time.dc.html) | 1440×900 |
| Onboarding 2/3 · từ mới mỗi ngày (MVP) | [OB-NewWords.dc.html](OB-NewWords.dc.html) | 1440×900 |
| Onboarding 3/3 · chủ đề đầu tiên (MVP) | [OB-Topic.dc.html](OB-Topic.dc.html) | 1440×900 |

Ghi chú trên canvas:

> Onboarding = luồng MVP trong FLOW §2 (đăng nhập → chọn thời lượng/từ mới → học). Base hiện chưa có.
>
> • Mỗi bước ghi vào setting thật: dailyMinutes, newPerDay; bước 3 chỉ chọn chủ đề cho phiên đầu (SessionConfig.topic).
> • Luôn có “Bỏ qua, dùng mặc định”; không hỏi điểm TOEIC, không placement.
> • Học từ flow welcome của Brilliant: progress bar trên cùng, một câu hỏi, thẻ lựa chọn lớn, nút Tiếp tục 3D cố định vị trí.

## Dashboard · Desktop

_Dashboard — sáng, sặc sỡ, top nav (hướng Brilliant)_

| Board | File | Khung |
|---|---|---|
| Hôm nay · / | [Main.dc.html](Main.dc.html) | 1440×1100 |
| Kho từ · /library | [Library.dc.html](Library.dc.html) | 1440×1200 |
| Tiến độ · /progress | [Progress.dc.html](Progress.dc.html) | 1440×1200 |
| Cài đặt · /settings | [Settings.dc.html](Settings.dc.html) | 1440×1200 |

Ghi chú trên canvas:

> Phạm vi nhãn
> • Không ghi chú = hành vi đã có trong base (src/pages); chỉ đổi hình thức.
> • MVP = mục tiêu trong REQUIREMENTS / TASKS M02–M05, chưa có code.
> • ĐỀ XUẤT = UI_UX_REQUIREMENTS §4, chưa vào scope.
>
> Trên các màn này:
> • Hôm nay: dòng giải thích phiên đề xuất = ĐỀ XUẤT.
> • Lộ trình và Luyện tập: xem trang “Học & Luyện tập”.
> • Kho từ: mở chi tiết trong hàng = ĐỀ XUẤT.
> • Tiến độ: retention quan sát + mốc thành thạo = MVP (M03/M05).
>
> Màu chủ đề (xanh/ cam/ tím) chỉ để nhận diện chủ đề, luôn kèm tên. Số liệu minh họa theo sample pack 12 nghĩa từ / 3 chủ đề.

## Học & Luyện tập · Desktop

_Học & Luyện tập — Lộ trình → Bài học → Hoàn thành bài · Luyện tập → Phiên → Kết quả_

| Board | File | Khung |
|---|---|---|
| Lộ trình · /learn | [Learn.dc.html](Learn.dc.html) | 1440×1400 |
| Chi tiết bài học (MVP · M02) | [Lesson.dc.html](Lesson.dc.html) | 1440×1250 |
| Hoàn thành bài (MVP · M02) | [Lesson-Complete.dc.html](Lesson-Complete.dc.html) | 1440×900 |
| Luyện tập · /practice | [Practice.dc.html](Practice.dc.html) | 1440×1350 |
| Phiên “Thử lại từ từng sai” | [Practice-Session.dc.html](Practice-Session.dc.html) | 1440×900 |
| Kết quả phiên luyện tập | [Practice-Summary.dc.html](Practice-Summary.dc.html) | 1440×1000 |

Ghi chú trên canvas:

> Cấu trúc theo REQUIREMENTS R03–R04: Khóa → Cấp độ → Chủ đề → Bài → Nghĩa từ.
>
> • Lộ trình: mọi bài đều mở, không khóa. “Hoàn thành bài” (đã gặp mọi nghĩa từ) và “thành thạo” hiển thị tách riêng. Lớp Bài + Gợi ý tiếp = MVP (M02); base hiện chỉ có danh sách chủ đề.
> • Chi tiết bài + Hoàn thành bài = MVP (M02). Sample pack có 1 bài/chủ đề, bài chuẩn sau M04 nhắm 8–10 nghĩa từ.
> • Luyện tập: preset và phần tự chọn giữ đúng SessionConfig của base (preset, topic, kind, count, senseIds); chỉ đổi dropdown thành thẻ chọn.
> • Phiên “Thử lại từ từng sai”: chip chế độ + “Ngữ cảnh mới” = MVP (R06/FLOW §4).
> • Kết quả luyện tập: thông điệp lịch ôn theo Qualified Learning Evidence (R09–R10).
>
> Prototype: Lộ trình → Xem bài → Tiếp tục bài học → phiên học. Luyện tập → Thử lại từ từng sai → Kiểm tra → Kết quả.

## Phiên học · Desktop

_Phiên học — một câu mỗi lượt, phản hồi ngay_

| Board | File | Khung |
|---|---|---|
| Giới thiệu từ mới (MVP · M02) | [Session-Intro.dc.html](Session-Intro.dc.html) | 1440×900 |
| Chọn định nghĩa · đã chọn | [Session-Definition.dc.html](Session-Definition.dc.html) | 1440×900 |
| Chọn từ điền câu · mở gợi ý | [Session-ClozeHint.dc.html](Session-ClozeHint.dc.html) | 1440×900 |
| Gõ từ còn thiếu | [Session-Typing.dc.html](Session-Typing.dc.html) | 1440×900 |
| Sắp xếp câu | [Session-Sentence.dc.html](Session-Sentence.dc.html) | 1440×900 |
| Phản hồi đúng · đã lưu | [Feedback-Correct.dc.html](Feedback-Correct.dc.html) | 1440×900 |
| Phản hồi sai · đang lưu | [Feedback-Incorrect.dc.html](Feedback-Incorrect.dc.html) | 1440×900 |
| Lưu lỗi · thử lại | [Feedback-SyncError.dc.html](Feedback-SyncError.dc.html) | 1440×900 |
| Kết thúc phiên | [Session-Summary.dc.html](Session-Summary.dc.html) | 1440×900 |
| Ghép cụm từ | [Session-Collocation.dc.html](Session-Collocation.dc.html) | 1440×900 |

Ghi chú trên canvas:

> Luồng prototype (Play): Giới thiệu → Chọn định nghĩa → Kiểm tra → Phản hồi đúng → Tiếp tục → …
>
> • Năm dạng bài dùng chung một renderer; collocation dùng cùng danh sách đáp án như chọn định nghĩa (xem board Ghép cụm từ).
> • Lưu xong mới mở Tiếp tục; nhãn trạng thái lưu luôn nằm cạnh nút.
> • Lộ đáp án = lượt có hỗ trợ, không tô như bằng chứng nhớ.
> • MVP: màn giới thiệu từ mới (M02), dòng “Gặp lại sau vài câu” và “Lần học sau” ở summary.

## Mobile

_Mobile 390 — tab bar dưới, phiên học không điều hướng phụ_

| Board | File | Khung |
|---|---|---|
| Hôm nay | [M-Home.dc.html](M-Home.dc.html) | 390×1500 |
| Lộ trình | [M-Learn.dc.html](M-Learn.dc.html) | 390×1400 |
| Luyện tập | [M-Practice.dc.html](M-Practice.dc.html) | 390×1250 |
| Kho từ | [M-Library.dc.html](M-Library.dc.html) | 390×1500 |
| Tiến độ | [M-Progress.dc.html](M-Progress.dc.html) | 390×1500 |
| Cài đặt | [M-Settings.dc.html](M-Settings.dc.html) | 390×1150 |
| Đăng nhập | [M-Login.dc.html](M-Login.dc.html) | 390×844 |
| Onboarding 1/3 (MVP) | [M-Onboarding.dc.html](M-Onboarding.dc.html) | 390×844 |
| Ghép cụm từ | [M-Session.dc.html](M-Session.dc.html) | 390×844 |
| Sắp xếp câu | [M-Sentence.dc.html](M-Sentence.dc.html) | 390×844 |
| Phản hồi sai | [M-Feedback.dc.html](M-Feedback.dc.html) | 390×960 |
| Kết thúc phiên | [M-Summary.dc.html](M-Summary.dc.html) | 390×844 |
| Chi tiết bài (MVP) | [M-Lesson.dc.html](M-Lesson.dc.html) | 390×1500 |
| Hoàn thành bài (MVP) | [M-LessonComplete.dc.html](M-LessonComplete.dc.html) | 390×844 |
| Kết quả luyện tập | [M-PracticeSummary.dc.html](M-PracticeSummary.dc.html) | 390×1100 |

## Trạng thái

_Trạng thái: rỗng, đang tải, lỗi, conflict_

| Board | File | Khung |
|---|---|---|
| Trạng thái dashboard | [States-Dashboard.dc.html](States-Dashboard.dc.html) | 1280×1560 |
| Trạng thái phiên học | [States-Session.dc.html](States-Session.dc.html) | 1280×1400 |
