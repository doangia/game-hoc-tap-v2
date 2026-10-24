# Game Học Tập v2 — Phase 0: Thiết kế nền tảng (đã duyệt phạm vi, chưa phải Phase 2–6)

> Tài liệu này thuộc nhánh `v2`, tách biệt v1 (`main`, site live hiện tại).
> Không push, không deploy, không tag trong phạm vi Phase 0 + Phase 1.
> Mọi bảng XP / xu / cấp độ dưới đây đều là **đề xuất khởi điểm**,
> cần cân bằng lại sau khi thử với học sinh thật, không phải con số chốt vĩnh viễn.

## 1. Điểm xuất phát (baseline v1, commit 8230be7)

Hồ sơ v1 chỉ có: `name, grade, lop, totalStars, best` (kỷ lục sao từng chủ đề,
khóa `grade|subjectId|topicId`). Nhân vật cố định là cú 🦉, không có XP, cấp độ,
xu, nhân vật để chọn, nhiệm vụ, chuỗi ngày, cửa hàng hay trang bị. Một lượt chơi
10 màn, đúng lần đầu được sao, sai được xem giải thích và thử lại câu tương tự
(câu thử lại không tính sao). Đây là nền mà Phase 1 xây lên, không phá đi.

## 2. Bảng kinh nghiệm (XP) — đề xuất khởi điểm

| Hành động học tập | XP |
|---|---|
| Trả lời đúng lần đầu (mỗi sao trong lượt) | 10 XP / sao |
| Chuỗi 3 câu đúng liên tiếp trong một lượt | +5 XP mỗi lần chạm mốc 3, 6, 9… |
| Hoàn thành nhiệm vụ ngày (kiểu nhiệm vụ, **chưa làm ở Phase 1**) | 20 XP / nhiệm vụ (đề xuất, để Phase 3) |
| Lặp lại cùng chủ đề trong cùng ngày | Lượt 1: 100% XP gốc; lượt 2: 50%; lượt 3 trở đi: 25% |
| Đoán nhanh / lặp vô hạn để cày | 0 XP thêm — hệ số giảm dần ở trên là cơ chế chống cày chính |

Quy tắc đi kèm:

- XP chỉ tính trên sao đúng lần đầu và chuỗi đúng; câu thử lại không tính sao
  thì cũng không sinh thêm XP chuỗi.
- Hệ số giảm dần chỉ áp dụng cho XP gốc từ sao, không trừ phần thưởng chuỗi
  (chuỗi vẫn là hành vi học thật trong lượt đó).
- Không có XP cho việc chỉ mở game, chỉ bấm nút, hay trả lời sai.

## 3. Bảng xu (coins) — chỉ kiếm bằng học, không tiền thật

| Nguồn | Xu |
|---|---|
| XP kiếm được trong lượt | 1 xu / mỗi 10 XP (làm tròn xuống) |
| Chuyển đổi sao cũ (một lần duy nhất, xem mục 5) | 1 xu / mỗi sao cũ |

Không có mua xu bằng tiền thật, không có đổi xu lấy điểm số, không có tặng xu
giữa người chơi. Xu ở Phase 1 chỉ là số dư hiển thị; cửa hàng và trang bị
thuộc Phase 4, chưa làm.

## 4. Bảng cấp độ (áp dụng chung cho cấp người chơi và cấp từng môn)

| Cấp | XP tối thiểu | XP cần để lên cấp tiếp theo |
|---|---|---|
| 1 | 0 | 100 |
| 2 | 100 | 150 |
| 3 | 250 | 200 |
| 4 | 450 | 250 |
| 5 | 700 | 300 |
| 6 | 1000 | 350 |
| 7 | 1350 | 400 |
| 8 | 1750 | 450 |
| 9 | 2200 | 500 |
| 10 | 2700 | 600 |
| 11 trở đi | 2700 + (cấp − 10) × 600 | 600 mỗi cấp |

Cấp được tính lại từ XP mỗi khi cần (không tin vào con số cấp lưu sẵn nếu nó
lệch khỏi XP). Thanh XP ở thanh hồ sơ hiển thị phần trăm tới cấp tiếp theo.

## 5. Chuyển đổi hồ sơ v1 → v2 (một lần duy nhất, không cộng dồn)

- Hồ sơ v1 (không có cờ `v2migrated`) khi nạp lần đầu sẽ được chuyển đổi:
  `xp = totalStars × 10`, `coins = totalStars × 1`, `character = "owl"`,
  `tone = "teen"` nếu lớp 6–12, `"kids"` nếu lớp 1–5, `subjectXp = {}`,
  rồi đánh dấu `v2migrated = true` và lưu lại.
- `totalStars` và `best` giữ nguyên tuyệt đối, không tính lại, không xóa.
- Hồ sơ đã có `v2migrated = true` thì không bao giờ cộng chuyển đổi lần nữa,
  dù nạp lại bao nhiêu lần hay đổi tên/lớp.
- Hồ sơ mới tạo ở Phase 1 sinh ra đã ở dạng v2 (`xp = 0, coins = 0,
  v2migrated = true`); nếu trùng tên + lớp với hồ sơ cũ trên máy thì kế thừa
  toàn bộ hồ sơ cũ đã chuyển đổi, không tạo hồ sơ trắng đè lên.

## 6. Giọng điệu theo tuổi (tone) — chỉ ở thanh hồ sơ và màn kết quả

- Lớp 1–5 mặc định `kids`: giữ nguyên lời khen và tiêu đề kết quả của v1.
- Lớp 6–12 mặc định `teen`: tiêu đề kết quả bình tĩnh hơn
  (ví dụ 9–10 sao: “Xuất sắc!” thay vì “Xuất sắc! Em giỏi nhất!”;
  7–8 sao: “Tốt lắm!”; 4–6 sao: “Khá tốt, tiếp tục nhé!”;
  dưới 4 sao: “Cố gắng thêm nhé!”).
- Người chơi đổi được tone bằng nút trong thanh hồ sơ; lựa chọn được lưu.
- Không viết lại lời khen trong lúc chơi hay toàn bộ văn bản game ở Phase 1.

## 7. Ma trận độ khó (4 mức, dùng cho mọi bài về sau)

- **Nhận biết:** nhớ lại đúng tên, định nghĩa, công thức, tác giả, năm, nhân vật.
- **Thông hiểu:** giải thích bằng lời của mình, áp dụng một công thức vào số liệu
  cho sẵn trong một bước, phân biệt hai khái niệm dễ nhầm.
- **Vận dụng:** làm trọn một bài nhiều bước, dùng kiến thức vào tình huống mới
  nhưng quen thuộc, đọc hiểu một đoạn trích và trả lời câu hỏi suy luận từ đoạn đó.
- **Vận dụng cao:** nhiều bước có bẫy, tìm lỗi sai trong lời giải cho sẵn, tự lập
  biểu thức từ bài toán lời văn, so sánh / đánh giá / viết đoạn văn ngắn có lập luận.

## 8. Phân loại chủ đề thí điểm 1 — Toán lớp 8, Chương I: Đa thức (Bài 1–5)

Chủ đề trong game là `m8-c1` (gộp Bài 1–5, không tách riêng từng bài).

| Dạng câu / bộ sinh hiện có | Mức | Ghi chú |
|---|---|---|
| `m8MonoCoef` — hệ số của đơn thức | Nhận biết | Đáp án chính là số đứng trước biến |
| 5 câu định nghĩa `M8C1_FACTS` (đơn thức, đa thức, đồng dạng, nhân/chia) | Nhận biết | Chỉ hỏi định nghĩa |
| `m8MonoDeg` — bậc đơn thức = tổng số mũ | Thông hiểu | Một bước cộng số mũ nhỏ (m 1–4, n 0–3) |
| `m8AddPoly` — chỉ hỏi hệ số của x² hoặc x sau khi cộng | Thông hiểu | Không hỏi tổng đầy đủ |
| `m8MulMono` — chỉ hỏi hệ số hoặc số mũ của tích | Thông hiểu | Không hỏi tích đầy đủ |
| `m8DivMono` — chỉ hỏi hệ số của thương | Thông hiểu | Không hỏi thương đầy đủ |
| `m8PolyValue` — tính giá trị đa thức x² + ax + b tại x nhỏ (2–5) | Vận dụng (thấp) | Thay số và tính, một biến, số nhỏ |
| Nối đơn thức với bậc (4 cặp cố định) | Nhận biết | Lặp lại cùng 4 cặp |
| Đúng/Sai về định nghĩa, Bắt đáp án về bậc/hệ số | Nhận biết / Thông hiểu | Cùng kiến thức với các dạng trên |

Kết luận Toán Chương I: có Nhận biết và Thông hiểu, chỉ có một dạng Vận dụng
thấp, **không có Vận dụng cao**.

Thiếu ở Vận dụng (Phase 2 cần thêm):

- Thu gọn đa thức nhiều hạng tử rồi cho kết quả đầy đủ, tìm bậc của đa thức
  sau khi thu gọn.
- Cộng / trừ / nhân / chia đa thức cho kết quả đầy đủ, không chỉ hỏi một hệ số.
- Tính giá trị với số âm, hệ số âm, hoặc sau khi thu gọn trước rồi mới thay số.

Thiếu ở Vận dụng cao (Phase 2 cần thêm):

- Bài toán lời văn: tự lập biểu thức rồi thu gọn / tính giá trị.
- Tìm hệ số còn thiếu khi biết giá trị của đa thức tại một điểm.
- Tìm lỗi sai trong một lời giải thu gọn / nhân / chia cho sẵn và sửa lại.

## 9. Phân loại chủ đề thí điểm 2 — Ngữ văn lớp 8, Bài 1: Câu chuyện của lịch sử

Chủ đề trong game là `nv8-b1`: 32 câu hỏi kiến thức + 2 bộ nối
(nối tác phẩm–tác giả, nối tác phẩm–mô tả).

| Nhóm câu hiện có | Mức | Số lượng / ví dụ |
|---|---|---|
| Tác giả / tác phẩm / thể loại / năm / nhân vật / địa danh / chi tiết (sáu chữ vàng, chỉ vàng, Hội nghị Diên Hồng, Ngọc Hồi – Đống Đa…) | Nhận biết | Khoảng 29/32 câu |
| Ý nghĩa hình ảnh lá cờ, không khí chung của Bài 1, vì sao Trần Quốc Toản bóp nát quả cam | Thông hiểu | 3/32 câu |
| Nối tác phẩm với tác giả / mô tả | Nhận biết | 2 bộ nối, nội dung trùng với 32 câu trên |
| Đọc hiểu đoạn trích chưa gặp, phân tích biện pháp nghệ thuật, so sánh hai văn bản, viết đoạn văn | — | **Chưa có** |

Lưu ý trùng lặp: cùng một kiến thức xuất hiện nhiều lần dưới dạng hỏi khác nhau
(ví dụ sáu chữ vàng hỏi 2 lần, tác giả “Ta đi tới” hỏi 2 lần, tác giả “Minh sư”
hỏi 2 lần), nên một lượt 10 câu bao phủ ít kiến thức mới hơn con số 32 gợi ý.

Kết luận Ngữ văn Bài 1: gần như chỉ có Nhận biết, một ít Thông hiểu,
**không có Vận dụng và không có Vận dụng cao**.

Thiếu ở Vận dụng (Phase 2 cần thêm):

- Đọc hiểu một đoạn trích (có thể là đoạn mới, không phải đoạn đã học) với câu
  hỏi suy luận từ chi tiết trong đoạn.
- Phân tích tác dụng của một chi tiết / hình ảnh / biện pháp nghệ thuật trong
  đoạn trích.
- So sánh cách thể hiện cùng một chủ đề lịch sử ở hai văn bản.

Thiếu ở Vận dụng cao (Phase 2 cần thêm):

- Viết đoạn văn ngắn (nêu cảm nhận / phân tích nhân vật / nghị luận về một
  ý kiến) và tự đánh giá theo dàn ý cho sẵn.
- Đánh giá quan điểm: đồng ý hay không đồng ý với một nhận xét về tác phẩm,
  kèm lí lẽ từ văn bản.

## 10. Phạm vi Phase 1 (đã làm, xem commit riêng) và bàn giao cho Phase 2

Phase 1 chỉ gồm: chọn nhân vật, hồ sơ v2 + chuyển đổi một lần, thanh XP / cấp /
xu ở thanh hồ sơ, thông báo lên cấp ở màn kết quả, tone teen/kids ở thanh hồ sơ
và màn kết quả, và cơ chế XP / hệ số giảm dần cho lượt lặp cùng ngày.
**Chưa làm:** cửa hàng, trang bị, nhiệm vụ, chuỗi ngày, thành tích, đề mô phỏng
kiểm tra, nội dung Vận dụng / Vận dụng cao mới, xã hội lớp học.

Phase 2 bắt đầu từ mục 8 và 9 ở trên: viết dạng câu mới cho đúng hai chủ đề thí
điểm, gắn nhãn mức độ cho từng dạng câu, rồi mới nhân rộng ra các bài khác.
Không nhân rộng nội dung mới khi hai chủ đề thí điểm chưa được học sinh lớp 8
thử lại và xác nhận là đủ khó để ôn kiểm tra.
