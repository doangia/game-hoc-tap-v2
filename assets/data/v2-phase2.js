/* ================================================================
   GAME HỌC TẬP v2 — PHASE 2: Nội dung thích ứng + mô phỏng kiểm tra
   Chỉ cho 2 chủ đề thí điểm: Toán lớp 8 Chương I (m8-c1) và Ngữ văn
   lớp 8 Bài 1 (nv8-b1). Không viết lại engine, không làm Phase 3-5.
   - Kĩ năng lưu trong profile.skills (localStorage, cùng hồ sơ v2).
   - Luật thích ứng theo research adaptive-learning.md, không đổi số:
     tăng sau 3 đúng liên tiếp HOẶC >=80% trong 10 câu gần nhất;
     giảm sau 2 sai liên tiếp HOẶC <40% trong cửa sổ gần nhất;
     giữ mức tối thiểu 3 câu, tối đa +1 mức mỗi lượt.
   - Ôn cách quãng: khoảng 1 -> 3 -> 7 -> 14 ngày; sai đặt lại 1 ngày.
   - Ngữ văn dùng đoạn trích VIẾT RIÊNG CHO GAME (không phải trích
     SGK), ghi rõ trong giao diện để giáo viên thay bằng đoạn có
     phép dùng sau. V4 chỉ tính "đã hoàn thành có đối chiếu", KHÔNG
     tính điểm kiểm tra.
   - TTS giọng nữ chỉ cho câu cố định mới (xem cuối file).
   File này chạy được cả trong trình duyệt (script tag) và trong Node
   để kiểm chứng (không chạm document ở lúc nạp).
   ================================================================ */
(function () {
  var root = (typeof window !== "undefined") ? window : (typeof global !== "undefined" ? global : this);
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pickArr(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffleArr(arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function todayStr(d) {
    d = d || new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (day < 10 ? "0" + day : day);
  }
  function addDaysStr(str, n) {
    var p = String(str).split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() + n);
    return todayStr(d);
  }
  function escHtml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------------- Định nghĩa kĩ năng ---------------- */
  var SKILLS = {
    "m8-mono": { name: "Bậc và hệ số của đơn thức", topic: "m8-c1" },
    "m8-addsub": { name: "Cộng và trừ đa thức", topic: "m8-c1" },
    "m8-mul": { name: "Nhân đa thức", topic: "m8-c1" },
    "m8-div": { name: "Chia đa thức cho đơn thức", topic: "m8-c1" },
    "m8-value": { name: "Tính giá trị đa thức", topic: "m8-c1" },
    "m8-simplify": { name: "Thu gọn đa thức", topic: "m8-c1" },
    "m8-word": { name: "Bài toán lời văn với đa thức", topic: "m8-c1" },
    "m8-steps": { name: "Sắp xếp bước giải", topic: "m8-c1" },
    "m8-error": { name: "Tìm lỗi sai trong lời giải", topic: "m8-c1" },
    "m8-inverse": { name: "Bài toán ngược với đa thức", topic: "m8-c1" },
    "nv1-author": { name: "Tác giả, tác phẩm, nhân vật Bài 1", topic: "nv8-b1" },
    "nv1-history": { name: "Sự kiện lịch sử trong Bài 1", topic: "nv8-b1" },
    "nv1-meaning": { name: "Ý nghĩa chi tiết và không khí Bài 1", topic: "nv8-b1" },
    "nv1-inference": { name: "Suy luận từ chi tiết trong đoạn trích", topic: "nv8-b1" },
    "nv1-wordchoice": { name: "Tác dụng của cách viết", topic: "nv8-b1" },
    "nv1-theme": { name: "Chủ đề và bằng chứng", topic: "nv8-b1" },
    "nv1-writing": { name: "Viết đoạn văn ngắn", topic: "nv8-b1" }
  };
  var HINTS = {
    "m8-mono": "Gợi ý từng bước: bậc là tổng số mũ; hệ số là số đứng trước biến.",
    "m8-addsub": "Gợi ý từng bước: (1) Bỏ ngoặc, đổi dấu sau dấu trừ. (2) Nhóm hạng tử đồng dạng. (3) Cộng, trừ các hệ số.",
    "m8-mul": "Gợi ý từng bước: (1) Nhân hệ số với hệ số. (2) Nhân biến với biến, cộng số mũ. (3) Viết kết quả đầy đủ.",
    "m8-div": "Gợi ý từng bước: (1) Chia hệ số cho hệ số. (2) Chia biến cho biến, trừ số mũ. (3) Viết thương đầy đủ.",
    "m8-value": "Gợi ý từng bước: (1) Thu gọn trước nếu có thể. (2) Thay số vào. (3) Tính theo thứ tự.",
    "m8-simplify": "Gợi ý từng bước: (1) Bỏ ngoặc, đổi dấu sau dấu trừ. (2) Nhóm hạng tử đồng dạng. (3) Cộng, trừ hệ số.",
    "m8-word": "Gợi ý từng bước: (1) Viết biểu thức từ lời văn. (2) Thu gọn biểu thức. (3) Thay số rồi tính.",
    "m8-steps": "Gợi ý từng bước: nhân và bỏ ngoặc trước, rồi nhóm hạng tử đồng dạng, rồi cộng hệ số, cuối cùng viết kết quả.",
    "m8-error": "Gợi ý từng bước: kiểm tra riêng bước bỏ ngoặc sau dấu trừ — dấu của hạng tử sau dấu trừ phải đổi.",
    "m8-inverse": "Gợi ý từng bước: muốn tìm B thì lấy tổng trừ đi A, tức là trừ từng hạng tử tương ứng, nhớ đổi dấu.",
    "nv1-inference": "Gợi ý: suy luận phải có căn cứ trong đoạn trích, không nhắc lại mặt chữ và không suy diễn quá xa.",
    "nv1-wordchoice": "Gợi ý: nối hình thức ngôn ngữ với tác dụng — từ ngữ cũ, sờn, nhạt màu gợi thời gian và sự bền bỉ.",
    "nv1-theme": "Gợi ý: chọn chủ đề rồi tìm đúng chi tiết làm bằng chứng, đừng chọn bằng chứng bừa.",
    "nv1-author": "Gợi ý: nhớ tác giả gắn với tác phẩm, đừng đoán theo tên nghe quen.",
    "nv1-history": "Gợi ý: gắn sự kiện với thời gian và địa danh đi kèm trong bài.",
    "nv1-meaning": "Gợi ý: hình ảnh trong bài thường tượng trưng cho tinh thần, không chỉ miêu tả đồ vật.",
    "nv1-writing": "Gợi ý: gọi tên chi tiết, nêu ý nghĩa của nó, rồi kết nối với chủ đề chung."
  };
  var REVIEW_STEPS = [1, 3, 7, 14];
  function nextInterval(cur) {
    var i = REVIEW_STEPS.indexOf(cur);
    if (i < 0) return 1;
    return REVIEW_STEPS[Math.min(i + 1, REVIEW_STEPS.length - 1)];
  }

  /* ---------------- Trạng thái hồ sơ ---------------- */
  function ensureProfileV2(profile) {
    if (!profile) return null;
    if (!profile.skills) profile.skills = {};
    if (!profile.review) profile.review = [];
    if (!profile.sim) profile.sim = {};
    return profile;
  }
  function skillState(profile, skillId) {
    ensureProfileV2(profile);
    if (!profile.skills[skillId]) {
      profile.skills[skillId] = { level: 1, correct: 0, total: 0, window: [], streakC: 0, streakW: 0, atLevel: 0, changedRound: null, nextReview: null, interval: 1, reviewCount: 0, nextEasy: false };
    }
    var st = profile.skills[skillId];
    if (!st.window) st.window = [];
    if (typeof st.level !== "number" || st.level < 1) st.level = 1;
    if (st.level > 4) st.level = 4;
    return st;
  }
  var currentRoundId = 0;
  function startRound() { currentRoundId++; return currentRoundId; }
  function recordSkill(profile, skillId, correct, opts) {
    opts = opts || {};
    var st = skillState(profile, skillId);
    if (typeof st.sinceChange !== "number") st.sinceChange = 99;
    var roundId = (opts.roundId != null) ? opts.roundId : currentRoundId;
    st.total++;
    st.window.push(correct ? 1 : 0);
    if (st.window.length > 10) st.window = st.window.slice(st.window.length - 10);
    st.atLevel++; st.sinceChange++;
    if (correct) { st.correct++; st.streakC++; st.streakW = 0; } else { st.streakC = 0; st.streakW++; }
    var changed = null;
    /* Giữ mức tối thiểu 3 câu SAU MỘT LẦN ĐỔI MỨC (sinceChange); tối đa
       1 lần đổi mức mỗi lượt (changedRound). Mức ban đầu chưa từng đổi
       thì sinceChange=99 nên 3 đúng / 2 sai liên tiếp đổi ngay, đúng
       luật research: tăng sau 3 đúng, giảm sau 2 sai. */
    if (st.sinceChange >= 3 && st.changedRound !== roundId) {
      var winSum = 0, wi;
      for (wi = 0; wi < st.window.length; wi++) winSum += st.window[wi];
      var winRate = st.window.length ? winSum / st.window.length : 0;
      if (correct && st.level < 4 && (st.streakC >= 3 || (st.window.length >= 10 && winRate >= 0.8))) {
        st.level++; changed = "up"; st.atLevel = 0; st.sinceChange = 0; st.streakC = 0; st.streakW = 0; st.changedRound = roundId;
      } else if (!correct && st.level > 1 && (st.streakW >= 2 || (st.window.length >= 5 && winRate < 0.4))) {
        st.level--; changed = "down"; st.atLevel = 0; st.sinceChange = 0; st.streakC = 0; st.streakW = 0; st.changedRound = roundId; st.nextEasy = true;
      }
    }
    if (st.nextEasy && correct) st.nextEasy = false;
    return { skill: skillId, level: st.level, changed: changed, nextEasy: !!st.nextEasy, windowRate: st.window.length ? (function () { var s = 0; for (var i = 0; i < st.window.length; i++) s += st.window[i]; return s / st.window.length; })() : 0 };
  }
  function addReview(profile, skillId, topicKey, promptText, today) {
    ensureProfileV2(profile);
    today = today || todayStr();
    var found = null, i;
    for (i = 0; i < profile.review.length; i++) {
      if (profile.review[i].skill === skillId && profile.review[i].topic === topicKey) { found = profile.review[i]; break; }
    }
    if (found) { found.interval = 1; found.nextReview = addDaysStr(today, 1); found.prompt = promptText || found.prompt; return found; }
    var item = { skill: skillId, topic: topicKey, prompt: promptText || "", interval: 1, nextReview: addDaysStr(today, 1), count: 0 };
    profile.review.push(item);
    return item;
  }
  function dueReviews(profile, today) {
    ensureProfileV2(profile);
    today = today || todayStr();
    return profile.review.filter(function (r) { return r.nextReview && r.nextReview <= today; });
  }
  function answerReview(profile, skillId, correct, today) {
    ensureProfileV2(profile);
    today = today || todayStr();
    var item = null, i;
    for (i = 0; i < profile.review.length; i++) { if (profile.review[i].skill === skillId) { item = profile.review[i]; break; } }
    if (!item) return null;
    if (correct) { item.interval = nextInterval(item.interval); item.count++; item.nextReview = addDaysStr(today, item.interval); }
    else { item.interval = 1; item.nextReview = addDaysStr(today, 1); var st = skillState(profile, skillId); st.nextEasy = true; }
    return item;
  }
  function weakSkills(profile, report) {
    /* Yếu = đúng < 70% trong báo cáo mô phỏng (ngưỡng ôn lại của research). */
    var out = [], k;
    for (k in report) { if (report[k].total > 0 && report[k].correct / report[k].total < 0.7) out.push(k); }
    return out;
  }

  /* ---------------- Hỗ trợ viết đa thức ---------------- */
  /* Sửa lỗi hiển thị 24/10: đề bài vẽ bằng textContent nên thẻ <sup> sẽ
     hiện nguyên văn "x<sup>2</sup>" thay vì mũ. Dùng ký tự mũ Unicode
     (², ³…) như phần còn lại của game, để đề, phương án, giải thích và
     mô phỏng đều hiển thị giống nhau dù vẽ bằng text hay HTML. */
  var SUPMAP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  function supUnicode(n) {
    return String(n).split("").map(function (c) { return SUPMAP[c] || c; }).join("");
  }
  function fmtTerm(coef, variable, power) {
    if (coef === 0) return "";
    var abs = Math.abs(coef), body;
    if (!variable) body = String(abs);
    else if (power === 1) body = (abs === 1 ? "" : String(abs)) + variable;
    else body = (abs === 1 ? "" : String(abs)) + variable + supUnicode(power);
    return (coef < 0 ? "-" : "+") + body;
  }
  function fmtPoly(c2, c1, c0) {
    var s = fmtTerm(c2, "x", 2) + fmtTerm(c1, "x", 1) + fmtTerm(c0, "", 0);
    if (s === "") return "0";
    if (s.charAt(0) === "+") s = s.slice(1);
    return s.replace(/\+-/g, "- ").replace(/\+/g, " + ").replace(/- /g, "- ").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
  }
  function fmtMono(c2, c1, c0) { return fmtPoly(c2, c1, c0); }
  function mcq(prompt, options, answerIndex, explain, extra) {
    extra = extra || {};
    var opts = options.map(function (o) { return { html: "<span class=\"opt-text\">" + o + "</span>" }; });
    return { prompt: prompt, options: opts, answer: answerIndex, cols: 3, optStack: true, explain: explain, visual: extra.visual || "", badge: extra.badge || "🧠 Vận dụng", __v2skill: extra.skill, __v2level: extra.level, __v2topic: extra.topic };
  }
  function shuffleOptions(options, answerIndex) {
    var idx = options.map(function (_, i) { return i; });
    idx = shuffleArr(idx);
    return { options: idx.map(function (i) { return options[i]; }), answer: idx.indexOf(answerIndex) };
  }

  /* ---------------- Toán: T1 lời văn (2 chặng, lượt thường gộp cặp) ---------------- */
  function mathWordParams() {
    var a, b, c, x0, guard = 0;
    do {
      a = randInt(2, 3); b = randInt(2, 5); c = randInt(1, 2); x0 = randInt(4, 6); guard++;
    } while ((b - a * c) === 0 && guard < 50);
    return { a: a, b: b, c: c, x0: x0, c2: a, c1: b - a * c, c0: -b * c, value: a * x0 * x0 + (b - a * c) * x0 - b * c };
  }
  function genMathWord() {
    var p = mathWordParams();
    var poly = fmtPoly(p.c2, p.c1, p.c0);
    var opts = [
      poly + " và " + p.value,
      fmtPoly(p.c2, 0, p.c0) + " và " + (p.c2 * p.x0 * p.x0 + p.c0),
      fmtPoly(p.c2, -p.c1, p.c0) + " và " + (p.c2 * p.x0 * p.x0 - p.c1 * p.x0 + p.c0),
      fmtPoly(p.c2, p.c1 + p.c2, p.c0) + " và " + (p.c2 * p.x0 * p.x0 + (p.c1 + p.c2) * p.x0 + p.c0)
    ];
    var sh = shuffleOptions(opts, 0);
    return mcq("Một hình chữ nhật có chiều dài (" + p.a + "x + " + p.b + ") cm, chiều rộng (x - " + p.c + ") cm, với x > " + p.c + ". Đa thức biểu thị diện tích sau khi thu gọn là gì, và diện tích khi x = " + p.x0 + " là bao nhiêu cm²? (Nhiễu là lỗi hay gặp: bỏ hạng tử giữa, sai dấu, cộng sai hệ số.)",
      sh.options, sh.answer,
      "Diện tích = (" + p.a + "x + " + p.b + ")(x - " + p.c + ") = " + poly + ". Thay x = " + p.x0 + " được " + p.value + " cm².",
      { skill: "m8-word", level: 4, topic: "m8-c1" });
  }
  /* ---------------- Toán: T2 sắp xếp bước giải ---------------- */
  function mathStepsParams() {
    var a, b, c, d, guard = 0;
    do { a = randInt(2, 3); b = randInt(2, 3); c = randInt(4, 6); d = randInt(3, 5); guard++; } while ((c - a * b) === 0 && guard < 50);
    return { a: a, b: b, c: c, d: d, c2: a - 1, c1: c - a * b, c0: d };
  }
  function genMathSteps() {
    var p = mathStepsParams();
    var result = fmtPoly(p.c2, p.c1, p.c0);
    return {
      kind: "sort", badge: "🎮 Sắp xếp bước giải", prompt: "Thu gọn P = " + p.a + "x(x - " + p.b + ") - (x² - " + p.c + "x) + " + p.d + ". Chạm các bước theo đúng thứ tự nhé!",
      items: [
        "Nhân đơn thức với đa thức và bỏ ngoặc, đổi dấu sau dấu trừ",
        "Nhóm các hạng tử đồng dạng",
        "Cộng, trừ các hệ số",
        "Viết kết quả thu gọn: P = " + result
      ],
      explain: "P = " + p.a + "x² - " + (p.a * p.b) + "x - x² + " + p.c + "x + " + p.d + " = " + result + ".",
      __v2skill: "m8-steps", __v2level: 3, __v2topic: "m8-c1"
    };
  }
  /* ---------------- Toán: T3 tìm lỗi sai ---------------- */
  function mathErrorParams() {
    var p = randInt(2, 4), q = randInt(2, 6), r = randInt(2, 5);
    return { p: p, q: q, r: r, wrong: fmtPoly(p - 1, q - r, 0), right: fmtPoly(p - 1, q + r, 0) };
  }
  function genMathError() {
    var p = mathErrorParams();
    var opts = [
      "Lỗi ở bước bỏ ngoặc sau dấu trừ — kết quả đúng là " + p.right,
      "Lỗi ở phép trừ hệ số " + p.p + " - 1 — kết quả đúng là " + p.wrong,
      "Lỗi ở bậc của x² — kết quả đúng là " + fmtPoly(p.p, p.q + p.r, 0)
    ];
    var sh = shuffleOptions(opts, 0);
    return mcq("Bạn An tính (" + p.p + "x² + " + p.q + "x) - (x² - " + p.r + "x) và viết kết quả " + p.wrong + ". Bước nào sai và kết quả đúng là gì?",
      sh.options, sh.answer,
      "Khi bỏ ngoặc sau dấu trừ, -(-" + p.r + "x) phải thành +" + p.r + "x, nên kết quả đúng là " + p.right + ".",
      { skill: "m8-error", level: 4, topic: "m8-c1" });
  }
  /* ---------------- Toán: T4 bài toán ngược ---------------- */
  function mathInverseParams() {
    var b2 = randInt(1, 3), b1 = randInt(-4, 4), b0 = randInt(1, 5), a2 = randInt(1, 2), a1 = randInt(1, 4), a0 = randInt(1, 3), x0 = randInt(2, 4);
    if (b1 === 0) b1 = 2;
    return { a2: a2, a1: a1, a0: a0, b2: b2, b1: b1, b0: b0, x0: x0, s2: a2 + b2, s1: a1 + b1, s0: a0 + b0, value: b2 * x0 * x0 + b1 * x0 + b0 };
  }
  function genMathInverse() {
    var p = mathInverseParams();
    var bPoly = fmtPoly(p.b2, p.b1, p.b0);
    var opts = [
      "B = " + bPoly + " và B(" + p.x0 + ") = " + p.value,
      "B = " + fmtPoly(p.s2 - p.a2, p.s1 + p.a1, p.s0 - p.a0) + " và B(" + p.x0 + ") = " + (p.b2 * p.x0 * p.x0 + (p.s1 + p.a1) * p.x0 + (p.s0 - p.a0)),
      "B = " + fmtPoly(p.s2, p.s1, p.s0) + " và B(" + p.x0 + ") = " + (p.s2 * p.x0 * p.x0 + p.s1 * p.x0 + p.s0)
    ];
    var sh = shuffleOptions(opts, 0);
    return mcq("Biết A + B = " + fmtPoly(p.s2, p.s1, p.s0) + " và A = " + fmtPoly(p.a2, p.a1, p.a0) + ". Tìm đa thức B rồi tính giá trị của B khi x = " + p.x0 + ".",
      sh.options, sh.answer,
      "B = (A + B) - A = " + bPoly + "; thay x = " + p.x0 + " được " + p.value + ".",
      { skill: "m8-inverse", level: 4, topic: "m8-c1" });
  }
  /* ---------------- Toán: dạng đầy đủ cho mô phỏng ---------------- */
  function genMathSimplifyFull() {
    var a = randInt(2, 5), b = randInt(2, 6), c = randInt(2, 4), d = randInt(2, 5), e = randInt(2, 4);
    var right = fmtPoly(a - c, b + d, -e);
    var opts = [right, fmtPoly(a + c, b + d, -e), fmtPoly(a - c, b - d, -e), fmtPoly(a - c, b + d, e)];
    var sh = shuffleOptions(opts, 0);
    return mcq("Thu gọn đa thức: " + a + "x² + " + b + "x - " + c + "x² + " + d + "x - " + e + ". Kết quả đầy đủ là gì?",
      sh.options, sh.answer, "Nhóm hạng tử đồng dạng: (" + a + " - " + c + ")x² + (" + b + " + " + d + ")x - " + e + " = " + right + ".",
      { skill: "m8-simplify", level: 3, topic: "m8-c1" });
  }
  function genMathAddSubFull() {
    var a = randInt(2, 4), b = randInt(2, 5), cc = randInt(1, 4), d = randInt(1, 3), e = randInt(2, 5), f = randInt(1, 4);
    var right = fmtPoly(a - d, b - e, cc - f);
    var opts = [right, fmtPoly(a - d, b + e, cc - f), fmtPoly(a + d, b - e, cc + f), fmtPoly(a - d, b - e, cc + f)];
    var sh = shuffleOptions(opts, 0);
    return mcq("Tính đầy đủ: (" + a + "x² + " + b + "x + " + cc + ") - (" + d + "x² + " + e + "x + " + f + ").",
      sh.options, sh.answer, "Trừ từng hạng tử tương ứng, nhớ đổi dấu sau dấu trừ: " + right + ".",
      { skill: "m8-addsub", level: 3, topic: "m8-c1" });
  }
  function genMathMulFull() {
    var a = randInt(2, 5), b = randInt(2, 5);
    var right = fmtPoly(1, a + b, a * b);
    var opts = [right, fmtPoly(1, a + b, -a * b), fmtPoly(1, a - b, a * b), "x² + " + (a * b) + "x + " + (a + b)];
    var sh = shuffleOptions(opts, 0);
    return mcq("Khai triển đầy đủ: (x + " + a + ")(x + " + b + ").",
      sh.options, sh.answer, "(x + " + a + ")(x + " + b + ") = x² + " + (a + b) + "x + " + (a * b) + ".",
      { skill: "m8-mul", level: 3, topic: "m8-c1" });
  }
  function genMathValueAfterSimplify() {
    var p = mathStepsParams();
    var x0 = randInt(2, 4);
    var val = p.c2 * x0 * x0 + p.c1 * x0 + p.c0;
    return { kind: "input", skill: "m8-value", level: 3, topic: "m8-c1", __v2skill: "m8-value", __v2level: 3, __v2topic: "m8-c1", prompt: "Thu gọn rồi tính giá trị: P = " + p.a + "x(x - " + p.b + ") - (x² - " + p.c + "x) + " + p.d + " tại x = " + x0 + ". Điền số (không kèm đơn vị).", answerNum: val, explain: "Thu gọn được P = " + fmtPoly(p.c2, p.c1, p.c0) + "; thay x = " + x0 + " được " + val + "." };
  }
  function genMathMissingCoeff() {
    var a = randInt(2, 4), x0 = randInt(2, 4), k = randInt(2, 6), rest = randInt(2, 8);
    var target = a * x0 * x0 + k * x0 + rest;
    var opts = [String(k), String(k + a), String(k - 1), String(k + 2)];
    var sh = shuffleOptions(opts, 0);
    return mcq("Tìm hệ số k sao cho đa thức P(x) = " + a + "x² + kx + " + rest + " có giá trị bằng " + target + " tại x = " + x0 + ".",
      sh.options, sh.answer, "Thay x = " + x0 + ": " + (a * x0 * x0) + " + " + x0 + "k + " + rest + " = " + target + " nên k = " + k + ".",
      { skill: "m8-value", level: 4, topic: "m8-c1" });
  }
  function genMathDivFull() {
    var b = randInt(2, 5), k = randInt(2, 4), n = randInt(0, 2), m = n + randInt(1, 3);
    var a = b * k;
    var sup = function (e) { return e === 0 ? "" : (e === 1 ? "x" : "x" + supUnicode(e)); };
    var right = k + sup(m - n);
    var opts = [right, String(k), (k + 1) + sup(m - n), k + sup(m)];
    var sh = shuffleOptions(opts, 0);
    return mcq("Chia đầy đủ: (" + a + sup(m) + ") : (" + b + sup(n) + ").",
      sh.options, sh.answer, "Chia hệ số: " + a + " : " + b + " = " + k + "; chia biến: x" + supUnicode(m) + " : x" + supUnicode(n) + " = x" + supUnicode(m - n) + ".",
      { skill: "m8-div", level: 3, topic: "m8-c1" });
  }

  /* ---------------- Ngữ văn: 3 đoạn trích VIẾT RIÊNG CHO GAME ----------------
     Rõ ràng: đây KHÔNG phải trích SGK. Giao diện mô phỏng sẽ ghi chú
     "Đoạn trích viết cho game — giáo viên có thể thay bằng đoạn trích
     có phép dùng". Mỗi cụm có 1 câu hiểu trực tiếp, 1 suy luận (V1),
     1 tác dụng cách viết (V2), 1 chủ đề (V3a) + 1 bằng chứng (V3b),
     1 viết ngắn (V4, chỉ mô phỏng, không tính điểm). */
  var LIT_PASSAGES = [
    {
      id: "p1", title: "Lá cờ trong gian nhà nhỏ",
      text: "Lá cờ treo trong gian nhà nhỏ đã bạc màu, mép cờ sờn đi nhiều chỗ. Mỗi lần có khách tới, bà cụ lại kể về người em trai mới mười sáu tuổi đã xin theo đoàn quân năm ấy. “Nó không sợ chết, chỉ sợ mình không được góp sức”, bà nói, rồi im lặng một lúc lâu, như đang nghe lại tiếng trống trận từ rất xa.",
      direct: { q: "Người em trai trong đoạn trích xin theo đoàn quân khi bao nhiêu tuổi?", options: ["Mười sáu tuổi", "Mười tám tuổi", "Hai mươi tuổi"], answer: 0, explain: "Đoạn trích viết rõ: người em trai mới mười sáu tuổi đã xin theo đoàn quân." },
      inference: { q: "Từ chi tiết bà cụ “im lặng một lúc lâu, như đang nghe lại tiếng trống trận”, có thể suy ra điều gì mà đoạn trích không nói thẳng?", options: ["Ký ức chiến trận vẫn sống động và nặng nề trong bà, không chỉ là chuyện kể lại", "Bà bị lãng tai nên không nghe thấy khách hỏi", "Bà muốn quay lại chiến trận ngay lập tức"], answer: 0, explain: "Chi tiết im lặng và “như đang nghe lại” cho thấy ký ức vẫn sống, không phải bà không nghe hay muốn trở lại chiến trận." },
      wordchoice: { q: "Vì sao tác giả không viết “lá cờ còn mới” mà viết “lá cờ đã bạc màu, mép cờ sờn đi”?", options: ["Chi tiết cũ, sờn, bạc màu làm nổi bật thời gian đã trôi qua và giá trị bền bỉ của lá cờ", "Để cho biết lá cờ được làm bằng vải kém chất lượng", "Để tả đồ vật trong nhà cho đủ chi tiết"], answer: 0, explain: "Cách viết nhấn vào thời gian và sự bền bỉ, chứ không chỉ miêu tả đồ vật hay chê chất lượng vải." },
      theme: { q: "Chủ đề nào phù hợp nhất với đoạn trích?", options: ["Lòng yêu nước của tuổi trẻ và sức nặng của ký ức", "Ca ngợi sự giàu sang của gia đình", "Châm biếm quan lại thời xưa"], answer: 0, explain: "Tuổi trẻ xin ra trận và ký ức nặng nề của người ở lại là hai ý chính của đoạn trích." },
      evidence: { q: "Chi tiết nào là bằng chứng mạnh nhất cho chủ đề em vừa chọn?", options: ["“Mới mười sáu tuổi đã xin theo đoàn quân” và “không sợ chết, chỉ sợ mình không được góp sức”", "Lá cờ treo trong gian nhà nhỏ", "Có khách tới chơi nhà bà cụ"], answer: 0, explain: "Tuổi trẻ và câu nói về việc góp sức là bằng chứng trực tiếp cho lòng yêu nước, các chi tiết còn lại chỉ là bối cảnh." },
      writing: { prompt: "Viết 3–5 câu nêu cảm nhận của em về hình ảnh lá cờ trong đoạn trích.", rubric: ["Gọi tên đúng chi tiết (lá cờ bạc màu, sờn mép)", "Nêu được ý nghĩa hoặc tác dụng của chi tiết", "Kết nối với chủ đề chung (lòng yêu nước, ký ức)"], model: "Lá cờ bạc màu, sờn mép không chỉ là một đồ vật cũ. Nó gợi thời gian đã trôi qua và những năm tháng tuổi trẻ đã cống hiến. Nhìn lá cờ, người đọc hiểu vì sao ký ức chiến trận vẫn nặng nề trong lòng người ở lại." }
    },
    {
      id: "p2", title: "Người đưa thư trong đêm",
      text: "Đêm ấy, cậu bé mười bốn tuổi mang lá thư đi qua cánh rừng tối, chỉ có ánh trăng soi lối. Có đoạn đường ngập nước tới đầu gối, có đoạn phải leo qua mô đất trơn, nhưng cậu không quay lại. Sáng hôm sau, lá thư tới tay người nhận đúng giờ hẹn, còn đôi giày của cậu thì dính đầy bùn đất.",
      direct: { q: "Cậu bé trong đoạn trích mang thứ gì đi trong đêm?", options: ["Một lá thư", "Một lá cờ", "Một gói lương thực"], answer: 0, explain: "Đoạn trích viết rõ cậu mang lá thư đi qua cánh rừng tối." },
      inference: { q: "Từ chi tiết “đôi giày dính đầy bùn đất” vào sáng hôm sau, có thể suy ra điều gì?", options: ["Đường đi rất gian nan, nhưng cậu đã đi tới nơi thay vì bỏ cuộc", "Cậu đi chơi và làm bẩn giày", "Cậu không biết đường nên đi lạc cả đêm"], answer: 0, explain: "Bùn đất là dấu vết của đường ngập nước và mô đất trơn đã vượt qua, và thư tới đúng giờ hẹn chứng tỏ cậu không bỏ cuộc hay đi lạc." },
      wordchoice: { q: "Vì sao tác giả viết “chỉ có ánh trăng soi lối” thay vì viết “đường rất sáng”?", options: ["Để làm nổi bật sự đơn độc và khó khăn của chuyến đi trong đêm", "Để tả thời tiết đẹp", "Để cho biết đêm đó có trăng"], answer: 0, explain: "Ánh trăng lẻ loi nhấn mạnh cậu đi một mình trong đêm tối, không phải tả thời tiết hay đường sáng." },
      theme: { q: "Chủ đề nào phù hợp nhất với đoạn trích?", options: ["Trách nhiệm và lòng dũng cảm của tuổi trẻ", "Ca ngợi cảnh đẹp của rừng đêm", "Châm biếm người lớn giao việc khó cho trẻ em"], answer: 0, explain: "Cậu bé giữ đúng giờ hẹn dù đường gian nan là biểu hiện của trách nhiệm và dũng cảm." },
      evidence: { q: "Chi tiết nào là bằng chứng mạnh nhất cho chủ đề em vừa chọn?", options: ["“Có đoạn ngập nước tới đầu gối, có đoạn phải leo qua mô đất trơn, nhưng cậu không quay lại” và thư tới đúng giờ hẹn", "Đêm ấy có trăng", "Đôi giày của cậu dính bùn"], answer: 0, explain: "Việc không quay lại và thư tới đúng giờ là bằng chứng trực tiếp cho trách nhiệm, các chi tiết còn lại chỉ là bối cảnh." },
      writing: { prompt: "Viết 3–5 câu nêu cảm nhận của em về nhân vật cậu bé đưa thư.", rubric: ["Gọi tên đúng chi tiết (đi đêm, đường ngập nước, không quay lại)", "Nêu được phẩm chất của nhân vật (trách nhiệm, dũng cảm)", "Kết nối với chủ đề chung"], model: "Cậu bé đưa thư chỉ mới mười bốn tuổi nhưng đã giữ đúng lời hẹn dù đường đi ngập nước và trơn trượt. Việc cậu không quay lại cho thấy trách nhiệm lớn hơn nỗi sợ. Đó là dũng cảm thầm lặng, không cần lời khen ngợi." }
    },
    {
      id: "p3", title: "Người thầy giữ sách",
      text: "Trong căn nhà nhỏ cuối làng, thầy giáo già vẫn giữ những cuốn sách cũ, trang giấy đã ngả vàng. Mỗi buổi chiều, thầy mở sách kể cho lũ trẻ nghe về những con người năm xưa, giọng thầy chậm rãi nhưng rõ ràng. Lũ trẻ ngồi im, có đứa còn hỏi: “Thưa thầy, sao người xưa lại làm được những việc lớn đến vậy?”",
      direct: { q: "Mỗi buổi chiều, thầy giáo trong đoạn trích làm gì?", options: ["Mở sách kể cho lũ trẻ nghe về những con người năm xưa", "Dạy lũ trẻ làm toán", "Đi thăm từng nhà trong làng"], answer: 0, explain: "Đoạn trích viết rõ: mỗi buổi chiều thầy mở sách kể cho lũ trẻ nghe về những con người năm xưa." },
      inference: { q: "Từ câu hỏi của lũ trẻ “sao người xưa lại làm được những việc lớn đến vậy?”, có thể suy ra điều gì?", options: ["Câu chuyện của thầy đã khơi dậy sự ngưỡng mộ và tò mò ở lũ trẻ, không chỉ là nghe cho qua", "Lũ trẻ không hiểu gì về câu chuyện", "Lũ trẻ muốn thầy kể chuyện khác"], answer: 0, explain: "Câu hỏi thể hiện sự ngưỡng mộ và muốn hiểu, không phải không hiểu hay muốn đổi chuyện." },
      wordchoice: { q: "Vì sao tác giả viết “trang giấy đã ngả vàng” thay vì viết “sách còn mới”?", options: ["Để gợi thời gian lâu dài và giá trị của những cuốn sách được giữ gìn", "Để cho biết sách bị hỏng", "Để tả màu sắc của giấy cho đủ chi tiết"], answer: 0, explain: "Giấy ngả vàng nhấn mạnh sách đã qua nhiều năm nhưng vẫn được giữ gìn và kể lại, không phải sách hỏng." },
      theme: { q: "Chủ đề nào phù hợp nhất với đoạn trích?", options: ["Giữ gìn và truyền lại ký ức, bài học cho thế hệ sau", "Ca ngợi sự giàu có của ngôi làng", "Châm biếm việc học thuộc lòng"], answer: 0, explain: "Thầy giữ sách và kể lại cho lũ trẻ là hành động truyền lại ký ức cho thế hệ sau." },
      evidence: { q: "Chi tiết nào là bằng chứng mạnh nhất cho chủ đề em vừa chọn?", options: ["“Thầy vẫn giữ những cuốn sách cũ” và “mở sách kể cho lũ trẻ nghe” mỗi buổi chiều", "Căn nhà nhỏ cuối làng", "Giọng thầy chậm rãi"], answer: 0, explain: "Việc giữ sách và kể lại đều đặn là bằng chứng trực tiếp cho việc truyền lại ký ức." },
      writing: { prompt: "Viết 3–5 câu nêu cảm nhận của em về hình ảnh người thầy giữ sách.", rubric: ["Gọi tên đúng chi tiết (sách cũ, ngả vàng, kể mỗi buổi chiều)", "Nêu được ý nghĩa của việc giữ và kể lại", "Kết nối với chủ đề chung (truyền lại ký ức)"], model: "Người thầy giữ những cuốn sách ngả vàng không chỉ giữ đồ vật, mà giữ cả ký ức để kể lại cho lũ trẻ. Mỗi buổi chiều thầy kể chuyện là một lần quá khứ được sống lại. Nhờ vậy, thế hệ sau không chỉ biết chuyện xưa mà còn học được cách sống từ người xưa." }
    }
  ];
  function litMcq(passage, part, skill, level) {
    var d = passage[part];
    var sh = shuffleOptions(d.options, d.answer);
    return mcq(d.q, sh.options, sh.answer, d.explain, { skill: skill, level: level, topic: "nv8-b1", visual: "<div class=\"v2-passage\"><b>" + escHtml(passage.title) + "</b> — đoạn trích viết cho game, không phải trích SGK.<br>" + escHtml(passage.text) + "</div>" });
  }
  function genLitInference() { return litMcq(pickArr(LIT_PASSAGES), "inference", "nv1-inference", 3); }
  function genLitWordchoice() { return litMcq(pickArr(LIT_PASSAGES), "wordchoice", "nv1-wordchoice", 3); }
  function genLitTheme() { return litMcq(pickArr(LIT_PASSAGES), "theme", "nv1-theme", 4); }
  function genLitDirect(passage) { return litMcq(passage || pickArr(LIT_PASSAGES), "direct", "nv1-author", 2); }

  /* ---------------- Gắn nhãn cho câu có sẵn ---------------- */
  var MATH_FN_MAP = {
    "m8MonoCoef": ["m8-mono", 1], "m8MonoDeg": ["m8-mono", 2],
    "m8AddPoly": ["m8-addsub", 2], "m8MulMono": ["m8-mul", 2],
    "m8DivMono": ["m8-div", 2], "m8PolyValue": ["m8-value", 3]
  };
  function tagExistingMath(fnName, q) {
    if (!q || q.__v2skill) return q;
    var m = MATH_FN_MAP[fnName];
    if (m) { q.__v2skill = m[0]; q.__v2level = m[1]; q.__v2topic = "m8-c1"; return q; }
    var prompt = String(q.prompt || "");
    if (/đơn thức là gì|đa thức là gì/.test(prompt)) { q.__v2skill = "m8-mono"; q.__v2level = 1; }
    else if (/đồng dạng/.test(prompt)) { q.__v2skill = "m8-addsub"; q.__v2level = 1; }
    else if (/nhân đa thức/.test(prompt)) { q.__v2skill = "m8-mul"; q.__v2level = 1; }
    else if (/chia đa thức/.test(prompt)) { q.__v2skill = "m8-div"; q.__v2level = 1; }
    else if (q.kind === "match" || q.kind === "memory") { q.__v2skill = "m8-mono"; q.__v2level = 1; }
    else { q.__v2skill = "m8-mono"; q.__v2level = 1; }
    q.__v2topic = "m8-c1";
    return q;
  }
  function tagExistingLit(q) {
    if (!q || q.__v2skill) return q;
    var prompt = String(q.prompt || "");
    if (/tượng trưng cho điều gì|không khí chung|bóp nát quả cam/.test(prompt)) { q.__v2skill = "nv1-meaning"; q.__v2level = 2; }
    else if (/Quang Trung|quân Thanh|Ngọc Hồi|1789|Hội nghị Diên Hồng|hi sinh/.test(prompt)) { q.__v2skill = "nv1-history"; q.__v2level = 1; }
    else if (q.kind === "match" || q.kind === "memory") { q.__v2skill = "nv1-author"; q.__v2level = 1; }
    else { q.__v2skill = "nv1-author"; q.__v2level = 1; }
    q.__v2topic = "nv8-b1";
    return q;
  }
  function tagQuestion(q, fnName, topicKey) {
    if (!q) return q;
    if (q.__v2skill) return q;
    if (topicKey === "8|g8-math|m8-c1") return tagExistingMath(fnName || "", q);
    if (topicKey === "8|g8-nv|nv8-b1") return tagExistingLit(q);
    return q;
  }
  function applyHint(q, profile) {
    if (!q || !q.__v2skill || !profile) return q;
    var st = skillState(profile, q.__v2skill);
    if (st.nextEasy && HINTS[q.__v2skill]) {
      q.visual = "<div class=\"v2-hint\">💡 " + escHtml(HINTS[q.__v2skill]) + "</div>" + (q.visual || "");
      q.explain = HINTS[q.__v2skill] + (q.explain ? " " + q.explain : "");
    }
    return q;
  }
  function wrapPools(pools, topicKey, profile) {
    if (!pools || pools.__v2wrapped) return pools;
    var out = {};
    /* Bọc một bộ sinh: gắn thẻ kĩ năng, lọc theo mức hiện tại (tối đa
       8 lần thử), gắn gợi ý khi vừa xuống mức. Dùng chung cho bộ sinh
       cũ và bộ sinh mới, để câu mới mức 3-4 không lọt vào lượt của
       học sinh đang ở mức 1-2. */
    function wrapFn(fn) {
      var fnName = (fn && fn.name) || "";
      return function () {
        var st = null;
        var q = null, attempt = 0;
        for (attempt = 0; attempt < 8; attempt++) {
          try { q = fn(); } catch (e) { q = null; }
          if (!q) break;
          tagQuestion(q, fnName, topicKey);
          if (!profile || !q.__v2skill) break;
          st = skillState(profile, q.__v2skill);
          if (st.nextEasy) {
            if (q.__v2level === 1) break;
          } else if (q.__v2level <= st.level) break;
          q = null;
        }
        if (!q) {
          try { q = fn(); } catch (e) { q = null; }
          if (q) tagQuestion(q, fnName, topicKey);
        }
        if (q) applyHint(q, profile);
        return q;
      };
    }
    ["choose", "blank", "match", "games"].forEach(function (key) {
      var arr = pools[key] || [];
      out[key] = arr.map(wrapFn);
    });
    if (topicKey === "8|g8-math|m8-c1") {
      out.choose.push(wrapFn(genMathWord), wrapFn(genMathError), wrapFn(genMathInverse), wrapFn(genMathSimplifyFull));
      out.games.push(wrapFn(genMathSteps));
    }
    if (topicKey === "8|g8-nv|nv8-b1") {
      out.choose.push(wrapFn(genLitInference), wrapFn(genLitWordchoice), wrapFn(genLitTheme));
    }
    out.__v2wrapped = true;
    return out;
  }

  /* ---------------- Ghi đáp án từ lượt thường ----------------
     Ánh xạ trung thực từ engine: finishScreen(star) — star=true nghĩa
     là đúng lần đầu; star=false nghĩa là đã thử sai trước đó trong
     cùng câu, nên với thích ứng nó được tính là KHÔNG đúng lần đầu
     và vẫn đưa vào hàng chờ ôn (ghi rõ ở báo cáo, không giấu). */
  function recordAnswer(q, star, ctx) {
    ctx = ctx || {};
    var profile = ctx.profile || null;
    if (!q || !q.__v2skill || !profile) return null;
    ensureProfileV2(profile);
    var firstTry = star === true;
    var res = recordSkill(profile, q.__v2skill, firstTry, { roundId: currentRoundId });
    if (!firstTry) {
      var topicKey = q.__v2topic === "m8-c1" ? "8|g8-math|m8-c1" : (q.__v2topic === "nv8-b1" ? "8|g8-nv|nv8-b1" : (ctx.topicKey || ""));
      if (topicKey) addReview(profile, q.__v2skill, topicKey, String(q.prompt || ""), todayStr());
    }
    if (typeof root.saveProfile === "function") { try { root.saveProfile(); } catch (e) {} }
    if (typeof document !== "undefined" && document && (res.changed === "up" || res.changed === "down")) showToast((res.changed === "up" ? "🎉 Lên mức " + res.level + " ở kĩ năng: " : "↩️ Xuống mức " + res.level + " để ôn chắc hơn ở kĩ năng: ") + (SKILLS[q.__v2skill] ? SKILLS[q.__v2skill].name : q.__v2skill));
    if (typeof document !== "undefined" && document && res.changed === "up") playV2Audio("v2-skill-levelup.mp3");
    return res;
  }
  function showToast(text) {
    try {
      var card = document.getElementById("q-card") || document.body;
      var d = document.createElement("div");
      d.className = "v2-toast"; d.textContent = text;
      card.appendChild(d);
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 3500);
    } catch (e) {}
  }
  function playV2Audio(file) {
    try {
      if (typeof Audio === "undefined") return;
      var a = new Audio("assets/audio/v2/" + file);
      var pr = a.play(); if (pr && pr.catch) pr.catch(function () {});
    } catch (e) {}
  }
  /* ---------------- Trộn dạng (interleaving) ---------------- */
  function interleave(items) {
    var out = shuffleArr(items), i, j, tmp;
    for (i = 2; i < out.length; i++) {
      if (out[i].skill === out[i - 1].skill && out[i].skill === out[i - 2].skill) {
        for (j = i + 1; j < out.length; j++) {
          if (out[j].skill !== out[i].skill) { tmp = out[i]; out[i] = out[j]; out[j] = tmp; break; }
        }
      }
    }
    return out;
  }
  function buildReviewRound(profile, topicKey, count) {
    count = count || 10;
    var due = dueReviews(profile, todayStr()).filter(function (r) { return !topicKey || r.topic === topicKey; });
    var items = [];
    due.forEach(function (r) { items.push(reviewItemForSkill(r.skill, topicKey)); });
    var others = [];
    var skillIds = Object.keys(SKILLS).filter(function (s) { return SKILLS[s].topic === (topicKey === "8|g8-math|m8-c1" ? "m8-c1" : "nv8-b1"); });
    skillIds.forEach(function (s) { if (!due.some(function (r) { return r.skill === s; })) others.push(reviewItemForSkill(s, topicKey)); });
    /* Khoảng 70% kĩ năng mục tiêu (đang nợ ôn) + 30% kĩ năng cũ. */
    var targetCount = Math.round(count * 0.7);
    var out = items.slice(0, targetCount);
    var rest = interleave(items.slice(targetCount).concat(shuffleArr(others)));
    while (out.length < count && rest.length) out.push(rest.shift());
    return interleave(out.slice(0, count));
  }
  function reviewItemForSkill(skillId, topicKey) {
    if (skillId === "m8-word") return simItemFromGen(genMathWord());
    if (skillId === "m8-steps") return simItemFromGen(genMathSteps());
    if (skillId === "m8-error") return simItemFromGen(genMathError());
    if (skillId === "m8-inverse") return simItemFromGen(genMathInverse());
    if (skillId === "m8-simplify") return simItemFromGen(genMathSimplifyFull());
    if (skillId === "m8-addsub") return simItemFromGen(genMathAddSubFull());
    if (skillId === "m8-mul") return simItemFromGen(genMathMulFull());
    if (skillId === "m8-div") return simItemFromGen(genMathDivFull());
    if (skillId === "m8-value") return simItemFromGen(genMathValueAfterSimplify());
    if (skillId === "nv1-inference") return simItemFromGen(genLitInference());
    if (skillId === "nv1-wordchoice") return simItemFromGen(genLitWordchoice());
    if (skillId === "nv1-theme") return simItemFromGen(genLitTheme());
    return simItemFromGen(genLitDirect());
  }
  function simItemFromGen(q) {
    if (!q) return null;
    if (q.kind === "sort") return { kind: "order", skill: q.__v2skill || q.skill, level: q.__v2level || q.level, prompt: q.prompt, items: q.items.slice(), explain: q.explain || "", passage: null };
    if (q.kind === "input") return { kind: "input", skill: q.__v2skill || q.skill, level: q.__v2level || q.level, prompt: q.prompt, answerNum: q.answerNum, explain: q.explain || "", passage: null };
    var options = (q.options || []).map(function (o) { return String(o.html || o).replace(/<[^>]+>/g, ""); });
    return { kind: "mcq", skill: q.__v2skill, level: q.__v2level, prompt: q.prompt, options: options, answer: q.answer, explain: q.explain || "", passage: q.visual ? String(q.visual).replace(/<[^>]+>/g, " ") : null };
  }
  function buildMathPaper() {
    var items = [];
    var p1 = mathWordParams(); var poly1 = fmtPoly(p1.c2, p1.c1, p1.c0);
    items.push({ kind: "mcq", skill: "m8-word", level: 4, prompt: "Một hình chữ nhật có chiều dài (" + p1.a + "x + " + p1.b + ") cm, chiều rộng (x - " + p1.c + ") cm. Đa thức biểu thị diện tích sau khi thu gọn là gì?", options: shuffleOptions([poly1, fmtPoly(p1.c2, 0, p1.c0), fmtPoly(p1.c2, -p1.c1, p1.c0), fmtPoly(p1.c2, p1.c1 + p1.c2, p1.c0)], 0).options, answer: 0, explain: "Diện tích = (" + p1.a + "x + " + p1.b + ")(x - " + p1.c + ") = " + poly1 + "." });
    items[0].answer = items[0].options.indexOf(poly1);
    items.push({ kind: "input", skill: "m8-word", level: 4, prompt: "Với hình chữ nhật ở câu trên, tính diện tích khi x = " + p1.x0 + ". Điền số (cm², không kèm đơn vị).", answerNum: p1.value, explain: "Thay x = " + p1.x0 + " vào " + poly1 + " được " + p1.value + "." });
    items.push(simItemFromGen(genMathSteps()));
    var e1 = mathErrorParams();
    items.push({ kind: "mcq", skill: "m8-error", level: 4, prompt: "Bạn An tính (" + e1.p + "x² + " + e1.q + "x) - (x² - " + e1.r + "x) và viết kết quả " + e1.wrong + ". Bước nào sai?", options: ["Bước bỏ ngoặc sau dấu trừ (không đổi dấu)", "Phép trừ hệ số " + e1.p + " - 1", "Bậc của x²"], answer: 0, explain: "-(-" + e1.r + "x) phải thành +" + e1.r + "x." });
    items.push({ kind: "mcq", skill: "m8-error", level: 4, prompt: "Kết quả đúng của phép tính ở câu trên là gì?", options: shuffleOptions([e1.right, e1.wrong, fmtPoly(e1.p, e1.q + e1.r, 0)], 0).options, answer: 0, explain: "Kết quả đúng là " + e1.right + "." });
    items[items.length - 1].answer = items[items.length - 1].options.indexOf(e1.right);
    var inv = mathInverseParams(); var bPoly = fmtPoly(inv.b2, inv.b1, inv.b0);
    items.push({ kind: "mcq", skill: "m8-inverse", level: 4, prompt: "Biết A + B = " + fmtPoly(inv.s2, inv.s1, inv.s0) + " và A = " + fmtPoly(inv.a2, inv.a1, inv.a0) + ". Đa thức B là gì?", options: shuffleOptions([bPoly, fmtPoly(inv.s2, inv.s1, inv.s0), fmtPoly(inv.s2 - inv.a2, inv.s1 + inv.a1, inv.s0 - inv.a0)], 0).options, answer: 0, explain: "B = (A + B) - A = " + bPoly + "." });
    items[items.length - 1].answer = items[items.length - 1].options.indexOf(bPoly);
    items.push({ kind: "input", skill: "m8-inverse", level: 4, prompt: "Tính giá trị của B ở câu trên khi x = " + inv.x0 + ". Điền số.", answerNum: inv.value, explain: "Thay x = " + inv.x0 + " vào " + bPoly + " được " + inv.value + "." });
    items.push(simItemFromGen(genMathSimplifyFull()));
    items.push(simItemFromGen(genMathAddSubFull()));
    items.push(simItemFromGen(genMathMulFull()));
    items.push(simItemFromGen(genMathValueAfterSimplify()));
    items.push(simItemFromGen(genMathMissingCoeff()));
    items.push(simItemFromGen(genMathDivFull()));
    items.push(simItemFromGen(genMathWord()));
    items.push(simItemFromGen(genMathError()));
    items.push(simItemFromGen(genMathInverse()));
    items.push(simItemFromGen(genMathSimplifyFull()));
    items.push(simItemFromGen(genMathSteps()));
    return interleave(items.filter(function (x) { return !!x; }));
  }
  function buildLitPaper() {
    var items = [];
    shuffleArr(LIT_PASSAGES).forEach(function (passage) {
      items.push({ kind: "mcq", skill: "nv1-author", level: 2, prompt: passage.direct.q, options: passage.direct.options.slice(), answer: passage.direct.answer, explain: passage.direct.explain, passage: passage });
      items.push({ kind: "mcq", skill: "nv1-inference", level: 3, prompt: passage.inference.q, options: passage.inference.options.slice(), answer: passage.inference.answer, explain: passage.inference.explain, passage: passage });
      items.push({ kind: "mcq", skill: "nv1-wordchoice", level: 3, prompt: passage.wordchoice.q, options: passage.wordchoice.options.slice(), answer: passage.wordchoice.answer, explain: passage.wordchoice.explain, passage: passage });
      items.push({ kind: "mcq", skill: "nv1-theme", level: 4, prompt: passage.theme.q, options: passage.theme.options.slice(), answer: passage.theme.answer, explain: passage.theme.explain, passage: passage });
      items.push({ kind: "mcq", skill: "nv1-theme", level: 4, prompt: passage.evidence.q, options: passage.evidence.options.slice(), answer: passage.evidence.answer, explain: passage.evidence.explain, passage: passage });
      items.push({ kind: "write", skill: "nv1-writing", level: 4, prompt: passage.writing.prompt, rubric: passage.writing.rubric.slice(), model: passage.writing.model, passage: passage });
    });
    /* Giữ cụm theo từng đoạn trích để học sinh đọc một đoạn rồi trả lời
       liền — không trộn cụm của các đoạn khác nhau vào nhau. */
    return items;
  }
  function buildPaper(topicKey) {
    var items = topicKey === "8|g8-nv|nv8-b1" ? buildLitPaper() : buildMathPaper();
    return { topicKey: topicKey, title: topicKey === "8|g8-nv|nv8-b1" ? "Mô phỏng kiểm tra — Ngữ văn Bài 1" : "Mô phỏng kiểm tra — Toán Chương I", durationSec: 1500, items: items, paperId: "v2sim-" + topicKey + "-" + Date.now() + "-" + Math.floor(Math.random() * 100000) };
  }
  function scorePaper(paper, answers) {
    var report = {}, total = 0, correct = 0, i, it, ans;
    for (i = 0; i < paper.items.length; i++) {
      it = paper.items[i];
      if (it.kind === "write") continue;
      if (!report[it.skill]) report[it.skill] = { correct: 0, total: 0, name: SKILLS[it.skill] ? SKILLS[it.skill].name : it.skill };
      report[it.skill].total++; total++;
      ans = answers[i];
      var ok = false;
      if (it.kind === "mcq") ok = ans === it.answer;
      else if (it.kind === "input") ok = ans != null && String(ans).trim() !== "" && Number(String(ans).replace(",", ".")) === it.answerNum;
      else if (it.kind === "order") ok = JSON.stringify(ans) === JSON.stringify(it.items);
      if (ok) { report[it.skill].correct++; correct++; }
    }
    return { report: report, total: total, correct: correct, percent: total ? Math.round(correct * 100 / total) : 0, weak: weakSkills(null, report) };
  }

  /* ---------------- Renderer mô phỏng + ôn tập (overlay riêng) ----------------
     Trong khi làm mô phỏng: chỉ hiện "Đã ghi nhận", KHÔNG hiện đáp án,
     giải thích, gợi ý hay vật phẩm hỗ trợ. Luyện tập (ôn sai) thì phản
     hồi ngay từng câu. */
  function injectCss() {
    if (typeof document === "undefined" || document.getElementById("v2-phase2-css")) return;
    var s = document.createElement("style"); s.id = "v2-phase2-css";
    s.textContent = ".v2-toast{background:#fff;border:3px solid #f0dfba;border-radius:14px;padding:10px 14px;font-weight:800;margin:10px 0;box-shadow:0 4px 0 #f0dfba}.v2-hint{background:#fff8e1;border:3px solid #f0dfba;border-radius:14px;padding:10px 12px;font-weight:700;margin-bottom:10px}.v2-passage{background:#fff;border:3px solid #f0dfba;border-radius:14px;padding:12px;margin-bottom:10px;line-height:1.6}.v2-overlay{position:fixed;inset:0;background:#fff8e1;z-index:9999;overflow:auto;padding:18px}.v2-overlay .v2-card{max-width:720px;margin:0 auto;background:#fff;border:3px solid #f0dfba;border-radius:22px;padding:20px;box-shadow:0 6px 0 #f0dfba}.v2-overlay button{border-radius:14px;padding:10px 14px;font-weight:800;background:#fff;border:3px solid #f0dfba;margin:4px;cursor:pointer}.v2-overlay button.sel{background:#ffe082}.v2-overlay input[type=text],.v2-overlay textarea{width:100%;padding:10px;border:3px solid #f0dfba;border-radius:12px;font-size:16px}.v2-sim-nav{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.v2-sim-nav button{width:44px;padding:8px 0;text-align:center}.v2-sim-nav button.done{background:#c8e6c9}.v2-sim-btn{width:100%;border:3px solid #4dabf7;border-radius:14px;padding:10px 12px;background:#e3f2fd;color:#33302a;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 3px 0 #2f8fe8}";
    document.head.appendChild(s);
  }
  function getProfile() {
    try {
      if (typeof root.profile !== "undefined" && root.profile) return root.profile;
      if (typeof profile !== "undefined" && profile) return profile;
    } catch (e) {}
    return null;
  }
  function saveProfileNow() {
    try { if (typeof root.saveProfile === "function") root.saveProfile(); } catch (e) {}
  }
  function openSim(topicKey) {
    injectCss();
    var profile = getProfile();
    if (profile) {
      ensureProfileV2(profile);
      if (profile.sim && profile.sim.lastTopic === topicKey && !profile.sim.retakeUnlocked && profile.sim.lastPaperId) {
        if (!window.confirm("Bạn chưa hoàn thành lượt ôn kĩ năng yếu sau bài mô phỏng trước, nên chưa mở được đề mới. Bấm OK để ôn kĩ năng yếu ngay, Cancel để quay lại.")) return;
        startReviewRound(profile, topicKey, true);
        return;
      }
    }
    var paper = buildPaper(topicKey);
    renderSim(paper, false);
    playV2Audio("v2-sim-start.mp3");
  }
  function renderSim(paper, practice) {
    injectCss();
    var overlay = document.createElement("div");
    overlay.className = "v2-overlay"; overlay.id = "v2-sim-overlay";
    document.body.appendChild(overlay);
    var answers = [], idx = 0, orderSel = [], deadline = Date.now() + paper.durationSec * 1000, timerId = null, submitted = false;
    var simStartRound = startRound();
    function fmtTime(ms) { var s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" + (s % 60) : s % 60); }
    function draw() {
      if (submitted) return;
      var it = paper.items[idx];
      var nav = paper.items.map(function (_, i) {
        return "<button type=\"button\" class=\"" + (answers[i] !== undefined ? "done" : "") + "\" data-i=\"" + i + "\">" + (i + 1) + "</button>";
      }).join("");
      var body = "";
      if (it.passage) body += "<div class=\"v2-passage\"><b>" + escHtml(it.passage.title) + "</b> — đoạn trích viết cho game, không phải trích SGK; giáo viên có thể thay bằng đoạn trích có phép dùng.<br>" + escHtml(it.passage.text) + "</div>";
      body += "<p><b>Câu " + (idx + 1) + "/" + paper.items.length + "</b> — " + escHtml(it.prompt) + "</p>";
      if (it.kind === "mcq") {
        body += it.options.map(function (o, i) { return "<div><button type=\"button\" class=\"" + (answers[idx] === i ? "sel" : "") + "\" data-opt=\"" + i + "\">" + escHtml(o) + "</button></div>"; }).join("");
      } else if (it.kind === "input") {
        body += "<input type=\"text\" id=\"v2-sim-input\" value=\"" + escHtml(answers[idx] != null ? answers[idx] : "") + "\" placeholder=\"Điền đáp án\">";
      } else if (it.kind === "order") {
        var pool = shuffleArr(it.items.map(function (_, i) { return i; }));
        body += "<p>Chạm các thẻ theo đúng thứ tự. Đã chọn: " + (answers[idx] ? answers[idx].map(function (i) { return escHtml(it.items[i]); }).join(" → ") : "(chưa chọn)") + "</p>";
        body += pool.map(function (i) { return "<button type=\"button\" data-step=\"" + i + "\">" + escHtml(it.items[i]) + "</button>"; }).join("");
        body += "<div><button type=\"button\" id=\"v2-order-reset\">Chọn lại từ đầu</button></div>";
      } else if (it.kind === "write") {
        body += "<textarea id=\"v2-sim-write\" rows=\"5\" placeholder=\"Viết 3–5 câu...\">" + escHtml(answers[idx] || "") + "</textarea>";
        body += "<p><b>Tự đối chiếu (không tính điểm):</b> " + it.rubric.map(function (r) { return "☐ " + escHtml(r); }).join(" · ") + "</p>";
        body += "<p><i>Bài mẫu để đối chiếu sẽ hiện sau khi nộp bài.</i></p>";
      }
      var feedback = "";
      if (practice && answers[idx] !== undefined && it.kind !== "write") {
        var ok = false;
        if (it.kind === "mcq") ok = answers[idx] === it.answer;
        else if (it.kind === "input") ok = answers[idx] != null && Number(String(answers[idx]).replace(",", ".")) === it.answerNum;
        else if (it.kind === "order") ok = JSON.stringify(answers[idx]) === JSON.stringify(it.items);
        feedback = "<p><b>" + (ok ? "✅ Đúng rồi!" : "❌ Chưa đúng. " + escHtml(it.explain || "")) + "</b></p>";
      }
      overlay.innerHTML = "<div class=\"v2-card\"><h2>" + escHtml(paper.title) + "</h2>" +
        (practice ? "<p>Chế độ luyện tập: phản hồi ngay từng câu.</p>" : "<p>⏱ Còn lại: <span id=\"v2-timer\">" + fmtTime(deadline - Date.now()) + "</span> · Trong khi làm chỉ hiện “Đã ghi nhận”, không hiện đáp án hay giải thích.</p>") +
        "<div class=\"v2-sim-nav\">" + nav + "</div>" + body + feedback +
        "<div><button type=\"button\" id=\"v2-prev\">← Câu trước</button><button type=\"button\" id=\"v2-next\">Câu sau →</button></div>" +
        "<div><button type=\"button\" id=\"v2-submit\">" + (practice ? "Kết thúc lượt ôn" : "Nộp bài") + "</button><button type=\"button\" id=\"v2-close\">Thoát (không tính điểm)</button></div>" +
        (practice ? "" : "<p><i>Đang làm mô phỏng: không dùng gợi ý hay vật phẩm hỗ trợ.</i></p>") + "</div>";
      overlay.querySelectorAll(".v2-sim-nav button").forEach(function (b) { b.addEventListener("click", function () { saveCurrent(); idx = +b.getAttribute("data-i"); draw(); }); });
      overlay.querySelectorAll("[data-opt]").forEach(function (b) { b.addEventListener("click", function () { answers[idx] = +b.getAttribute("data-opt"); if (!practice) { var n = document.createElement("p"); n.textContent = "Đã ghi nhận."; overlay.querySelector(".v2-card").appendChild(n); } draw(); }); });
      overlay.querySelectorAll("[data-step]").forEach(function (b) { b.addEventListener("click", function () { var cur = answers[idx] || []; if (cur.indexOf(+b.getAttribute("data-step")) === -1) { cur.push(+b.getAttribute("data-step")); answers[idx] = cur; } draw(); }); });
      var rs = overlay.querySelector("#v2-order-reset"); if (rs) rs.addEventListener("click", function () { answers[idx] = []; draw(); });
      var inp = overlay.querySelector("#v2-sim-input"); if (inp) inp.addEventListener("change", function () { answers[idx] = inp.value; });
      var wr = overlay.querySelector("#v2-sim-write"); if (wr) wr.addEventListener("change", function () { answers[idx] = wr.value; });
      overlay.querySelector("#v2-prev").addEventListener("click", function () { saveCurrent(); if (idx > 0) idx--; draw(); });
      overlay.querySelector("#v2-next").addEventListener("click", function () { saveCurrent(); if (idx < paper.items.length - 1) idx++; draw(); });
      overlay.querySelector("#v2-submit").addEventListener("click", function () { saveCurrent(); submit(); });
      overlay.querySelector("#v2-close").addEventListener("click", function () { clearInterval(timerId); overlay.remove(); });
    }
    function saveCurrent() {
      var inp = overlay.querySelector("#v2-sim-input"); if (inp && inp.value !== "") answers[idx] = inp.value;
      var wr = overlay.querySelector("#v2-sim-write"); if (wr) answers[idx] = wr.value;
    }
    function submit() {
      if (submitted) return; submitted = true; clearInterval(timerId);
      saveCurrent();
      if (practice) {
        var prof = getProfile();
        if (prof) {
          paper.items.forEach(function (it, i) {
            if (it.kind === "write") return;
            var ok = false;
            if (it.kind === "mcq") ok = answers[i] === it.answer;
            else if (it.kind === "input") ok = answers[i] != null && Number(String(answers[i]).replace(",", ".")) === it.answerNum;
            else if (it.kind === "order") ok = JSON.stringify(answers[i]) === JSON.stringify(it.items);
            recordSkill(prof, it.skill, !!ok, { roundId: simStartRound });
            answerReview(prof, it.skill, !!ok, todayStr());
          });
          prof.sim = prof.sim || {}; prof.sim.retakeUnlocked = true; prof.sim.reviewDone = true;
          saveProfileNow();
        }
        overlay.innerHTML = "<div class=\"v2-card\"><h2>Đã xong lượt ôn</h2><p>Lượt ôn kĩ năng yếu đã hoàn thành. Bây giờ bạn có thể mở đề mô phỏng mới (đề song song, khác số liệu và thứ tự).</p><button type=\"button\" id=\"v2-done\">Đóng</button></div>";
        overlay.querySelector("#v2-done").addEventListener("click", function () { overlay.remove(); updateReviewButton(); });
        playV2Audio("v2-encouragement.mp3");
        return;
      }
      var sc = scorePaper(paper, answers);
      var prof2 = getProfile();
      if (prof2) {
        ensureProfileV2(prof2);
        prof2.sim = { lastPaperId: paper.paperId, lastTopic: paper.topicKey, weak: sc.weak, retakeUnlocked: false, reviewDone: false };
        sc.weak.forEach(function (s) { addReview(prof2, s, paper.topicKey, "Kĩ năng yếu sau mô phỏng: " + (SKILLS[s] ? SKILLS[s].name : s), todayStr()); });
        paper.items.forEach(function (it, i) {
          if (it.kind === "write") return;
          var ok = false;
          if (it.kind === "mcq") ok = answers[i] === it.answer;
          else if (it.kind === "input") ok = answers[i] != null && Number(String(answers[i]).replace(",", ".")) === it.answerNum;
          else if (it.kind === "order") ok = JSON.stringify(answers[i]) === JSON.stringify(it.items);
          recordSkill(prof2, it.skill, !!ok, { roundId: simStartRound });
        });
        saveProfileNow();
      }
      var reportHtml = Object.keys(sc.report).map(function (k) {
        var r = sc.report[k];
        return "<li>" + escHtml(r.name) + ": " + r.correct + "/" + r.total + " đúng" + (r.correct / r.total < 0.7 ? " — <b>cần ôn lại</b>" : "") + "</li>";
      }).join("");
      var explHtml = paper.items.map(function (it, i) {
        if (it.kind === "write") return "<li>Câu viết (không tính điểm): " + escHtml(it.prompt) + "<br>Bài mẫu để đối chiếu: " + escHtml(it.model) + "</li>";
        return "<li>" + escHtml(it.prompt) + "<br>Giải thích: " + escHtml(it.explain || "") + "</li>";
      }).join("");
      overlay.innerHTML = "<div class=\"v2-card\"><h2>Kết quả mô phỏng</h2><p>Điểm trắc nghiệm và điền đáp án: <b>" + sc.correct + "/" + sc.total + " (" + sc.percent + "%)</b>. Câu viết không tính điểm.</p>" +
        "<p><b>Báo cáo theo kĩ năng:</b></p><ul>" + reportHtml + "</ul>" +
        "<p>Đã tự tạo lượt ôn cho ngày mai gồm các kĩ năng yếu. Muốn mở đề mới thì hoàn thành lượt ôn kĩ năng yếu trước (bấm nút dưới để ôn ngay, hoặc đợi tới ngày mai khi có nhắc ôn).</p>" +
        "<button type=\"button\" id=\"v2-review-now\">Ôn kĩ năng yếu ngay</button><button type=\"button\" id=\"v2-done2\">Đóng</button>" +
        "<h3>Giải thích toàn bộ đề</h3><ol>" + explHtml + "</ol></div>";
      overlay.querySelector("#v2-review-now").addEventListener("click", function () { overlay.remove(); var p = getProfile(); if (p) startReviewRound(p, paper.topicKey, true); });
      overlay.querySelector("#v2-done2").addEventListener("click", function () { overlay.remove(); updateReviewButton(); });
      playV2Audio("v2-sim-finished.mp3");
    }
    if (!practice) {
      timerId = setInterval(function () {
        var t = overlay.querySelector("#v2-timer");
        if (t) t.textContent = fmtTime(deadline - Date.now());
        if (Date.now() >= deadline) submit();
      }, 1000);
    }
    draw();
  }
  function startReviewRound(profile, topicKey, isWeakReview) {
    injectCss();
    var items = buildReviewRound(profile, topicKey, 10);
    if (!items.length) { alert("Hiện chưa có câu cần ôn."); return; }
    playV2Audio("v2-review-due.mp3");
    var paper = { topicKey: topicKey, title: isWeakReview ? "Ôn kĩ năng yếu" : "Ôn lại câu sai", durationSec: 1500, items: items, paperId: "v2review-" + Date.now() };
    renderSim(paper, true);
  }
  function updateReviewButton() {
    if (typeof document === "undefined") return;
    var btn = document.getElementById("v2-review-btn");
    if (!btn) return;
    var profile = getProfile();
    if (!profile) { btn.hidden = true; return; }
    ensureProfileV2(profile);
    var due = dueReviews(profile, todayStr());
    if (due.length) {
      btn.hidden = false;
      btn.textContent = "🔁 Ôn lại câu sai (" + due.length + " kĩ năng cần ôn hôm nay)";
    } else btn.hidden = true;
  }
  function initUi() {
    if (typeof document === "undefined") return;
    injectCss();
    /* Nút mô phỏng trên màn chủ đề: quan sát lưới chủ đề, chèn thẻ nút
       sau thẻ của 2 chủ đề thí điểm (không sửa hàm vẽ chủ đề gốc). */
    var grid = document.getElementById("topic-grid");
    if (grid && typeof MutationObserver !== "undefined") {
      var obs = new MutationObserver(function () {
        var cards = grid.querySelectorAll(".topic-card");
        cards.forEach(function (card) {
          var text = card.textContent || "";
          var topicKey = null;
          if (text.indexOf("Chương I: Đa thức") !== -1) topicKey = "8|g8-math|m8-c1";
          if (text.indexOf("Bài 1: Câu chuyện của lịch sử") !== -1) topicKey = "8|g8-nv|nv8-b1";
          if (!topicKey || grid.querySelector('[data-v2-sim="' + topicKey + '"]')) return;
          /* Sửa bố cục 24/10: trước đây nút mô phỏng là một .topic-card cao
             chèn trong .topic-unit, làm ô chủ đề và nút kiến thức lệch hàng.
             Nay là nút dải nhỏ nằm giữa thẻ chủ đề và nút kiến thức, trong
             cùng một unit, nên các thẻ trong một hàng cao bằng nhau và nút
             kiến thức thẳng hàng ở đáy mỗi unit. */
          var b = document.createElement("button");
          b.className = "v2-sim-btn"; b.setAttribute("data-v2-sim", topicKey);
          b.textContent = "📝 Mô phỏng kiểm tra — Đề riêng · có đồng hồ · nộp mới xem đáp án";
          b.addEventListener("click", function () { openSim(topicKey); });
          if (card.parentNode) card.parentNode.insertBefore(b, card.nextSibling);
        });
      });
      obs.observe(grid, { childList: true, subtree: false });
    }
    var rb = document.getElementById("v2-review-btn");
    if (rb) rb.addEventListener("click", function () { var p = getProfile(); if (p) startReviewRound(p, null, false); });
    updateReviewButton();
    setInterval(updateReviewButton, 3000);
    /* Bọc launchTopic để gắn nhãn + thêm bộ sinh mới cho 2 chủ đề thí điểm. */
    try {
      if (typeof root.launchTopic === "function" && !root.launchTopic.__v2wrapped) {
        var origLaunch = root.launchTopic;
        var wrappedLaunch = function (subj, t) {
          var key = null;
          try { key = (typeof currentGrade !== "undefined" ? currentGrade : "") + "|" + (subj && subj.id) + "|" + (t && t.id); } catch (e) {}
          if ((key === "8|g8-math|m8-c1" || key === "8|g8-nv|nv8-b1") && t && t.pools && !t.pools.__v2wrapped) {
            var prof = getProfile();
            t.pools = wrapPools(t.pools, key, prof);
          }
          startRound();
          return origLaunch(subj, t);
        };
        wrappedLaunch.__v2wrapped = true;
        root.launchTopic = wrappedLaunch;
      }
    } catch (e) {}
  }

  var api = {
    SKILLS: SKILLS, HINTS: HINTS, REVIEW_STEPS: REVIEW_STEPS,
    todayStr: todayStr, addDaysStr: addDaysStr, nextInterval: nextInterval,
    ensureProfileV2: ensureProfileV2, skillState: skillState, startRound: startRound, recordSkill: recordSkill,
    addReview: addReview, dueReviews: dueReviews, answerReview: answerReview, weakSkills: weakSkills,
    fmtPoly: fmtPoly, genMathWord: genMathWord, genMathSteps: genMathSteps, genMathError: genMathError, genMathInverse: genMathInverse,
    genMathSimplifyFull: genMathSimplifyFull, genMathAddSubFull: genMathAddSubFull, genMathMulFull: genMathMulFull,
    genMathValueAfterSimplify: genMathValueAfterSimplify, genMathMissingCoeff: genMathMissingCoeff, genMathDivFull: genMathDivFull,
    LIT_PASSAGES: LIT_PASSAGES, genLitInference: genLitInference, genLitWordchoice: genLitWordchoice, genLitTheme: genLitTheme,
    tagQuestion: tagQuestion, tagExistingMath: tagExistingMath, tagExistingLit: tagExistingLit, wrapPools: wrapPools, applyHint: applyHint,
    recordAnswer: recordAnswer, interleave: interleave, buildReviewRound: buildReviewRound, reviewItemForSkill: reviewItemForSkill,
    buildPaper: buildPaper, buildMathPaper: buildMathPaper, buildLitPaper: buildLitPaper, scorePaper: scorePaper,
    openSim: openSim, startReviewRound: startReviewRound, updateReviewButton: updateReviewButton, playV2Audio: playV2Audio
  };
  root.__v2p2 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined" && document) {
    try { initUi(); } catch (e) {}
  }
})();
