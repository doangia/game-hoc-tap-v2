/* ================================================================
   GAME HỌC TẬP v2 — TỦ ĐỒ + HỘP QUÀ (bản chức năng, 25/10)
   - Nhân vật chính là NGƯỜI (nam/nữ), KHÔNG phải thú. Người chơi
     chọn giới tính lúc tạo nhân vật, đổi lại được trong Hồ sơ /
     tủ đồ; KHÔNG BAO GIỜ tự gán giới tính. Người chơi cũ chưa có
     giới tính sẽ thấy màn chọn Nam/Nữ một lần duy nhất (gate) khi
     mở game sau cập nhật; thú đã chọn trước đây (cú/mèo/cáo/
     rô-bốt, kể cả skin rồng/kỳ lân/cánh cụt đã mua) chuyển thành
     thú cưng, không bị xóa.
   - ASSET TẠM (ghi rõ, không giả vờ đã xong): đợt này dùng emoji
     + CSS để bấm và kiểm tra chức năng. Búp bê xem trước là hình
     cột emoji xếp lớp (mũ, đầu, áo/khoác, quần/váy, giày, phụ
     kiện, thú cưng) trên nền phòng, chưa phải búp bê vẽ SVG toàn
     thân. Bước thiết kế asset SVG chi tiết (phong cách thống
     nhất, thứ tự lớp vẽ, danh mục đủ) để CUỐI CÙNG theo lệnh
     25/10, chưa làm trong đợt này.
   - Đồ CHỈ TRANG TRÍ: không đổi điểm, XP, gợi ý, trợ giúp hay độ
     khó. Tủ đồ không bao giờ hiện trong màn chơi hay overlay mô
     phỏng (chỉ ở tab Cửa hàng lớp 6-12 và tab Hồ sơ lớp 1-5).
   - Hộp quà: nội dung CỐ ĐỊNH, hiện rõ toàn bộ trước khi mở,
     nhận đúng 1 lần mỗi mốc — không ngẫu nhiên, không loot box.
   - Không đổi kinh tế cũ: vẫn 10 XP/sao, 1 xu/10 XP, ngưỡng cấp
     100/250/450/700/1000/1350/1750/2200/2700 rồi +600 mỗi cấp.
   - File chạy được cả trong trình duyệt và trong Node để kiểm
     chứng (không chạm document ở lúc nạp, trừ khi initUi chạy
     và document tồn tại).
   ================================================================ */
(function () {
  var root = (typeof window !== "undefined") ? window : (typeof global !== "undefined" ? global : this);
  function escHtml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function levelForXp(xp) {
    try {
      if (root.__v2 && typeof root.__v2.levelForXp === "function") return root.__v2.levelForXp(xp);
    } catch (e) {}
    var T = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700];
    xp = Math.max(0, Math.floor(xp || 0)); var lvl = 1, i;
    for (i = 0; i < T.length; i++) { if (xp >= T[i]) lvl = i + 1; }
    if (xp >= 2700) lvl = 10 + Math.floor((xp - 2700) / 600);
    return lvl;
  }
  /* ---------------- Danh mục ----------------
     slot: hair, face (kính), shirt, coat, bottom (quần/váy),
     shoes, hat, accessory, background, pet.
     gender: "both" | "male" | "female". kind "dress" (váy liền)
     nằm ở slot bottom và che hàng áo khi xem trước.
     source: shop (mua được) | newcomer | box | gift | migration.
     Giá theo khung đã chốt: thường 20-40 xu cấp 1, hiếm 80-150
     xu cấp 3-4, đặc biệt 200-300 xu cấp 5+ (đợt này chưa có món
     shop nào ở mức đặc biệt — đồ đặc biệt chỉ nằm trong hộp
     mốc cao và quà nhiệm vụ khó). Màu sắc là lựa chọn miễn phí,
     không phải món mua riêng. */
  var HAIR_COLORS = [{ n: "Đen", c: "#33302a" }, { n: "Nâu", c: "#7b4a2b" }, { n: "Nâu vàng", c: "#c68b4e" }, { n: "Nâu đỏ", c: "#8d3b2f" }];
  var CLOTH_COLORS = [{ n: "Trắng", c: "#ffffff" }, { n: "Xanh dương", c: "#4dabf7" }, { n: "Đỏ", c: "#ff6b4a" }, { n: "Xanh lá", c: "#5cb85c" }, { n: "Vàng", c: "#ffb703" }, { n: "Hồng", c: "#f06595" }];
  function I(id, slot, name, emoji, gender, themes, price, level, colors, kids, source, kind) {
    return { id: id, slot: slot, name: name, emoji: emoji, gender: gender, themes: themes || [], price: price || 0, level: level || 1, colors: colors || CLOTH_COLORS, kids: !!kids, source: source || "shop", kind: kind || "" };
  }
  var ITEMS = {};
  function add(it) { ITEMS[it.id] = it; return it; }
  /* Tóc */
  add(I("hair-m-short", "hair", "Tóc ngắn gọn", "👦", "male", ["school"], 20, 1, HAIR_COLORS, true));
  add(I("hair-m-side", "hair", "Tóc mái lệch", "🧑", "male", ["school", "party"], 30, 1, HAIR_COLORS, false));
  add(I("hair-m-curly", "hair", "Tóc xoăn nhẹ", "🧑‍🦱", "male", ["party"], 30, 1, HAIR_COLORS, false));
  add(I("hair-m-spike", "hair", "Tóc vuốt cao", "👨", "male", ["sport"], 40, 1, HAIR_COLORS, false));
  add(I("hair-f-long", "hair", "Tóc dài thẳng", "👧", "female", ["school"], 20, 1, HAIR_COLORS, true));
  add(I("hair-f-pony", "hair", "Tóc đuôi ngựa", "👱‍♀️", "female", ["sport"], 30, 1, HAIR_COLORS, true));
  add(I("hair-f-bun", "hair", "Tóc búi cao", "👩", "female", ["party"], 30, 1, HAIR_COLORS, false));
  add(I("hair-f-bob", "hair", "Tóc ngắn ngang vai", "👩", "female", ["school"], 30, 1, HAIR_COLORS, false));
  add(I("hair-f-wave", "hair", "Tóc xoăn sóng", "🧑‍🦰", "female", ["party"], 40, 1, HAIR_COLORS, false));
  /* Kính (slot face) */
  add(I("face-round", "face", "Kính tròn", "👓", "both", ["school"], 30, 1, CLOTH_COLORS, true));
  add(I("face-square", "face", "Kính vuông", "🥽", "both", ["school"], 40, 1, CLOTH_COLORS, false));
  add(I("face-sun", "face", "Kính râm", "🕶️", "both", ["sport", "party"], 80, 3, CLOTH_COLORS, false));
  add(I("face-star", "face", "Kính ngôi sao", "🤩", "both", ["party"], 80, 3, CLOTH_COLORS, false));
  /* Áo */
  add(I("shirt-tee", "shirt", "Áo thun", "👕", "both", ["school"], 20, 1, CLOTH_COLORS, true));
  add(I("shirt-formal", "shirt", "Áo sơ mi", "👔", "both", ["school"], 30, 1, CLOTH_COLORS, true));
  add(I("shirt-sport", "shirt", "Áo thể thao", "🎽", "both", ["sport"], 30, 1, CLOTH_COLORS, true));
  add(I("shirt-trad", "shirt", "Áo bà ba", "👔", "male", ["traditional"], 120, 4, CLOTH_COLORS, false));
  /* Áo khoác */
  add(I("coat-wind", "coat", "Áo khoác gió", "🧥", "both", ["sport", "school"], 80, 3, CLOTH_COLORS, false));
  add(I("coat-wool", "coat", "Áo khoác len", "🧥", "both", ["school"], 100, 4, CLOTH_COLORS, false));
  add(I("coat-lab", "coat", "Áo khoác nhà khoa học", "🥼", "both", ["school"], 150, 4, CLOTH_COLORS, false));
  /* Quần */
  add(I("pants-short", "bottom", "Quần short", "🩳", "both", ["sport"], 20, 1, CLOTH_COLORS, true));
  add(I("pants-long", "bottom", "Quần dài", "👖", "both", ["school"], 30, 1, CLOTH_COLORS, true));
  add(I("pants-jean", "bottom", "Quần jean", "👖", "both", ["school", "party"], 80, 3, CLOTH_COLORS, false));
  /* Váy (slot bottom, kind dress: che hàng áo khi xem trước) */
  add(I("dress-short", "bottom", "Váy ngắn", "👗", "female", ["party"], 40, 1, CLOTH_COLORS, false, "shop", "dress"));
  add(I("dress-long", "bottom", "Váy dài dự tiệc", "👗", "female", ["party"], 150, 4, CLOTH_COLORS, false, "shop", "dress"));
  add(I("dress-aodai", "bottom", "Áo dài trắng", "👗", "female", ["traditional"], 120, 4, CLOTH_COLORS, false, "shop", "dress"));
  /* Giày */
  add(I("shoes-sport", "shoes", "Giày thể thao", "👟", "both", ["sport"], 20, 1, CLOTH_COLORS, true));
  add(I("shoes-doll", "shoes", "Giày búp bê", "🥿", "female", ["school", "party"], 40, 1, CLOTH_COLORS, false));
  add(I("shoes-sandal", "shoes", "Dép sandal", "🩴", "both", ["sport"], 30, 1, CLOTH_COLORS, true));
  add(I("shoes-boot", "shoes", "Giày boots", "👢", "both", ["party"], 80, 3, CLOTH_COLORS, false));
  /* Mũ */
  add(I("hat-cap", "hat", "Mũ lưỡi trai", "🧢", "both", ["sport", "school"], 20, 1, CLOTH_COLORS, true));
  add(I("hat-wide", "hat", "Mũ rộng vành", "👒", "female", ["party"], 80, 3, CLOTH_COLORS, false));
  add(I("hat-nonla", "hat", "Nón lá", "👒", "both", ["traditional"], 80, 3, CLOTH_COLORS, false));
  add(I("hat-beanie", "hat", "Mũ len", "🧢", "both", ["school"], 40, 1, CLOTH_COLORS, false));
  /* Phụ kiện */
  add(I("acc-backpack", "accessory", "Ba lô", "🎒", "both", ["school"], 30, 1, CLOTH_COLORS, true));
  add(I("acc-bag", "accessory", "Túi đeo", "👜", "female", ["party", "school"], 40, 1, CLOTH_COLORS, false));
  add(I("acc-scarf", "accessory", "Khăn quàng", "🧣", "both", ["school"], 80, 3, CLOTH_COLORS, false));
  add(I("acc-headphone", "accessory", "Tai nghe", "🎧", "both", ["sport", "party"], 80, 3, CLOTH_COLORS, false));
  add(I("acc-bracelet", "accessory", "Vòng tay", "📿", "both", ["party"], 40, 1, CLOTH_COLORS, false));
  /* Nền phòng */
  add(I("bg-classroom", "background", "Phòng học", "🏫", "both", ["school"], 20, 1, CLOTH_COLORS, true));
  add(I("bg-schoolyard", "background", "Sân trường", "🏟️", "both", ["school", "sport"], 30, 1, CLOTH_COLORS, true));
  add(I("bg-park", "background", "Công viên", "🌳", "both", ["school"], 30, 1, CLOTH_COLORS, true));
  add(I("bg-beach", "background", "Bãi biển", "🏖️", "both", ["sport", "party"], 80, 3, CLOTH_COLORS, false));
  add(I("bg-bedroom", "background", "Phòng ngủ", "🛏️", "both", ["school"], 40, 1, CLOTH_COLORS, false));
  add(I("bg-stage", "background", "Sân khấu", "🎭", "both", ["party"], 150, 4, CLOTH_COLORS, false));
  /* Thú cưng (shop) */
  add(I("pet-cat", "pet", "Mèo", "🐱", "both", [], 40, 1, CLOTH_COLORS, true));
  add(I("pet-dog", "pet", "Chó", "🐶", "both", [], 40, 1, CLOTH_COLORS, true));
  add(I("pet-rabbit", "pet", "Thỏ", "🐰", "both", [], 40, 1, CLOTH_COLORS, true));
  add(I("pet-owl", "pet", "Cú", "🦉", "both", [], 80, 3, CLOTH_COLORS, false));
  add(I("pet-fox", "pet", "Cáo", "🦊", "both", [], 80, 3, CLOTH_COLORS, false));
  add(I("pet-robot", "pet", "Rô-bốt", "🤖", "both", [], 80, 3, CLOTH_COLORS, false));
  /* Thú cưng chỉ do di chuyển từ skin cũ (không bán) */
  add(I("pet-dragon", "pet", "Rồng", "🐉", "both", [], 0, 1, CLOTH_COLORS, false, "migration"));
  add(I("pet-unicorn", "pet", "Kỳ lân", "🦄", "both", [], 0, 1, CLOTH_COLORS, false, "migration"));
  add(I("pet-penguin", "pet", "Chim cánh cụt", "🐧", "both", [], 0, 1, CLOTH_COLORS, false, "migration"));
  /* Gói tân thủ (không bán) */
  add(I("nw-shirt", "shirt", "Áo tân thủ", "👕", "both", ["school"], 0, 1, CLOTH_COLORS, true, "newcomer"));
  add(I("nw-hat", "hat", "Mũ tân thủ", "🧢", "both", ["school"], 0, 1, CLOTH_COLORS, true, "newcomer"));
  add(I("nw-bg", "background", "Phòng tân thủ", "🏫", "both", ["school"], 0, 1, CLOTH_COLORS, true, "newcomer"));
  /* Hộp mốc cấp (không bán; mỗi hộp: items + xu) */
  add(I("box5-shirt", "shirt", "Áo đồng phục Đồng", "👕", "both", ["school"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box5-hat", "hat", "Mũ lưỡi trai Đồng", "🧢", "both", ["school"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box10-coat", "coat", "Áo khoác Bạc", "🧥", "both", ["school"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box10-shoes", "shoes", "Giày thể thao Bạc", "👟", "both", ["sport"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box15-dress", "bottom", "Váy dự tiệc Vàng", "👗", "female", ["party"], 0, 1, CLOTH_COLORS, false, "box", "dress"));
  add(I("box15-suit", "shirt", "Áo vest Vàng", "👔", "male", ["party"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box15-glasses", "face", "Kính râm Vàng", "🕶️", "both", ["party"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box20-coat", "coat", "Áo choàng Kim cương", "🧥", "both", ["party"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box20-crown", "hat", "Vương miện Kim cương", "👑", "both", ["party"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box20-shoes", "shoes", "Giày Kim cương", "👟", "both", ["party"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box30-dress", "bottom", "Áo dài Huyền thoại", "👗", "female", ["traditional"], 0, 1, CLOTH_COLORS, false, "box", "dress"));
  add(I("box30-shirt", "shirt", "Áo dài nam Huyền thoại", "👔", "male", ["traditional"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box30-hat", "hat", "Nón lá Huyền thoại", "👒", "both", ["traditional"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box50-dress", "bottom", "Váy hoàng gia Huyền thoại", "👗", "female", ["party"], 0, 1, CLOTH_COLORS, false, "box", "dress"));
  add(I("box50-suit", "shirt", "Bộ hoàng gia Huyền thoại", "👔", "male", ["party"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box50-crown", "hat", "Vương miện Hoàng gia", "👑", "both", ["party"], 0, 1, CLOTH_COLORS, false, "box"));
  add(I("box50-bg", "background", "Sân khấu Hoàng gia", "🎭", "both", ["party"], 0, 1, CLOTH_COLORS, false, "box"));
  /* Quà nhiệm vụ khó (không bán, khung vàng + nhãn thành tích) */
  add(I("gift-grad", "hat", "Mũ tốt nghiệp", "🎓", "both", ["school"], 0, 1, CLOTH_COLORS, false, "gift"));
  add(I("gift-crown", "hat", "Vương miện Vàng", "👑", "both", ["party"], 0, 1, CLOTH_COLORS, false, "gift"));
  add(I("gift-wings", "accessory", "Cánh thiên thần", "🪽", "both", ["party"], 0, 1, CLOTH_COLORS, false, "gift"));
  add(I("gift-dragonpet", "pet", "Rồng nhỏ", "🐉", "both", [], 0, 1, CLOTH_COLORS, false, "gift"));

  var SLOTS = ["hair", "face", "shirt", "coat", "bottom", "shoes", "hat", "accessory", "background", "pet"];
  var SLOT_LABEL = { hair: "Tóc", face: "Kính", shirt: "Áo", coat: "Áo khoác", bottom: "Quần/Váy", shoes: "Giày", hat: "Mũ", accessory: "Túi & phụ kiện", background: "Nền", pet: "Thú cưng" };
  var SLOT_ICON = { hair: "💇", face: "👓", shirt: "👕", coat: "🧥", bottom: "👖", shoes: "👟", hat: "🎩", accessory: "👜", background: "🖼️", pet: "🐾" };
  /* Danh mục dọc theo bố cục ảnh tham chiếu: tóc, áo, áo khoác,
     quần, váy, giày, mũ, kính, túi & phụ kiện, nền, thú cưng,
     bộ nguyên set. Váy là một danh mục riêng nhưng chung slot
     bottom với quần (mặc váy thì thay quần). */
  var CATEGORIES = [
    { key: "hair", label: "Tóc", icon: "💇", slots: ["hair"] },
    { key: "shirt", label: "Áo", icon: "👕", slots: ["shirt"] },
    { key: "coat", label: "Áo khoác", icon: "🧥", slots: ["coat"] },
    { key: "pants", label: "Quần", icon: "👖", slots: ["bottom"], kind: "pants" },
    { key: "dress", label: "Váy", icon: "👗", slots: ["bottom"], kind: "dress" },
    { key: "shoes", label: "Giày", icon: "👟", slots: ["shoes"] },
    { key: "hat", label: "Mũ", icon: "🎩", slots: ["hat"] },
    { key: "face", label: "Kính", icon: "👓", slots: ["face"] },
    { key: "accessory", label: "Túi & phụ kiện", icon: "👜", slots: ["accessory"] },
    { key: "background", label: "Nền", icon: "🖼️", slots: ["background"] },
    { key: "pet", label: "Thú cưng", icon: "🐾", slots: ["pet"] },
    { key: "sets", label: "Bộ nguyên set", icon: "👔", slots: [] }
  ];
  var THEMES = [{ key: "", label: "Tất cả" }, { key: "school", label: "🏫 Đi học" }, { key: "sport", label: "⚽ Thể thao" }, { key: "party", label: "🎉 Dự tiệc" }, { key: "traditional", label: "🎎 Truyền thống" }];
  var NEWCOMER = { items: ["nw-shirt", "nw-hat", "nw-bg"], coins: 20, needStars: 3 };
  var BOXES = [
    { level: 5, tier: "Đồng", items: ["box5-shirt", "box5-hat"], coins: 30 },
    { level: 10, tier: "Bạc", items: ["box10-coat", "box10-shoes"], coins: 50 },
    { level: 15, tier: "Vàng", items: [{ male: "box15-suit", female: "box15-dress" }, "box15-glasses"], coins: 80 },
    { level: 20, tier: "Kim cương", items: ["box20-coat", "box20-crown", "box20-shoes"], coins: 120 },
    { level: 30, tier: "Huyền thoại", items: [{ male: "box30-shirt", female: "box30-dress" }, "box30-hat"], coins: 200 },
    { level: 50, tier: "Huyền thoại", items: [{ male: "box50-suit", female: "box50-dress" }, "box50-crown", "box50-bg"], coins: 300 }
  ];
  /* Bộ nguyên set: items có thể là id hoặc {male, female} theo giới. */
  var SETS = [
    { id: "set-school", name: "Bộ đi học", theme: "school", items: { shirt: "shirt-formal", bottom: "pants-long", shoes: "shoes-sport", hat: "hat-cap" } },
    { id: "set-sport", name: "Bộ thể thao", theme: "sport", items: { shirt: "shirt-sport", bottom: "pants-short", shoes: "shoes-sport", hat: "hat-cap" } },
    { id: "set-party", name: "Bộ dự tiệc", theme: "party", items: { shirt: "shirt-formal", bottom: { female: "dress-short", male: "pants-jean" }, shoes: { female: "shoes-doll", male: "shoes-boot" }, hat: { female: "hat-wide", male: "hat-cap" } } },
    { id: "set-trad", name: "Bộ truyền thống", theme: "traditional", items: { shirt: { female: "shirt-formal", male: "shirt-trad" }, bottom: { female: "dress-aodai", male: "pants-long" }, shoes: "shoes-sandal", hat: "hat-nonla" } },
    { id: "set-scientist", name: "Bộ nhà khoa học", theme: "school", items: { coat: "coat-lab", face: "face-round", shirt: "shirt-formal", bottom: "pants-long", shoes: "shoes-sport" } },
    { id: "set-artist", name: "Bộ nghệ sĩ", theme: "party", items: { shirt: "shirt-formal", bottom: { female: "dress-short", male: "pants-jean" }, shoes: { female: "shoes-doll", male: "shoes-boot" }, hat: "hat-wide", accessory: "acc-headphone" } }
  ];
  var GIFTS = [
    { id: "gift-topic-m8", item: "gift-grad", name: "Mũ tốt nghiệp", cond: "Làm chủ trọn chủ đề Toán Chương I (lớp 8)" },
    { id: "gift-topic-nv", item: "gift-grad", name: "Mũ tốt nghiệp", cond: "Làm chủ trọn chủ đề Ngữ văn Bài 1 (lớp 8)" },
    { id: "gift-streak7", item: "gift-crown", name: "Vương miện Vàng", cond: "Chuỗi học 7 ngày" },
    { id: "gift-streak20", item: "gift-wings", name: "Cánh thiên thần", cond: "Trả lời đúng lần đầu 20 câu liên tiếp" },
    { id: "gift-simperfect", item: "gift-dragonpet", name: "Rồng nhỏ", cond: "Đạt điểm tuyệt đối trong mô phỏng kiểm tra (câu viết không tính điểm)" }
  ];
  var PET_FROM_CHAR = { owl: "pet-owl", cat: "pet-cat", fox: "pet-fox", robot: "pet-robot", dragon: "pet-dragon", unicorn: "pet-unicorn", penguin: "pet-penguin" };
  var PET_EMOJI = { owl: "🦉", cat: "🐱", fox: "🦊", robot: "🤖", dragon: "🐉", unicorn: "🦄", penguin: "🐧" };
  var TONE_MOD = { light: "🏻", medium: "🏽", dark: "🏿" };
  var TONE_LABEL = { light: "Sáng", medium: "Trung bình", dark: "Ngăm" };
  var BG_GRADIENT = { "bg-classroom": "#e8f3ff", "bg-schoolyard": "#e4f7e4", "bg-park": "#e8f5e9", "bg-beach": "#e0f7fa", "bg-bedroom": "#fff3e0", "bg-stage": "#f3e5f5", "nw-bg": "#e8f3ff", "box50-bg": "#f3e5f5" };
  var TOPIC_SKILLS = { "m8-c1": ["m8-mono", "m8-addsub", "m8-mul", "m8-div", "m8-value", "m8-simplify", "m8-word", "m8-steps", "m8-error", "m8-inverse"], "nv8-b1": ["nv1-author", "nv1-history", "nv1-meaning", "nv1-inference", "nv1-wordchoice", "nv1-theme", "nv1-writing"] };

  /* ---------------- Trạng thái hồ sơ ---------------- */
  function ensureWardrobe(profile) {
    if (!profile) return null;
    if (!profile.v2wardrobe) {
      profile.v2wardrobe = { owned: [], equipped: {}, tryOn: {}, variants: {}, outfits: [], newcomerClaimed: false, boxesClaimed: [], giftsClaimed: [], firstTryStreak: 0, firstTryBest: 0, simPerfect: false };
    }
    var w = profile.v2wardrobe;
    if (!Array.isArray(w.owned)) w.owned = [];
    if (!w.equipped || typeof w.equipped !== "object") w.equipped = {};
    if (!w.tryOn || typeof w.tryOn !== "object") w.tryOn = {};
    if (!w.variants || typeof w.variants !== "object") w.variants = {};
    if (!Array.isArray(w.outfits)) w.outfits = [];
    if (typeof w.newcomerClaimed !== "boolean") w.newcomerClaimed = false;
    if (!Array.isArray(w.boxesClaimed)) w.boxesClaimed = [];
    if (!Array.isArray(w.giftsClaimed)) w.giftsClaimed = [];
    if (typeof w.firstTryStreak !== "number") w.firstTryStreak = 0;
    if (typeof w.firstTryBest !== "number") w.firstTryBest = 0;
    if (typeof w.simPerfect !== "boolean") w.simPerfect = false;
    return w;
  }
  /* Di chuyển thú cũ thành thú cưng + tông da mặc định trung bình
     cho hồ sơ cũ. KHÔNG gán giới tính: hồ sơ chưa có giới tính
     trả về needsGate=true để giao diện hiện màn chọn một lần. */
  function migrateHuman(profile) {
    if (!profile) return { needsGate: false };
    var w = ensureWardrobe(profile);
    if (profile.skinTone !== "light" && profile.skinTone !== "medium" && profile.skinTone !== "dark") profile.skinTone = "medium";
    if (profile.character && PET_FROM_CHAR[profile.character] && !profile.pet) profile.pet = profile.character;
    if (profile.pet && PET_FROM_CHAR[profile.pet]) {
      var petId = PET_FROM_CHAR[profile.pet];
      if (w.owned.indexOf(petId) === -1) w.owned.push(petId);
      if (!w.equipped.pet) w.equipped.pet = petId;
    }
    /* Đổi giới tính ở bất kỳ đâu (kể cả header trước khi module
       nạp) cũng phải cởi món chỉ dành cho giới cũ, giữ quyền sở
       hữu. Chạy lũy đẳng nên an toàn khi gọi mỗi lần vẽ. */
    if (profile.gender === "male" || profile.gender === "female") {
      var slots = Object.keys(w.equipped), si, sit;
      for (si = 0; si < slots.length; si++) {
        sit = ITEMS[w.equipped[slots[si]]];
        if (sit && sit.gender !== "both" && sit.gender !== profile.gender) delete w.equipped[slots[si]];
      }
    }
    return { needsGate: !(profile.gender === "male" || profile.gender === "female") };
  }
  function setGender(profile, gender) {
    if (!profile || (gender !== "male" && gender !== "female")) return false;
    var w = ensureWardrobe(profile);
    profile.gender = gender;
    /* Đổi giới tính thì cởi các món chỉ dành cho giới cũ (vẫn giữ
       quyền sở hữu), các món còn lại giữ nguyên. */
    var slots = Object.keys(w.equipped), i, it;
    for (i = 0; i < slots.length; i++) {
      it = ITEMS[w.equipped[slots[i]]];
      if (it && it.gender !== "both" && it.gender !== gender) delete w.equipped[slots[i]];
    }
    saveNow(profile);
    return true;
  }
  function setSkinTone(profile, tone) {
    if (!profile || !TONE_MOD[tone]) return false;
    profile.skinTone = tone;
    saveNow(profile);
    return true;
  }
  function saveNow(profile) {
    try { if (typeof root.saveProfile === "function") root.saveProfile(); } catch (e) {}
    return profile;
  }
  function isMasteredSkill(st) {
    if (!st || !st.window) return false;
    var sum = 0, i;
    for (i = 0; i < st.window.length; i++) sum += st.window[i];
    var rate = st.window.length ? sum / st.window.length : 0;
    return st.total >= 10 && st.window.length >= 10 && rate >= 0.8 && typeof st.level === "number" && st.level >= 3;
  }
  function itemGenderOk(profile, it) {
    if (!it) return false;
    if (it.gender === "both") return true;
    return profile && profile.gender === it.gender;
  }
  function visibleItems(profile, teen) {
    /* Lưới hiển thị: món shop theo giới + (lớp 1-5 chỉ món kids),
       món box/gift/newcomer/migration không nằm trong lưới mua. */
    var out = [], id, it;
    for (id in ITEMS) {
      it = ITEMS[id];
      if (it.source !== "shop") continue;
      if (!itemGenderOk(profile, it)) continue;
      if (!teen && !it.kids) continue;
      out.push(it);
    }
    return out;
  }
  function categoryItems(profile, teen, catKey, theme) {
    var cat = null, i;
    for (i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].key === catKey) cat = CATEGORIES[i];
    if (!cat) return [];
    if (catKey === "sets") return [];
    return visibleItems(profile, teen).filter(function (it) {
      if (cat.slots.indexOf(it.slot) === -1) return false;
      /* Quần và váy chung slot bottom: váy là kind "dress", quần
         là kind rỗng — lọc theo danh mục, không theo kind chung. */
      if (cat.key === "dress" && it.kind !== "dress") return false;
      if (cat.key === "pants" && it.kind === "dress") return false;
      if (theme && it.themes.indexOf(theme) === -1) return false;
      return true;
    });
  }
  function resolveBoxItems(box, gender) {
    return box.items.map(function (x) { return typeof x === "string" ? x : (x[gender] || x.male || x.female); });
  }
  function boxContents(box, gender) {
    return resolveBoxItems(box, gender).map(function (id) { return ITEMS[id]; }).filter(Boolean);
  }
  function levelOf(profile) { return levelForXp(profile ? profile.xp || 0 : 0); }
  function newcomerAvailable(profile) {
    /* Sao trong game chỉ tính đúng lần đầu, nên tổng sao >= 3
       chính là "3 câu đúng lần đầu" (kể cả sao tích từ trước). */
    if (!profile) return false;
    var w = ensureWardrobe(profile);
    if (w.newcomerClaimed) return false;
    return (profile.totalStars || 0) >= NEWCOMER.needStars;
  }
  function claimNewcomer(profile) {
    if (!profile) return { ok: false, reason: "no-profile" };
    var w = ensureWardrobe(profile);
    if (w.newcomerClaimed) return { ok: false, reason: "claimed" };
    if ((profile.totalStars || 0) < NEWCOMER.needStars) return { ok: false, reason: "not-done" };
    NEWCOMER.items.forEach(function (id) { if (w.owned.indexOf(id) === -1) w.owned.push(id); });
    if (typeof profile.coins !== "number") profile.coins = 0;
    profile.coins += NEWCOMER.coins;
    w.newcomerClaimed = true;
    w.equipped.shirt = "nw-shirt"; w.equipped.hat = "nw-hat"; w.equipped.background = "nw-bg";
    saveNow(profile);
    return { ok: true, items: NEWCOMER.items.slice(), coins: NEWCOMER.coins };
  }
  function boxAvailable(profile, box) {
    if (!profile) return false;
    var w = ensureWardrobe(profile);
    if (w.boxesClaimed.indexOf(box.level) !== -1) return false;
    return levelOf(profile) >= box.level;
  }
  function claimBox(profile, level) {
    if (!profile) return { ok: false, reason: "no-profile" };
    var w = ensureWardrobe(profile), box = null, i;
    for (i = 0; i < BOXES.length; i++) if (BOXES[i].level === level) box = BOXES[i];
    if (!box) return { ok: false, reason: "unknown" };
    if (w.boxesClaimed.indexOf(level) !== -1) return { ok: false, reason: "claimed" };
    if (levelOf(profile) < level) return { ok: false, reason: "locked" };
    var ids = resolveBoxItems(box, profile.gender || "male");
    ids.forEach(function (id) { if (w.owned.indexOf(id) === -1) w.owned.push(id); });
    if (typeof profile.coins !== "number") profile.coins = 0;
    profile.coins += box.coins;
    w.boxesClaimed.push(level);
    saveNow(profile);
    return { ok: true, items: ids, coins: box.coins, box: box };
  }
  function wearBoxItems(profile, level) {
    var w = ensureWardrobe(profile), box = null, i;
    for (i = 0; i < BOXES.length; i++) if (BOXES[i].level === level) box = BOXES[i];
    if (!box) return false;
    resolveBoxItems(box, profile.gender || "male").forEach(function (id) {
      var it = ITEMS[id];
      if (it && w.owned.indexOf(id) !== -1) w.equipped[it.slot] = id;
    });
    saveNow(profile);
    return true;
  }
  function giftAvailable(profile, giftId) {
    if (!profile) return false;
    var w = ensureWardrobe(profile);
    if (w.giftsClaimed.indexOf(giftId) !== -1) return false;
    if (giftId === "gift-topic-m8") return TOPIC_SKILLS["m8-c1"].every(function (s) { return profile.skills && isMasteredSkill(profile.skills[s]); });
    if (giftId === "gift-topic-nv") return TOPIC_SKILLS["nv8-b1"].every(function (s) { return profile.skills && isMasteredSkill(profile.skills[s]); });
    if (giftId === "gift-streak7") return !!(profile.v2p34 && profile.v2p34.streak && profile.v2p34.streak.best >= 7);
    if (giftId === "gift-streak20") return w.firstTryBest >= 20;
    if (giftId === "gift-simperfect") return !!w.simPerfect;
    return false;
  }
  function giftDef(giftId) {
    var i; for (i = 0; i < GIFTS.length; i++) if (GIFTS[i].id === giftId) return GIFTS[i];
    return null;
  }
  function claimGift(profile, giftId) {
    if (!profile) return { ok: false, reason: "no-profile" };
    var w = ensureWardrobe(profile), g = giftDef(giftId);
    if (!g) return { ok: false, reason: "unknown" };
    if (w.giftsClaimed.indexOf(giftId) !== -1) return { ok: false, reason: "claimed" };
    if (!giftAvailable(profile, giftId)) return { ok: false, reason: "not-done" };
    if (w.owned.indexOf(g.item) === -1) w.owned.push(g.item);
    w.giftsClaimed.push(giftId);
    saveNow(profile);
    return { ok: true, item: g.item };
  }
  /* ---------------- Mua / mặc / mặc thử ----------------
     Mặc thử (tryOn) KHÔNG trừ xu và không đổi đồ đang mặc.
     Mua (buyItem) chỉ trừ xu khi đủ xu và đủ cấp; xác nhận bằng
     hộp thoại confirm ở tầng giao diện, tầng logic thuần này chỉ
     kiểm tra điều kiện và trừ xu. */
  function tryOnItem(profile, id) {
    var w = ensureWardrobe(profile), it = ITEMS[id];
    if (!it) return { ok: false, reason: "unknown" };
    if (!itemGenderOk(profile, it)) return { ok: false, reason: "gender" };
    w.tryOn[it.slot] = id;
    return { ok: true, item: it };
  }
  function clearTryOn(profile, slot) {
    var w = ensureWardrobe(profile);
    if (slot) delete w.tryOn[slot]; else w.tryOn = {};
    return true;
  }
  function wearItem(profile, id) {
    var w = ensureWardrobe(profile), it = ITEMS[id];
    if (!it) return { ok: false, reason: "unknown" };
    if (w.owned.indexOf(id) === -1) return { ok: false, reason: "not-owned" };
    if (!itemGenderOk(profile, it)) return { ok: false, reason: "gender" };
    w.equipped[it.slot] = id;
    if (w.tryOn[it.slot] === id) delete w.tryOn[it.slot];
    saveNow(profile);
    return { ok: true, item: it };
  }
  function unequipSlot(profile, slot) {
    var w = ensureWardrobe(profile);
    delete w.equipped[slot];
    delete w.tryOn[slot];
    saveNow(profile);
    return true;
  }
  function buyItem(profile, id) {
    if (!profile) return { ok: false, reason: "no-profile" };
    var w = ensureWardrobe(profile), it = ITEMS[id];
    if (!it || it.source !== "shop") return { ok: false, reason: "not-for-sale" };
    if (!itemGenderOk(profile, it)) return { ok: false, reason: "gender" };
    if (w.owned.indexOf(id) !== -1) return { ok: false, reason: "owned" };
    if (levelOf(profile) < it.level) return { ok: false, reason: "locked" };
    if (typeof profile.coins !== "number") profile.coins = 0;
    if (profile.coins < it.price) return { ok: false, reason: "no-coins" };
    profile.coins -= it.price;
    w.owned.push(id);
    w.equipped[it.slot] = id;
    if (w.tryOn[it.slot] === id) delete w.tryOn[it.slot];
    saveNow(profile);
    return { ok: true, item: it };
  }
  function setVariant(profile, id, colorName) {
    var w = ensureWardrobe(profile);
    if (!ITEMS[id]) return false;
    w.variants[id] = colorName;
    saveNow(profile);
    return true;
  }
  function resolveSetItems(set, gender) {
    var out = {}, slot, v;
    for (slot in set.items) {
      v = set.items[slot];
      out[slot] = typeof v === "string" ? v : (v[gender] || v.male || v.female);
    }
    return out;
  }
  function setStatus(profile, set) {
    var items = resolveSetItems(set, profile.gender || "male"), w = ensureWardrobe(profile);
    var ids = [], slot, locked = null, total = 0;
    for (slot in items) {
      ids.push(items[slot]);
      var it = ITEMS[items[slot]];
      if (!it) continue;
      if (w.owned.indexOf(items[slot]) === -1) {
        total += it.price;
        if (levelOf(profile) < it.level && !locked) locked = it;
      }
    }
    return { ids: ids, items: items, ownedCount: ids.filter(function (id) { return w.owned.indexOf(id) !== -1; }).length, total: total, locked: locked };
  }
  function wearSet(profile, setId) {
    var set = null, i;
    for (i = 0; i < SETS.length; i++) if (SETS[i].id === setId) set = SETS[i];
    if (!set) return { ok: false, reason: "unknown" };
    var st = setStatus(profile, set);
    if (st.ownedCount !== st.ids.length) return { ok: false, reason: "not-owned" };
    var w = ensureWardrobe(profile), slot;
    for (slot in st.items) w.equipped[slot] = st.items[slot];
    saveNow(profile);
    return { ok: true, set: set };
  }
  function buySet(profile, setId) {
    var set = null, i;
    for (i = 0; i < SETS.length; i++) if (SETS[i].id === setId) set = SETS[i];
    if (!set) return { ok: false, reason: "unknown" };
    var st = setStatus(profile, set);
    if (st.locked) return { ok: false, reason: "locked" };
    if (typeof profile.coins !== "number") profile.coins = 0;
    if (profile.coins < st.total) return { ok: false, reason: "no-coins" };
    var w = ensureWardrobe(profile), slot;
    profile.coins -= st.total;
    st.ids.forEach(function (id) { if (w.owned.indexOf(id) === -1) w.owned.push(id); });
    for (slot in st.items) w.equipped[slot] = st.items[slot];
    saveNow(profile);
    return { ok: true, set: set, coins: st.total };
  }
  /* ---------------- Bộ đã lưu ---------------- */
  function saveOutfit(profile, name) {
    var w = ensureWardrobe(profile);
    if (w.outfits.length >= 5) return { ok: false, reason: "max" };
    var snap = {};
    SLOTS.forEach(function (s) { if (w.equipped[s]) snap[s] = w.equipped[s]; });
    w.outfits.push({ name: name || ("Bộ " + (w.outfits.length + 1)), equipped: snap });
    saveNow(profile);
    return { ok: true, index: w.outfits.length - 1 };
  }
  function applyOutfit(profile, index) {
    var w = ensureWardrobe(profile), o = w.outfits[index];
    if (!o) return { ok: false, reason: "unknown" };
    var applied = 0, slot, it;
    for (slot in o.equipped) {
      it = ITEMS[o.equipped[slot]];
      if (it && w.owned.indexOf(o.equipped[slot]) !== -1 && itemGenderOk(profile, it)) { w.equipped[slot] = o.equipped[slot]; applied++; }
    }
    saveNow(profile);
    return { ok: true, applied: applied };
  }
  function deleteOutfit(profile, index) {
    var w = ensureWardrobe(profile);
    if (!w.outfits[index]) return false;
    w.outfits.splice(index, 1);
    saveNow(profile);
    return true;
  }
  function renameOutfit(profile, index, name) {
    var w = ensureWardrobe(profile);
    if (!w.outfits[index] || !name) return false;
    w.outfits[index].name = name;
    saveNow(profile);
    return true;
  }
  /* ---------------- Đếm câu đúng lần đầu ----------------
     finishScreen(star=true) là luật sao lần đầu của engine (câu
     thử lại đã bị triệt sao trong chính finishScreen; hai dạng
     memory/catch tính hoàn thành là sao theo engine cũ — ghi rõ
     đây là xấp xỉ theo luật sao sẵn có, không phải đếm riêng
     từng lần bấm). Chuỗi này chỉ dùng cho quà 20 câu liên tiếp
     và không ảnh hưởng điểm/XP. */
  function recordAnswer(profile, star) {
    if (!profile) return null;
    var w = ensureWardrobe(profile);
    if (star) { w.firstTryStreak += 1; if (w.firstTryStreak > w.firstTryBest) w.firstTryBest = w.firstTryStreak; }
    else w.firstTryStreak = 0;
    saveNow(profile);
    return w;
  }
  function effectiveEquipped(profile) {
    var w = ensureWardrobe(profile), out = {}, s;
    SLOTS.forEach(function (slot) { out[slot] = w.tryOn[slot] || w.equipped[slot] || null; });
    return out;
  }
  function variantOf(profile, id) {
    var w = ensureWardrobe(profile);
    return w.variants[id] || (ITEMS[id] && ITEMS[id].colors[0] ? ITEMS[id].colors[0].n : "");
  }
  function colorHexOf(profile, id) {
    var it = ITEMS[id]; if (!it) return "#ffffff";
    var name = variantOf(profile, id), c = null, i;
    for (i = 0; i < it.colors.length; i++) if (it.colors[i].n === name) c = it.colors[i];
    return c ? c.c : "#ffffff";
  }

  /* ---------------- Búp bê xem trước (TẠM: cột emoji) ----------------
     Thứ tự hàng trên búp bê tạm: mũ, đầu (tóc hoặc mặt theo tông
     da), kính, áo/khoác (váy liền che hàng áo), quần/váy, giày,
     phụ kiện; thú cưng đứng cạnh ở góc sân khấu. Thay một lớp
     không làm mất các lớp còn lại (mỗi lớp đọc từ equipped/tryOn
     riêng). Đây KHÔNG phải thứ tự lớp vẽ SVG cuối cùng (nền →
     thú cưng → tóc sau → thân → giày → quần/váy → áo/váy liền →
     áo khoác → tóc trước → mũ → kính → phụ kiện) — thứ tự đó sẽ
     áp dụng khi vẽ asset SVG ở bước cuối. */
  function faceEmoji(profile) {
    var mod = TONE_MOD[profile.skinTone] || TONE_MOD.medium;
    if (profile.gender === "female") return "👧" + mod;
    if (profile.gender === "male") return "👦" + mod;
    return "🧒" + mod;
  }
  function dollHTML(profile, big) {
    var w = ensureWardrobe(profile), eq = effectiveEquipped(profile);
    var bgId = eq.background || null, bg = bgId ? ITEMS[bgId] : null;
    var grad = (bgId && BG_GRADIENT[bgId]) || "#fff6e3";
    var head = eq.hair ? ITEMS[eq.hair].emoji : faceEmoji(profile);
    var dress = eq.bottom && ITEMS[eq.bottom] && ITEMS[eq.bottom].kind === "dress";
    var rows = "";
    if (eq.hat) rows += "<div class=\"v2-doll-row v2-doll-hat\">" + ITEMS[eq.hat].emoji + "</div>";
    rows += "<div class=\"v2-doll-row v2-doll-head\">" + escHtml(head) + "</div>";
    if (eq.face) rows += "<div class=\"v2-doll-row v2-doll-face\">" + ITEMS[eq.face].emoji + "</div>";
    if (!dress) {
      if (eq.coat) rows += "<div class=\"v2-doll-row v2-doll-top\">" + ITEMS[eq.coat].emoji + "</div>";
      else if (eq.shirt) rows += "<div class=\"v2-doll-row v2-doll-top\">" + ITEMS[eq.shirt].emoji + "</div>";
    }
    if (eq.bottom) rows += "<div class=\"v2-doll-row v2-doll-bottom" + (dress ? " v2-doll-dress" : "") + "\">" + ITEMS[eq.bottom].emoji + "</div>";
    if (eq.shoes) rows += "<div class=\"v2-doll-row v2-doll-shoes\">" + ITEMS[eq.shoes].emoji + "</div>";
    if (eq.accessory) rows += "<div class=\"v2-doll-row v2-doll-acc\">" + ITEMS[eq.accessory].emoji + "</div>";
    var pet = eq.pet ? "<div class=\"v2-doll-pet\" title=\"Thú cưng\">" + ITEMS[eq.pet].emoji + "</div>" : "";
    var tryNote = "";
    var trySlots = Object.keys(w.tryOn);
    if (trySlots.length) {
      var names = trySlots.map(function (s) { return ITEMS[w.tryOn[s]] ? ITEMS[w.tryOn[s]].name : s; });
      tryNote = "<div class=\"v2-try-note\">👀 Đang mặc thử: " + names.map(escHtml).join(" · ") + " — chưa trừ xu</div>";
    }
    return "<div class=\"v2-doll-stage" + (big ? " v2-doll-big" : "") + "\" style=\"background:" + grad + "\"><span class=\"v2-doll-decor v2-decor-bear\" aria-hidden=\"true\">🧸</span><span class=\"v2-doll-decor v2-decor-heart\" aria-hidden=\"true\">💗</span><div class=\"v2-doll\">" + rows + "</div>" + pet + "</div>" + tryNote;
  }
  function itemTileHTML(profile, it, mode, teen) {
    var w = ensureWardrobe(profile), owned = w.owned.indexOf(it.id) !== -1;
    var eq = effectiveEquipped(profile), wearing = eq[it.slot] === it.id && !w.tryOn[it.slot];
    var trying = w.tryOn[it.slot] === it.id;
    var locked = levelOf(profile) < it.level;
    var variant = variantOf(profile, it.id);
    var dots = it.colors.map(function (c) {
      return "<button type=\"button\" class=\"v2-dot" + (c.n === variant ? " sel" : "") + "\" data-wd=\"variant:" + it.id + ":" + escHtml(c.n) + "\" style=\"background:" + c.c + "\" aria-label=\"Màu " + escHtml(c.n) + "\" title=\"" + escHtml(c.n) + "\"></button>";
    }).join("");
    var state = "";
    if (it.source === "gift") state = "<span class=\"v2-gold-ribbon\">🏅 Thành tích</span>";
    else if (owned && wearing) state = "<span class=\"v2-state\">✓ Đang mặc</span>";
    else if (owned) state = "<span class=\"v2-state\">✓ Đã có</span>";
    else if (locked) state = "<span class=\"v2-state\">🔒 Cần cấp " + it.level + "</span>";
    else state = "<span class=\"v2-state\">" + it.price + " 🪙</span>";
    var cls = "v2-item" + (trying ? " trying" : "") + (wearing ? " wearing" : "") + (locked ? " locked" : "") + (it.source === "gift" ? " v2-gold" : "");
    return "<div class=\"" + cls + "\" data-wd=\"tile:" + it.id + "\"><span class=\"v2-item-emoji\">" + it.emoji + "</span><span class=\"v2-item-name\">" + escHtml(it.name) + "</span><span class=\"v2-item-meta\">" + escHtml(it.themes.map(function (t) { return t === "school" ? "Đi học" : t === "sport" ? "Thể thao" : t === "party" ? "Dự tiệc" : "Truyền thống"; }).join(" · ")) + "</span><span class=\"v2-item-dots\">" + dots + "</span>" + state + "</div>";
  }
  /* ---------------- Giao diện trình duyệt ---------------- */
  var uiState = { mode: "shop", cat: "shirt", theme: "", container: null };
  function injectCss() {
    if (typeof document === "undefined" || document.getElementById("v2-wd-css")) return;
    var s = document.createElement("style"); s.id = "v2-wd-css";
    s.textContent = ".v2-wd{background:#fff;border:3px solid #f0dfba;border-radius:22px;padding:14px 16px;margin-bottom:16px;box-shadow:0 4px 0 #f0dfba}.v2-wd h3{margin:2px 0 10px;font-size:18px}.v2-wd-currency{font-weight:800;background:#fff8e1;border:3px solid #f0dfba;border-radius:14px;padding:8px 12px;margin-bottom:12px}.v2-wd-layout{display:flex;gap:12px;align-items:flex-start}.v2-wd-catbar{display:flex;flex-direction:column;gap:6px;flex-shrink:0}.v2-wd-catbar button{width:56px;height:56px;font-size:26px;border-radius:16px;background:#fff;border:3px solid #f0dfba;cursor:pointer;padding:0}.v2-wd-catbar button.sel{background:#ffe082;border-color:#ffb703}.v2-wd-catbar button span{display:block;font-size:11px;font-weight:800}.v2-wd-main{flex:1;min-width:0}.v2-doll-stage{position:relative;border:3px solid #f0dfba;border-radius:22px;padding:16px 8px 10px;text-align:center;overflow:hidden;min-height:340px}.v2-doll-decor{position:absolute;font-size:44px;pointer-events:none;opacity:.9}.v2-decor-bear{left:8px;bottom:8px}.v2-decor-heart{right:10px;top:10px}.v2-doll{position:relative;z-index:2}.v2-doll-row{line-height:1;margin-top:-14px}.v2-doll-row:first-child{margin-top:0}.v2-doll-head{font-size:88px}.v2-doll-hat{font-size:56px}.v2-doll-face{font-size:40px}.v2-doll-top{font-size:72px}.v2-doll-bottom{font-size:72px}.v2-doll-dress{font-size:88px}.v2-doll-shoes{font-size:64px}.v2-doll-acc{font-size:48px}.v2-doll-pet{position:absolute;right:12px;bottom:10px;font-size:56px;z-index:3}.v2-try-note{font-weight:800;background:#fff8e1;border:3px solid #f0dfba;border-radius:12px;padding:8px 10px;margin-top:10px}.v2-doll-big .v2-doll-head{font-size:130px}.v2-doll-big .v2-doll-top,.v2-doll-big .v2-doll-bottom{font-size:104px}.v2-doll-big .v2-doll-dress{font-size:128px}.v2-doll-big .v2-doll-shoes{font-size:92px}.v2-wd-trybar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:#e8f3ff;border:3px solid #4dabf7;border-radius:14px;padding:10px 12px;margin:10px 0;font-weight:800}.v2-wd-trybar button{border-radius:12px;padding:8px 12px;font-weight:800;background:#fff;border:3px solid #f0dfba;cursor:pointer}.v2-wd-trybar button:disabled{opacity:.5}.v2-wd-modes{display:flex;gap:8px;margin:12px 0}.v2-wd-modes button{flex:1;border-radius:14px;padding:10px 6px;font-weight:800;background:#fff;border:3px solid #f0dfba;cursor:pointer}.v2-wd-modes button.sel{background:#ffe082;border-color:#ffb703}.v2-wd-themes{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.v2-wd-themes button{border-radius:20px;padding:6px 10px;font-weight:700;background:#fff;border:2px solid #f0dfba;cursor:pointer}.v2-wd-themes button.sel{background:#ffe082}.v2-wd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}.v2-item{border:3px solid #f0dfba;border-radius:18px;padding:10px 6px;text-align:center;background:#fff;cursor:pointer}.v2-item.trying{border-color:#4dabf7;box-shadow:0 4px 0 #4dabf7}.v2-item.wearing{border-color:#2fbf71;box-shadow:0 4px 0 #2fbf71}.v2-item.locked{opacity:.55}.v2-item.v2-gold{border-color:#ffb703;box-shadow:0 4px 0 #ffb703}.v2-item-emoji{font-size:44px;line-height:1.1;display:block}.v2-item-name{font-weight:800;font-size:14px;display:block;margin-top:4px}.v2-item-meta{font-size:12px;font-weight:600;color:#6f675a;display:block}.v2-item-dots{display:flex;gap:4px;justify-content:center;margin:6px 0}.v2-dot{width:22px;height:22px;border-radius:50%;border:2px solid #ccc;cursor:pointer;padding:0}.v2-dot.sel{border-color:#33302a;outline:2px solid #ffb703}.v2-state{font-weight:800;font-size:13px;display:block}.v2-gold-ribbon{font-weight:800;font-size:13px;display:block;color:#b8860b}.v2-wd-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.v2-wd-actions button{flex:1;min-width:130px;border-radius:14px;padding:10px 8px;font-weight:800;background:#fff;border:3px solid #f0dfba;cursor:pointer}.v2-wd-outfits{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.v2-wd-outfits button{border-radius:20px;padding:8px 12px;font-weight:800;background:#fff8e1;border:3px solid #f0dfba;cursor:pointer}.v2-wd-box{border:3px solid #f0dfba;border-radius:18px;padding:12px;margin:10px 0;background:#fff}.v2-wd-box h4{margin:0 0 6px;font-size:16px}.v2-wd-box button{border-radius:12px;padding:8px 12px;font-weight:800;background:#ffb703;border:3px solid #f0dfba;cursor:pointer}.v2-wd-box button:disabled{opacity:.5}.v2-wd-gender{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.v2-wd-gender button{border-radius:14px;padding:8px 12px;font-weight:800;background:#fff;border:3px solid #f0dfba;cursor:pointer}.v2-wd-gender button.sel{background:#ffe082;border-color:#ffb703}.v2-level-banner{position:fixed;left:50%;transform:translateX(-50%);top:76px;z-index:950;background:#fff;border:3px solid #ffb703;border-radius:18px;padding:14px 18px;font-weight:800;box-shadow:0 6px 0 #ffb703;text-align:center;max-width:min(480px,92vw)}.v2-level-banner .v2-jump{display:inline-block;animation:v2jump .6s ease infinite alternate;font-size:44px}.@keyframes v2jump{from{transform:translateY(0)}to{transform:translateY(-14px)}}.v2-confetti{position:fixed;inset:0;z-index:960;pointer-events:none;overflow:hidden}.v2-confetti span{position:absolute;top:-30px;font-size:30px;animation:v2fall 2.6s linear forwards}.@keyframes v2fall{to{transform:translateY(110vh) rotate(360deg)}}.v2-gate{position:fixed;inset:0;z-index:10000;background:#fff6e3;overflow:auto;padding:24px 16px;text-align:center}.v2-gate .v2-gate-card{max-width:520px;margin:0 auto;background:#fff;border:3px solid #f0dfba;border-radius:22px;padding:20px;box-shadow:0 6px 0 #f0dfba}.v2-gate button{border-radius:16px;padding:14px 18px;font-weight:800;background:#fff;border:3px solid #f0dfba;cursor:pointer;font-size:20px;margin:6px}.v2-gate button.sel{background:#ffe082;border-color:#ffb703}.v2-preview-overlay{position:fixed;inset:0;z-index:970;background:rgba(255,246,227,.97);overflow:auto;padding:18px;text-align:center}.v2-preview-overlay .v2-preview-card{max-width:520px;margin:0 auto}.v2-preview-overlay button{border-radius:14px;padding:10px 16px;font-weight:800;background:#fff;border:3px solid #f0dfba;cursor:pointer;margin:8px}@media (max-width:560px){.v2-wd-layout{flex-direction:column}.v2-wd-catbar{flex-direction:row;overflow-x:auto;width:100%;padding-bottom:4px}.v2-wd-catbar button{flex-shrink:0}.v2-doll-stage{min-height:300px}}@media (prefers-reduced-motion:reduce){.v2-level-banner .v2-jump{animation:none}.v2-confetti span{animation:none}}";
    document.head.appendChild(s);
  }
  function getProfile() {
    try {
      if (typeof root.profile !== "undefined" && root.profile) return root.profile;
      if (typeof profile !== "undefined" && profile) return profile;
    } catch (e) {}
    return null;
  }
  function playWdAudio(file) {
    try {
      if (typeof Audio === "undefined") return;
      var a = new Audio("assets/audio/v2/" + file);
      var pr = a.play(); if (pr && pr.catch) pr.catch(function () {});
    } catch (e) {}
  }
  function isHomeVisible() {
    if (typeof document === "undefined") return false;
    var home = document.getElementById("scr-home");
    var game = document.getElementById("scr-game");
    return !!(home && home.classList.contains("on")) && !(game && game.classList.contains("on")) && !document.getElementById("v2-sim-overlay");
  }
  function showLevelBanner(profile, newLevel, milestone) {
    if (typeof document === "undefined") return;
    var old = document.getElementById("v2-level-banner"); if (old) old.remove();
    var oldC = document.getElementById("v2-confetti"); if (oldC) oldC.remove();
    var div = document.createElement("div"); div.id = "v2-level-banner"; div.className = "v2-level-banner";
    if (milestone) {
      var conf = document.createElement("div"); conf.id = "v2-confetti"; conf.className = "v2-confetti";
      var ems = ["🎉", "⭐", "🎊", "✨", "👑"];
      var i, sp;
      for (i = 0; i < 24; i++) { sp = document.createElement("span"); sp.textContent = ems[i % ems.length]; sp.style.left = (i * 4) + "%"; sp.style.animationDelay = ((i % 6) * 0.2) + "s"; conf.appendChild(sp); }
      document.body.appendChild(conf);
      div.innerHTML = "<span class=\"v2-jump\">🎉</span><div style=\"font-size:22px\">LÊN CẤP " + newLevel + "!</div><div>Đã mở hộp quà mốc cấp " + newLevel + " — mở ngay trong tab Cửa hàng nhé!</div><div style=\"margin-top:10px\"><button type=\"button\" data-wd=\"goto-boxes\">🎁 Mở hộp quà</button> <button type=\"button\" data-wd=\"close-banner\">Để sau</button></div>";
      playWdAudio("v2-achievement.mp3");
    } else {
      var prog = null;
      try { if (root.__v2 && root.__v2.xpProgress) prog = root.__v2.xpProgress(profile.xp || 0); } catch (e) {}
      var pct = prog ? prog.pct : 0;
      div.innerHTML = "<span class=\"v2-jump\">🎓</span><div style=\"font-size:20px\">Lên cấp " + newLevel + "!</div><div>Chúc mừng! Cố lên cấp tiếp theo nhé.</div><div style=\"height:14px;background:#f5ecd7;border-radius:8px;overflow:hidden;margin:8px 0\"><div style=\"height:100%;width:" + pct + "%;background:#ffb300\"></div></div><button type=\"button\" data-wd=\"close-banner\">Đóng</button>";
      playWdAudio("v2-skill-levelup.mp3");
    }
    document.body.appendChild(div);
    setTimeout(function () { var b = document.getElementById("v2-level-banner"); if (b) b.remove(); var c = document.getElementById("v2-confetti"); if (c) c.remove(); }, 8000);
  }
  function showPreviewOverlay(profile) {
    if (typeof document === "undefined") return;
    var old = document.getElementById("v2-preview-overlay"); if (old) old.remove();
    var div = document.createElement("div"); div.id = "v2-preview-overlay"; div.className = "v2-preview-overlay";
    div.innerHTML = "<div class=\"v2-preview-card\"><h2>👀 Xem trước toàn thân</h2>" + dollHTML(profile, true) + "<p style=\"font-weight:700\">Đây là bản xem trước — không mua hay đổi gì ở đây.</p><button type=\"button\" data-wd=\"close-preview\">Đóng</button></div>";
    document.body.appendChild(div);
  }
  function showGenderGate(profile) {
    if (typeof document === "undefined" || document.getElementById("v2-gender-gate")) return;
    var petNote = "";
    if (profile.pet && PET_EMOJI[profile.pet]) petNote = "<p style=\"font-weight:700\">Bạn cũ " + PET_EMOJI[profile.pet] + " sẽ đi cùng bạn dưới dạng thú cưng, không bị xóa.</p>";
    var div = document.createElement("div"); div.id = "v2-gender-gate"; div.className = "v2-gate";
    div.innerHTML = "<div class=\"v2-gate-card\"><h2>👋 Nhân vật của bạn giờ là bạn người!</h2><p style=\"font-weight:700\">Từ giờ nhân vật chính là bạn nam hoặc bạn nữ. Hãy chọn một lần — lựa chọn này được lưu lại và đổi được sau trong Hồ sơ / tủ đồ.</p>" + petNote + "<p style=\"font-weight:800\">Tông da (đổi được sau):</p><div class=\"v2-wd-gender\" id=\"v2-gate-tones\"><button type=\"button\" data-wd=\"gate-tone:light\">🏻 Sáng</button><button type=\"button\" data-wd=\"gate-tone:medium\" class=\"sel\">🏽 Trung bình</button><button type=\"button\" data-wd=\"gate-tone:dark\">🏿 Ngăm</button></div><p style=\"font-weight:800\">Nhân vật của bạn là:</p><div><button type=\"button\" data-wd=\"gate-gender:male\">👦 Nam</button><button type=\"button\" data-wd=\"gate-gender:female\">👧 Nữ</button></div></div>";
    document.body.appendChild(div);
  }
  function wardrobeHTML(profile, teen, kids) {
    var w = ensureWardrobe(profile);
    var lvl = levelOf(profile);
    var eq = effectiveEquipped(profile);
    var mode = uiState.mode, cat = uiState.cat, theme = uiState.theme;
    var html = "<div class=\"v2-wd\"><h3>👗 Tủ đồ</h3>";
    html += "<div class=\"v2-wd-currency\">🎓 Cấp " + lvl + " · ✨ " + (profile.xp || 0) + " XP · 🪙 " + (profile.coins || 0) + " xu</div>";
    html += "<p style=\"font-weight:700;margin:0 0 8px\">Bản xem trước tạm bằng emoji + CSS — búp bê vẽ SVG chi tiết sẽ làm ở bước cuối.</p>";
    html += "<div class=\"v2-wd-gender\"><span style=\"font-weight:800\">Giới tính:</span><button type=\"button\" class=\"" + (profile.gender === "male" ? "sel" : "") + "\" data-wd=\"gender:male\">👦 Nam</button><button type=\"button\" class=\"" + (profile.gender === "female" ? "sel" : "") + "\" data-wd=\"gender:female\">👧 Nữ</button><span style=\"font-weight:800\">Tông da:</span><button type=\"button\" class=\"" + (profile.skinTone === "light" ? "sel" : "") + "\" data-wd=\"tone:light\">🏻 Sáng</button><button type=\"button\" class=\"" + (profile.skinTone === "medium" ? "sel" : "") + "\" data-wd=\"tone:medium\">🏽 Trung bình</button><button type=\"button\" class=\"" + (profile.skinTone === "dark" ? "sel" : "") + "\" data-wd=\"tone:dark\">🏿 Ngăm</button></div>";
    html += dollHTML(profile, false);
    var trySlots = Object.keys(w.tryOn);
    if (trySlots.length) {
      var t = trySlots.map(function (s) { return ITEMS[w.tryOn[s]]; }).filter(Boolean)[0];
      if (t) {
        var locked = lvl < t.level, noCoins = (profile.coins || 0) < t.price;
        html += "<div class=\"v2-wd-trybar\"><span>👀 Đang mặc thử: " + escHtml(t.name) + " — chưa trừ xu</span>";
        if (t.source === "shop") {
          if (locked) html += "<span>🔒 Cần cấp " + t.level + " mới mua được.</span>";
          else if (noCoins) html += "<span>Không đủ xu (cần " + t.price + " 🪙, đang có " + (profile.coins || 0) + " 🪙).</span>";
          else html += "<button type=\"button\" data-wd=\"buy-try:" + t.id + "\">Mua &amp; mặc · " + t.price + " 🪙 (còn " + ((profile.coins || 0) - t.price) + " 🪙)</button>";
        }
        html += "<button type=\"button\" data-wd=\"clear-try\">Bỏ thử</button></div>";
      }
    }
    html += "<div class=\"v2-wd-actions\"><button type=\"button\" data-wd=\"preview\">👀 Xem trước toàn thân</button><button type=\"button\" data-wd=\"save-outfit\">💾 Lưu bộ đồ</button></div>";
    if (w.outfits.length) {
      html += "<div class=\"v2-wd-outfits\">" + w.outfits.map(function (o, idx) {
        return "<span><button type=\"button\" data-wd=\"apply-outfit:" + idx + "\">👔 " + escHtml(o.name) + "</button> <button type=\"button\" data-wd=\"rename-outfit:" + idx + "\" aria-label=\"Đổi tên bộ\">✏️</button> <button type=\"button\" data-wd=\"del-outfit:" + idx + "\" aria-label=\"Xoá bộ\">🗑</button></span>";
      }).join("") + "</div>";
    }
    var equippedSlots = SLOTS.filter(function (s) { return eq[s]; });
    if (equippedSlots.length) {
      html += "<div style=\"font-weight:700;margin:8px 0\">Đang mặc: " + equippedSlots.map(function (s) { return escHtml(ITEMS[eq[s]].name) + " <button type=\"button\" data-wd=\"unequip:" + s + "\" aria-label=\"Cởi " + escHtml(SLOT_LABEL[s]) + "\">✕</button>"; }).join(" · ") + "</div>";
    }
    html += "<div class=\"v2-wd-modes\"><button type=\"button\" class=\"" + (mode === "shop" ? "sel" : "") + "\" data-wd=\"mode:shop\">🛍️ Cửa hàng (mua)</button><button type=\"button\" class=\"" + (mode === "wardrobe" ? "sel" : "") + "\" data-wd=\"mode:wardrobe\">👗 Tủ đồ (mặc đồ đã có)</button></div>";
    html += "<div class=\"v2-wd-themes\">" + THEMES.map(function (t) { return "<button type=\"button\" class=\"" + (theme === t.key ? "sel" : "") + "\" data-wd=\"theme:" + t.key + "\">" + escHtml(t.label) + "</button>"; }).join("") + "</div>";
    html += "<div class=\"v2-wd-layout\"><div class=\"v2-wd-catbar\">" + CATEGORIES.map(function (c) {
      if (!teen && (c.key === "coat" || c.key === "face" || c.key === "accessory")) return "";
      if (!teen && c.key === "sets") return "";
      return "<button type=\"button\" class=\"" + (cat === c.key ? "sel" : "") + "\" data-wd=\"cat:" + c.key + "\" title=\"" + escHtml(c.label) + "\">" + c.icon + "<span>" + escHtml(c.label) + "</span></button>";
    }).join("") + "</div><div class=\"v2-wd-main\">";
    if (cat === "sets") {
      html += SETS.filter(function (s) { return !theme || s.theme === theme; }).map(function (s) {
        var st = setStatus(profile, s);
        var btn = "";
        if (st.ownedCount === st.ids.length) btn = "<button type=\"button\" data-wd=\"wear-set:" + s.id + "\">Mặc cả bộ</button>";
        else if (st.locked) btn = "<button type=\"button\" disabled>🔒 Cần cấp " + st.locked.level + " cho " + escHtml(st.locked.name) + "</button>";
        else if ((profile.coins || 0) < st.total) btn = "<button type=\"button\" disabled>Không đủ xu (cần " + st.total + " 🪙)</button>";
        else btn = "<button type=\"button\" data-wd=\"buy-set:" + s.id + "\">Mua cả bộ · " + st.total + " 🪙 (còn " + ((profile.coins || 0) - st.total) + " 🪙)</button>";
        return "<div class=\"v2-wd-box\"><h4>👔 " + escHtml(s.name) + " — đã có " + st.ownedCount + "/" + st.ids.length + " món</h4><p style=\"margin:4px 0;font-weight:600\">" + st.ids.map(function (id) { return escHtml(ITEMS[id] ? ITEMS[id].name : id); }).join(" · ") + "</p>" + btn + "</div>";
      }).join("") || "<p style=\"font-weight:700\">Chưa có bộ nào cho chủ đề này.</p>";
    } else {
      var items = categoryItems(profile, teen, cat, theme);
      if (mode === "wardrobe") items = items.filter(function (it) { return w.owned.indexOf(it.id) !== -1; });
      else items = items.filter(function (it) { return w.owned.indexOf(it.id) === -1; });
      /* Món đã sở hữu vẫn hiện trong tủ đồ ngay cả khi đổi giới
         tính sau đó (chỉ không mặc được cho giới không hợp). */
      if (mode === "wardrobe") {
        var catDef = null, ci;
        for (ci = 0; ci < CATEGORIES.length; ci++) if (CATEGORIES[ci].key === cat) catDef = CATEGORIES[ci];
        var ownedExtra = w.owned.map(function (id) { return ITEMS[id]; }).filter(function (it) {
          if (!it || it.source === "shop") return false;
          if (!catDef || catDef.slots.indexOf(it.slot) === -1) return false;
          if (catDef.key === "dress" && it.kind !== "dress") return false;
          if (catDef.key === "pants" && it.kind === "dress") return false;
          if (!itemGenderOk(profile, it)) return false;
          return true;
        });
        ownedExtra.forEach(function (it) { if (items.indexOf(it) === -1) items.push(it); });
      }
      html += "<div class=\"v2-wd-grid\">" + (items.length ? items.map(function (it) { return itemTileHTML(profile, it, mode, teen); }).join("") : "<p style=\"font-weight:700\">Chưa có món nào ở đây.</p>") + "</div>";
    }
    html += "</div></div>";
    /* Hộp quà: nội dung cố định, hiện rõ trước khi mở. */
    html += "<h3 style=\"margin-top:18px\">🎁 Hộp quà</h3>";
    if (!w.newcomerClaimed) {
      var stars = profile.totalStars || 0, ok = stars >= NEWCOMER.needStars;
      html += "<div class=\"v2-wd-box\"><h4>🎁 Gói quà tân thủ</h4><p style=\"margin:4px 0;font-weight:600\">Bên trong: " + NEWCOMER.items.map(function (id) { return escHtml(ITEMS[id].name); }).join(" · ") + " + " + NEWCOMER.coins + " xu</p><p style=\"margin:4px 0\">Tiến độ: " + Math.min(stars, NEWCOMER.needStars) + "/" + NEWCOMER.needStars + " sao đúng lần đầu.</p>" + (ok ? "<button type=\"button\" data-wd=\"claim-newcomer\">Mở gói quà</button>" : "<button type=\"button\" disabled>Chơi thêm để đủ " + NEWCOMER.needStars + " sao nhé</button>") + "</div>";
    } else {
      html += "<p style=\"font-weight:700\">✅ Đã nhận gói quà tân thủ.</p>";
    }
    BOXES.forEach(function (box) {
      var claimed = w.boxesClaimed.indexOf(box.level) !== -1, avail = boxAvailable(profile, box);
      var contents = boxContents(box, profile.gender || "male").map(function (it) { return escHtml(it.name); }).join(" · ") + " + " + box.coins + " xu";
      html += "<div class=\"v2-wd-box\"><h4>🎁 Hộp " + escHtml(box.tier) + " — Cấp " + box.level + "</h4><p style=\"margin:4px 0;font-weight:600\">Bên trong: " + contents + "</p>" + (claimed ? "<span style=\"font-weight:800\">✅ Đã nhận</span>" : avail ? "<button type=\"button\" data-wd=\"claim-box:" + box.level + "\">Mở hộp</button>" : "<button type=\"button\" disabled>🔒 Cần cấp " + box.level + " (đang cấp " + lvl + ")</button>") + "</div>";
    });
    /* Quà nhiệm vụ khó: món độc nhất, không bán, khung vàng. */
    html += "<h3 style=\"margin-top:18px\">🏅 Quà đặc biệt cho nhiệm vụ khó</h3>";
    GIFTS.forEach(function (g) {
      var claimed = w.giftsClaimed.indexOf(g.id) !== -1, avail = giftAvailable(profile, g.id);
      var it = ITEMS[g.item];
      html += "<div class=\"v2-wd-box v2-gold\"><h4>🏅 " + escHtml(g.name) + " — " + escHtml(it.emoji + " " + it.name) + "</h4><p style=\"margin:4px 0;font-weight:600\">Điều kiện: " + escHtml(g.cond) + "</p>" + (claimed ? "<span style=\"font-weight:800\">✅ Đã nhận</span>" : avail ? "<button type=\"button\" data-wd=\"claim-gift:" + g.id + "\">Nhận quà</button>" : "<button type=\"button\" disabled>Chưa đủ điều kiện</button>") + "</div>";
    });
    html += "</div>";
    return html;
  }
  var lastRenderKey = "", lastLevel = null, pendingLevelUp = null, gateTone = "medium";
  function renderWardrobe() {
    if (typeof document === "undefined") return;
    var profile = getProfile();
    var shopBox = document.getElementById("v2-wardrobe-shop");
    var kidsBox = document.getElementById("v2-wardrobe-kids");
    if (!profile || (!shopBox && !kidsBox)) return;
    migrateHuman(profile);
    var teen = typeof profile.grade === "number" && profile.grade >= 6;
    var key = JSON.stringify(profile) + "|" + uiState.mode + "|" + uiState.cat + "|" + uiState.theme + "|" + (teen ? "teen" : "kids");
    if (key === lastRenderKey) return;
    lastRenderKey = key;
    if (teen && shopBox) shopBox.innerHTML = wardrobeHTML(profile, true, false);
    else if (shopBox) shopBox.innerHTML = "";
    if (!teen && kidsBox) kidsBox.innerHTML = wardrobeHTML(profile, false, true);
    else if (kidsBox) kidsBox.innerHTML = "";
  }
  function checkLevelUp() {
    if (typeof document === "undefined") return;
    var profile = getProfile();
    if (!profile) return;
    var lvl = levelOf(profile);
    if (lastLevel === null) { lastLevel = lvl; return; }
    if (lvl > lastLevel) {
      var from = lastLevel; lastLevel = lvl;
      var isMilestone = BOXES.some(function (b) { return b.level === lvl; });
      if (isHomeVisible()) showLevelBanner(profile, lvl, isMilestone);
      else pendingLevelUp = { level: lvl, milestone: isMilestone };
    } else lastLevel = lvl;
    if (pendingLevelUp && isHomeVisible()) {
      var p = pendingLevelUp; pendingLevelUp = null;
      showLevelBanner(profile, p.level, p.milestone);
    }
  }
  function handleClick(ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest("[data-wd]") : null;
    if (!el) return;
    var t = el.getAttribute("data-wd");
    var profile = getProfile();
    if (t === "close-banner") { var b = document.getElementById("v2-level-banner"); if (b) b.remove(); var c = document.getElementById("v2-confetti"); if (c) c.remove(); return; }
    if (t === "close-preview") { var o = document.getElementById("v2-preview-overlay"); if (o) o.remove(); return; }
    if (t === "goto-boxes") {
      var bn = document.getElementById("v2-level-banner"); if (bn) bn.remove();
      var cf = document.getElementById("v2-confetti"); if (cf) cf.remove();
      try { if (typeof root.__v2showTab === "function") root.__v2showTab("shop"); } catch (e) {}
      setTimeout(renderWardrobe, 50);
      return;
    }
    if (!profile) return;
    if (t.indexOf("gate-tone:") === 0) {
      gateTone = t.slice(10);
      document.querySelectorAll("#v2-gate-tones button").forEach(function (x) { x.classList.toggle("sel", x.getAttribute("data-wd") === t); });
      return;
    }
    if (t.indexOf("gate-gender:") === 0) {
      var g = t.slice(12);
      profile.skinTone = gateTone;
      if (setGender(profile, g)) {
        var gate = document.getElementById("v2-gender-gate"); if (gate) gate.remove();
        try { if (typeof renderProfileBar === "function") renderProfileBar(); } catch (e) {}
        lastRenderKey = "";
        renderWardrobe();
      }
      return;
    }
    if (t.indexOf("gender:") === 0) { setGender(profile, t.slice(7)); try { if (typeof renderProfileBar === "function") renderProfileBar(); } catch (e) {} lastRenderKey = ""; renderWardrobe(); return; }
    if (t.indexOf("tone:") === 0) { setSkinTone(profile, t.slice(5)); lastRenderKey = ""; renderWardrobe(); return; }
    if (t === "preview") { showPreviewOverlay(profile); return; }
    if (t === "save-outfit") {
      var name = null;
      try { name = window.prompt("Đặt tên cho bộ đồ này:", "Bộ " + (ensureWardrobe(profile).outfits.length + 1)); } catch (e) {}
      if (name === null) return;
      var so = saveOutfit(profile, name || undefined);
      if (!so.ok) alert("Đã lưu tối đa 5 bộ đồ rồi — hãy xoá một bộ cũ trước.");
      lastRenderKey = ""; renderWardrobe(); return;
    }
    if (t.indexOf("apply-outfit:") === 0) { applyOutfit(profile, parseInt(t.slice(13), 10)); try { if (typeof renderProfileBar === "function") renderProfileBar(); } catch (e) {} lastRenderKey = ""; renderWardrobe(); return; }
    if (t.indexOf("del-outfit:") === 0) { deleteOutfit(profile, parseInt(t.slice(11), 10)); lastRenderKey = ""; renderWardrobe(); return; }
    if (t.indexOf("rename-outfit:") === 0) {
      var idx = parseInt(t.slice(14), 10), nn = null;
      try { nn = window.prompt("Tên mới cho bộ đồ:", ensureWardrobe(profile).outfits[idx] ? ensureWardrobe(profile).outfits[idx].name : ""); } catch (e) {}
      if (nn) renameOutfit(profile, idx, nn);
      lastRenderKey = ""; renderWardrobe(); return;
    }
    if (t.indexOf("unequip:") === 0) { unequipSlot(profile, t.slice(8)); lastRenderKey = ""; renderWardrobe(); return; }
    if (t.indexOf("mode:") === 0) { uiState.mode = t.slice(5); lastRenderKey = ""; renderWardrobe(); return; }
    if (t.indexOf("cat:") === 0) { uiState.cat = t.slice(4); lastRenderKey = ""; renderWardrobe(); return; }
    if (t.indexOf("theme:") === 0) { uiState.theme = t.slice(6); lastRenderKey = ""; renderWardrobe(); return; }
    if (t.indexOf("variant:") === 0) {
      var parts = t.split(":");
      if (parts.length >= 3) setVariant(profile, parts[1], parts.slice(2).join(":"));
      ev.stopPropagation();
      lastRenderKey = ""; renderWardrobe(); return;
    }
    if (t.indexOf("tile:") === 0) {
      var id = t.slice(5), it = ITEMS[id];
      if (!it) return;
      if (uiState.mode === "wardrobe") {
        var wr = wearItem(profile, id);
        if (!wr.ok) alert("Chưa mặc được: " + wr.reason + ".");
      } else {
        var w = ensureWardrobe(profile);
        if (w.owned.indexOf(id) !== -1) { wearItem(profile, id); }
        else tryOnItem(profile, id);
      }
      lastRenderKey = ""; renderWardrobe(); return;
    }
    if (t === "clear-try") { clearTryOn(profile); lastRenderKey = ""; renderWardrobe(); return; }
    if (t.indexOf("buy-try:") === 0) {
      var bid = t.slice(8), bit = ITEMS[bid];
      if (!bit) return;
      if (levelOf(profile) < bit.level) { alert("Cần cấp " + bit.level + " mới mua được món này."); return; }
      if ((profile.coins || 0) < bit.price) { alert("Không đủ xu."); return; }
      if (window.confirm("Mua " + bit.name + " với " + bit.price + " xu? Sau khi mua còn " + ((profile.coins || 0) - bit.price) + " xu.")) {
        var br = buyItem(profile, bid);
        if (!br.ok) alert("Chưa mua được: " + br.reason + ".");
        try { if (typeof renderProfileBar === "function") renderProfileBar(); } catch (e) {}
      }
      lastRenderKey = ""; renderWardrobe(); return;
    }
    if (t.indexOf("wear-set:") === 0) { wearSet(profile, t.slice(9)); lastRenderKey = ""; renderWardrobe(); return; }
    if (t.indexOf("buy-set:") === 0) {
      var sid = t.slice(8), st = null, s2 = null, i2;
      for (i2 = 0; i2 < SETS.length; i2++) if (SETS[i2].id === sid) s2 = SETS[i2];
      if (!s2) return;
      st = setStatus(profile, s2);
      if (st.locked) { alert("Cần cấp " + st.locked.level + " cho " + st.locked.name + "."); return; }
      if ((profile.coins || 0) < st.total) { alert("Không đủ xu."); return; }
      if (window.confirm("Mua cả bộ " + s2.name + " với " + st.total + " xu? Sau khi mua còn " + ((profile.coins || 0) - st.total) + " xu.")) {
        var sr = buySet(profile, sid);
        if (!sr.ok) alert("Chưa mua được: " + sr.reason + ".");
        try { if (typeof renderProfileBar === "function") renderProfileBar(); } catch (e) {}
      }
      lastRenderKey = ""; renderWardrobe(); return;
    }
    if (t === "claim-newcomer") {
      var nr = claimNewcomer(profile);
      if (!nr.ok) alert("Chưa nhận được: " + nr.reason + ".");
      else alert("🎁 Đã nhận gói quà tân thủ: " + nr.items.map(function (x) { return ITEMS[x].name; }).join(" · ") + " + " + nr.coins + " xu!");
      try { if (typeof renderProfileBar === "function") renderProfileBar(); } catch (e) {}
      lastRenderKey = ""; renderWardrobe(); return;
    }
    if (t.indexOf("claim-box:") === 0) {
      var bl = parseInt(t.slice(10), 10), cr = claimBox(profile, bl);
      if (!cr.ok) { alert("Chưa mở được: " + cr.reason + "."); return; }
      var boxNames = cr.items.map(function (x) { return ITEMS[x].name; }).join(" · ");
      if (window.confirm("🎁 Hộp cấp " + bl + " có: " + boxNames + " + " + cr.coins + " xu.\nBấm OK để mặc ngay các món trong hộp, Cancel để để sau.")) wearBoxItems(profile, bl);
      try { if (typeof renderProfileBar === "function") renderProfileBar(); } catch (e) {}
      lastRenderKey = ""; renderWardrobe(); return;
    }
    if (t.indexOf("claim-gift:") === 0) {
      var gr = claimGift(profile, t.slice(11));
      if (!gr.ok) alert("Chưa nhận được: " + gr.reason + ".");
      else alert("🏅 Đã nhận quà đặc biệt: " + ITEMS[gr.item].name + "! Món này không bán trong cửa hàng.");
      try { if (typeof renderProfileBar === "function") renderProfileBar(); } catch (e) {}
      lastRenderKey = ""; renderWardrobe(); return;
    }
  }
  function initUi() {
    if (typeof document === "undefined") return;
    injectCss();
    if (!document.__wdDocListener) {
      document.__wdDocListener = true;
      document.addEventListener("click", handleClick);
    }
    /* Bọc finishScreen để đếm chuỗi đúng lần đầu (chỉ dùng cho
       quà 20 câu liên tiếp, không đổi luật sao/XP). Bọc scorePaper
       để nhận biết mô phỏng đạt điểm tuyệt đối (câu viết loại
       khỏi điểm theo thiết kế Phase 2). Cả hai đều gọi hàm gốc
       trước rồi mới ghi thêm, và chịu lỗi lặng để không phá game. */
    try {
      if (typeof root.finishScreen === "function" && !root.finishScreen.__wdwrapped) {
        var origFinish = root.finishScreen;
        var wrappedFinish = function (star) {
          var r = origFinish.apply(this, arguments);
          try { var p = getProfile(); if (p) recordAnswer(p, !!star); } catch (e) {}
          return r;
        };
        wrappedFinish.__wdwrapped = true;
        root.finishScreen = wrappedFinish;
        try { if (typeof finishScreen !== "undefined") finishScreen = wrappedFinish; } catch (e) {}
      }
    } catch (e) {}
    try {
      if (root.__v2p2 && typeof root.__v2p2.scorePaper === "function" && !root.__v2p2.scorePaper.__wdwrapped) {
        var origScore = root.__v2p2.scorePaper;
        var wrappedScore = function (paper, answers) {
          var sc = origScore(paper, answers);
          try {
            var p = getProfile();
            if (p && sc && sc.total > 0 && sc.correct === sc.total) { var w = ensureWardrobe(p); w.simPerfect = true; saveNow(p); }
          } catch (e) {}
          return sc;
        };
        wrappedScore.__wdwrapped = true;
        root.__v2p2.scorePaper = wrappedScore;
      }
    } catch (e) {}
    /* Màn chọn giới tính một lần cho người chơi cũ. */
    try {
      var prof0 = getProfile();
      if (prof0) {
        var mig = migrateHuman(prof0);
        if (mig.needsGate) showGenderGate(prof0);
      }
    } catch (e) {}
    renderWardrobe();
    setInterval(function () { renderWardrobe(); checkLevelUp(); }, 3000);
  }

  var api = {
    ITEMS: ITEMS, SETS: SETS, BOXES: BOXES, GIFTS: GIFTS, NEWCOMER: NEWCOMER,
    CATEGORIES: CATEGORIES, SLOTS: SLOTS, SLOT_LABEL: SLOT_LABEL, TONE_MOD: TONE_MOD,
    levelForXp: levelForXp, levelOf: levelOf, ensureWardrobe: ensureWardrobe,
    migrateHuman: migrateHuman, setGender: setGender, setSkinTone: setSkinTone,
    isMasteredSkill: isMasteredSkill, visibleItems: visibleItems, categoryItems: categoryItems,
    resolveBoxItems: resolveBoxItems, boxContents: boxContents, boxAvailable: boxAvailable,
    newcomerAvailable: newcomerAvailable, claimNewcomer: claimNewcomer, claimBox: claimBox,
    wearBoxItems: wearBoxItems, giftAvailable: giftAvailable, claimGift: claimGift,
    tryOnItem: tryOnItem, clearTryOn: clearTryOn, wearItem: wearItem, unequipSlot: unequipSlot,
    buyItem: buyItem, setVariant: setVariant, resolveSetItems: resolveSetItems,
    setStatus: setStatus, wearSet: wearSet, buySet: buySet,
    saveOutfit: saveOutfit, applyOutfit: applyOutfit, deleteOutfit: deleteOutfit, renameOutfit: renameOutfit,
    recordAnswer: recordAnswer, effectiveEquipped: effectiveEquipped, dollHTML: dollHTML,
    faceEmoji: faceEmoji, variantOf: variantOf
  };
  root.__v2wardrobe = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined" && document) {
    try { initUi(); } catch (e) {}
  }
})();
