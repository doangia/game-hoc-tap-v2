"use strict";
/*__A1_FEATURES_BEGIN__*/
/* ============================================================
   ĐỢT A1 — NHÓM A (vu chốt 2026-10-14): (1) ÔN CÂU SAI + nhắc lại
   ngắt quãng; (4) THỬ THÁCH MỖI NGÀY + CHUỖI NGÀY + HUY HIỆU.
   Đặc tả: DAC-TA-NHOM-A.md. Chỉ THÊM khối này + 2 điểm móc bắt câu
   sai trong engine (choose / tfAnswer gọi window.__a1Capture*).
   Khóa riêng: gameHocTap_activity_v1 / _wrong_v1 / _daily_v1 /
   _badges_v1 — KHÔNG sửa gameHocTap_profile_v2, chỉ ĐỌC
   gameHocTap_assess_v1. Phiên ôn + thử thách dùng lại khung chơi
   của game, KHÔNG cộng sao vào hồ sơ. Lời đọc giữ nguyên cơ chế cũ
   (không đọc tên học sinh); thông báo huy hiệu chỉ hiện chữ.
   ============================================================ */
(function () {
  if (window.__a1Installed) return;
  window.__a1Installed = true;

  var LS_ACT = "gameHocTap_activity_v1";
  var LS_WRONG = "gameHocTap_wrong_v1";
  var LS_DAILY = "gameHocTap_daily_v1";
  var LS_BADGES = "gameHocTap_badges_v1";
  var LS_ASSESS_RO = "gameHocTap_assess_v1";
  var DAY = 86400000;
  var GAPS = [1, 3, 7, 14]; /* ngày theo stage 0..3 */
  var WRONG_CAP = 400;

  /* ---------------- tiện ích ---------------- */
  function loadJSON(key, def) { try { var v = JSON.parse(localStorage.getItem(key) || "null"); return v == null ? def : v; } catch (e) { return def; } }
  function saveJSON(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function dayStrOf(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function todayStr() { return dayStrOf(new Date()); }
  function fmtDay(ms) { var d = new Date(ms); return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear(); }
  function txtOf(html) { try { return roundText(html == null ? "" : String(html)); } catch (e) { return String(html == null ? "" : html); } }
  function factOf(s) { try { return roundFact(s == null ? "" : String(s)); } catch (e) { return String(s == null ? "" : s).toLowerCase(); } }
  function badTxt(s) { s = String(s == null ? "" : s); return s.indexOf("undefined") !== -1 || s.indexOf("NaN") !== -1 || s.indexOf("[object") !== -1; }
  function curGame() { try { return (typeof game !== "undefined") ? game : null; } catch (e) { return null; } }
  function curProfile() { try { return (typeof profile !== "undefined") ? profile : null; } catch (e) { return null; } }

  /* ---------------- CSS riêng (tiền tố a1-) ---------------- */
  var css = [
    ".subj-card.a1-wrong-card{grid-column:1/-1;background:linear-gradient(135deg,#2e8b6e,#43aa8b);min-height:0;padding:16px 12px}",
    ".subj-card.a1-daily-card{grid-column:1/-1;background:linear-gradient(135deg,#e07b39,#f2a541);min-height:0;padding:16px 12px}",
    ".a1-bar-extra{font-size:14px;font-weight:700;color:var(--ink-soft,#6f675a);margin-top:2px}",
    "#a1-toasts{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:1200;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;width:min(92vw,480px)}",
    ".a1-toast{background:#fffdf6;border:3px solid var(--sun,#ffb703);color:var(--ink,#33302a);border-radius:16px;padding:10px 18px;font-weight:800;font-size:17px;box-shadow:0 10px 26px rgba(90,70,20,.25);text-align:center;transition:opacity .35s;max-width:100%}",
    ".a1-toast.out{opacity:0}",
    ".a1-modal{position:fixed;inset:0;background:rgba(30,25,15,.45);display:none;align-items:center;justify-content:center;z-index:1100;padding:16px}",
    ".a1-modal.on{display:flex}",
    ".a1-mcard{background:var(--card,#fff);color:var(--ink,#33302a);border:3px solid var(--line,#f0dfba);border-radius:22px;max-width:430px;width:100%;padding:22px 20px;box-shadow:0 12px 32px rgba(0,0,0,.25);text-align:center}",
    ".a1-mtitle{font-size:23px;font-weight:800;margin:2px 0 8px}",
    ".a1-mbody{font-size:17px;font-weight:600;line-height:1.5;margin:0 0 16px}"
  ].join("\n");
  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  (document.head || document.body).appendChild(styleEl);

  var toastBox = document.createElement("div");
  toastBox.id = "a1-toasts";
  document.body.appendChild(toastBox);
  function a1Toast(msg) {
    var t = document.createElement("div");
    t.className = "a1-toast"; t.textContent = msg;
    toastBox.appendChild(t);
    setTimeout(function () { t.classList.add("out"); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 420); }, 4300);
  }

  var modal = document.createElement("div");
  modal.className = "a1-modal";
  modal.innerHTML = '<div class="a1-mcard"><div class="a1-mtitle"></div><p class="a1-mbody"></p>' +
    '<button class="big-btn primary" type="button" id="a1-m-btn" style="width:100%">🏠 Về trang đầu</button></div>';
  document.body.appendChild(modal);
  modal.querySelector("#a1-m-btn").addEventListener("click", function () { modal.classList.remove("on"); });
  function a1Summary(title, body) {
    modal.querySelector(".a1-mtitle").textContent = title;
    modal.querySelector(".a1-mbody").textContent = body;
    modal.classList.add("on");
  }

  /* ---------------- activity + streak ---------------- */
  function loadActivity() {
    var a = loadJSON(LS_ACT, null);
    if (!a || typeof a !== "object") a = {};
    if (!a.days || typeof a.days !== "object") a.days = {};
    if (!a.playedTopics || typeof a.playedTopics !== "object") a.playedTopics = {};
    if (!("lastTopic" in a)) a.lastTopic = null;
    return a;
  }
  function saveActivity(a) { saveJSON(LS_ACT, a); }
  function markToday(a) { a.days[todayStr()] = true; }
  function computeStreak(a) {
    var days = (a && a.days) || {};
    var d = new Date(); d.setHours(0, 0, 0, 0);
    var todayDone = !!days[dayStrOf(d)];
    if (!todayDone) d.setDate(d.getDate() - 1);
    var n = 0;
    while (days[dayStrOf(d)]) { n++; d.setDate(d.getDate() - 1); }
    return { n: n, today: todayDone };
  }
  /* Helper CHUNG ghi activity cho mọi hoạt động học (các đợt sau dùng lại):
     đánh dấu ngày hôm nay + (tuỳ chọn) cập nhật giao diện + kiểm huy hiệu. */
  function recordActivity() {
    var a = loadActivity(); markToday(a); saveActivity(a);
    refreshA1UI();
    checkBadges();
    return a;
  }
  window.__a1RecordActivity = recordActivity;
  function recordTopicStart(grade, subj, topic) {
    var a = loadActivity();
    a.playedTopics[topic.id] = (a.playedTopics[topic.id] || 0) + 1;
    a.lastTopic = { grade: grade, subjectId: subj.id, subjectName: subj.name, topicId: topic.id, topicName: topic.name, ts: Date.now() };
    saveActivity(a);
  }

  /* ---------------- kho câu sai ---------------- */
  function loadWrong() { var w = loadJSON(LS_WRONG, []); return Array.isArray(w) ? w : []; }
  function saveWrong(w) { saveJSON(LS_WRONG, w); }
  function dueItems(now) {
    return loadWrong().filter(function (it) { return it && typeof it.due === "number" && it.due <= now; })
      .sort(function (a, b) { return a.due - b.due; });
  }
  function a1KeyFor(topicId, prompt, visual, answerText) {
    return topicId + "|" + factOf((prompt || "") + " " + txtOf(visual || "") + " " + (answerText || "")).slice(0, 90);
  }
  /* Ghi 1 câu sai vào kho (chung cho cả 3 nguồn: luyện tập, TF, kiểm tra).
     entry = {grade, subjectId, subjectName, topicId, topicName, q:{...}} */
  function captureWrong(entry) {
    if (!entry || !entry.topicId || !entry.q) return;
    var q = entry.q;
    var answerText = q.type === "tf" ? txtOf(q.visual || "") : (q.blankText ? String(q.blankText) : (q.options && typeof q.answer === "number" && q.options[q.answer] != null ? txtOf(q.options[q.answer]) : ""));
    var key = entry.key || a1KeyFor(entry.topicId, q.prompt, q.visual, answerText);
    var now = Date.now();
    var bank = loadWrong();
    var found = null;
    for (var i = 0; i < bank.length; i++) if (bank[i] && bank[i].key === key) { found = bank[i]; break; }
    if (found) {
      found.q = q; found.grade = entry.grade; found.subjectId = entry.subjectId;
      found.subjectName = entry.subjectName; found.topicName = entry.topicName;
      found.stage = 0; found.due = now + GAPS[0] * DAY; found.wrongCount = (found.wrongCount || 1) + 1; found.lastWrong = now;
    } else {
      bank.push({ key: key, grade: entry.grade, subjectId: entry.subjectId, subjectName: entry.subjectName,
        topicId: entry.topicId, topicName: entry.topicName, q: q, stage: 0, due: now + GAPS[0] * DAY, wrongCount: 1, lastWrong: now });
      while (bank.length > WRONG_CAP) {
        var oldIdx = 0;
        for (var j = 1; j < bank.length; j++) if ((bank[j].lastWrong || 0) < (bank[oldIdx].lastWrong || 0)) oldIdx = j;
        bank.splice(oldIdx, 1);
      }
    }
    saveWrong(bank);
    var b = loadBadges();
    var peak = Math.max(b.wrongPeak || 0, bank.length);
    if (peak !== (b.wrongPeak || 0)) { b.wrongPeak = peak; saveBadges(b); }
  }
  /* Kết quả 1 câu trong phiên ôn: đúng → stage+1 & due theo GAPS[stage mới],
     đúng ở stage 3 → đã thuộc (xoá); sai → stage 0, due +1 ngày. */
  function applyReviewOutcome(key, correct) {
    var bank = loadWrong();
    for (var i = 0; i < bank.length; i++) {
      if (!bank[i] || bank[i].key !== key) continue;
      var it = bank[i], now = Date.now();
      if (correct) {
        if ((it.stage || 0) >= 3) bank.splice(i, 1);
        else { it.stage = (it.stage || 0) + 1; it.due = now + GAPS[it.stage] * DAY; }
      } else {
        it.stage = 0; it.due = now + GAPS[0] * DAY; it.wrongCount = (it.wrongCount || 1) + 1; it.lastWrong = now;
      }
      break;
    }
    saveWrong(bank);
  }

  /* Ngữ cảnh chủ đề hiện tại từ currentTopicKey "lớp|môn|chủ đề[|adv]" */
  function topicContext() {
    try {
      var key = (typeof currentTopicKey !== "undefined" && currentTopicKey) ? String(currentTopicKey) : "";
      var parts = key.split("|");
      if (parts.length < 3) return null;
      if(window.__topics)return window.__topics.resolve(parts);
      /* Chuyên đề nâng cao (Toán tư duy): chủ đề không nằm trong GRADES —
         uỷ quyền cho chuyende.js tra registry riêng khi đã nạp. */
      if (parts[1] === "chuyende" && typeof window.__cdTopicContext === "function") { var cdx = window.__cdTopicContext(parts); if (cdx) return cdx; }
      /* Góc giải trí: registry riêng trong giaitri.js (nạp lười) — uỷ quyền
         tương tự chuyên đề; ctx có thể mang cờ noCapture (đố vui dân gian). */
      if (parts[1] === "giaitri" && typeof window.__gtTopicContext === "function") { var gtx = window.__gtTopicContext(parts); if (gtx) return gtx; }
      var g = parseInt(parts[0], 10);
      var G = (typeof GRADES !== "undefined") ? GRADES[g] : null;
      if (!G) return null;
      var subj = null, topic = null;
      G.subjects.forEach(function (s) { if (s.id === parts[1]) subj = s; });
      if (!subj) return null;
      subj.topics.forEach(function (t) { if (t.id === parts[2]) topic = t; });
      if (!topic) return null;
      return { grade: g, subj: subj, topic: topic };
    } catch (e) { return null; }
  }
  function inA1Session() { var g = curGame(); return !!(g && (g.a1Review || g.a1Daily)); }

  /* Nguồn (a1): câu chọn/điền sai trong vòng luyện tập thường + nâng cao */
  window.__a1CapturePractice = function (q) {
    try {
      var gNow23 = curGame(); if (gNow23 && gNow23.inRetry) return; /* V23-E: câu thử lại sai KHÔNG ghi sổ câu sai */
      if (!q || q.pairs || q.items || q.rounds) return;
      if (q.__a1CapDone) return;
      if (!q.options || typeof q.answer !== "number" || !q.options[q.answer]) return;
      if (inA1Session()) return;
      var ctx = topicContext(); if (!ctx) return;
      if (ctx.noCapture) return; /* Mục được đánh dấu không nạp kho câu sai (Đố vui dân gian). */
      q.__a1CapDone = true;
      var type = (q.kind === "blank" || q.blankText) ? "blank" : "choose";
      captureWrong({ grade: ctx.grade, subjectId: ctx.subj.id, subjectName: ctx.subj.name,
        topicId: ctx.topic.id, topicName: ctx.topic.name,
        q: { type: type, prompt: q.prompt || "", visual: q.visual || "", figure: q.figure || "",
          options: q.options.map(function (o) { return o && o.html != null ? String(o.html) : String(o == null ? "" : o); }),
          answer: q.answer, explain: q.explain || "", blankText: type === "blank" ? String(q.blankText || "") : "" } });
    } catch (e) {}
  };
  /* Nguồn (a2): một nhận định Đúng/Sai sai trong vòng luyện tập */
  window.__a1CaptureTF = function (q, r) {
    try {
      var gNow23 = curGame(); if (gNow23 && gNow23.inRetry) return; /* V23-E: câu thử lại sai KHÔNG ghi sổ câu sai */
      if (!q || !r || typeof r.truth !== "boolean" || r.__a1CapDone) return;
      if (inA1Session()) return;
      var ctx = topicContext(); if (!ctx) return;
      if (ctx.noCapture) return; /* Mục được đánh dấu không nạp kho câu sai (Đố vui dân gian). */
      r.__a1CapDone = true;
      captureWrong({ grade: ctx.grade, subjectId: ctx.subj.id, subjectName: ctx.subj.name,
        topicId: ctx.topic.id, topicName: ctx.topic.name,
        q: { type: "tf", prompt: q.prompt || "Đúng hay sai?", visual: r.visual || "", answer: r.truth ? 0 : 1, explain: r.explain || "" } });
    } catch (e) {}
  };
  /* Nguồn (b): câu sai trong bài Kiểm tra — chạy khi màn báo cáo hiện lên
     (submitTest vừa chấm xong + lưu lịch sử), đọc qua __assess.current(). */
  var lastCapturedTest = null;
  function captureFromAssess() {
    try {
      var A = window.__assess; if (!A || typeof A.current !== "function") return;
      var t = A.current();
      if (!t || !t.submitted || t === lastCapturedTest) return;
      lastCapturedTest = t;
      (t.items || []).forEach(function (it, i) {
        var mine = t.answers ? t.answers[i] : null;
        if (mine == null || mine === it.answer) return;
        if (it.type !== "choose" && it.type !== "blank" && it.type !== "tf") return;
        captureWrong({ grade: it.grade, subjectId: it.subjId, subjectName: it.subjName,
          topicId: it.topicId, topicName: it.topicName,
          q: { type: it.type, prompt: it.prompt || "", visual: it.visual || "", figure: it.figure || "",
            options: (it.options || []).map(function (o) { return String(o == null ? "" : o); }),
            answer: it.answer, explain: it.explain || "", blankText: it.type === "blank" ? String(it.correctText || "") : "" } });
      });
    } catch (e) {}
  }

  /* ---------------- thử thách mỗi ngày ---------------- */
  function loadDaily() {
    var d = loadJSON(LS_DAILY, null);
    if (!d || typeof d !== "object") d = {};
    if (!d.doneDates || typeof d.doneDates !== "object") d.doneDates = {};
    if (typeof d.totalDone !== "number") d.totalDone = 0;
    if (!d.cache || typeof d.cache !== "object") d.cache = {};
    return d;
  }
  function saveDaily(d) { saveJSON(LS_DAILY, d); }
  function seedRand(seedStr) {
    var h = 2166136261;
    for (var i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    var s = h >>> 0;
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      var t = Math.imul(s ^ s >>> 15, 1 | s);
      t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  /* Chuyển 1 câu của engine thành câu lưu trữ được (chỉ choose/blank/tf),
     cùng luật cổng prepareRoundQuestion như bộ rút đề Kiểm tra. */
  function convertQ(q, meta) {
    var out = [];
    if (!q) return out;
    if (q.rounds && q.rounds.length) {
      if (!prepareRoundQuestion(q)) return out;
      q.rounds.forEach(function (r) {
        if (typeof r.truth !== "boolean") return;
        var vis = r.visual || "";
        if (badTxt(txtOf(vis))) return;
        out.push({ key: a1KeyFor(meta.topic.id, q.prompt || "", vis, r.truth ? "Đúng" : "Sai"),
          grade: meta.grade, subjectId: meta.subj.id, subjectName: meta.subj.name, topicId: meta.topic.id, topicName: meta.topic.name,
          q: { type: "tf", prompt: q.prompt || "Đúng hay sai?", visual: vis, answer: r.truth ? 0 : 1, explain: r.explain || "" } });
      });
      return out;
    }
    if (q.pairs || q.items) return out;
    if (!q.options || typeof q.answer !== "number") return out;
    if (!prepareRoundQuestion(q)) return out;
    if (!q.options || q.options.length < 2 || !q.options[q.answer]) return out;
    var optsHtml = q.options.map(function (o) { return o && o.html != null ? String(o.html) : String(o == null ? "" : o); });
    var disp = txtOf(q.prompt || "") + " " + txtOf(q.visual || "") + " " + optsHtml.map(txtOf).join(" ");
    if (badTxt(disp)) return out;
    var type = (q.kind === "blank" || q.blankText) ? "blank" : "choose";
    var correctText = type === "blank" && q.blankText ? String(q.blankText) : txtOf(optsHtml[q.answer]);
    if (!correctText) return out;
    out.push({ key: a1KeyFor(meta.topic.id, q.prompt || "", q.visual || "", correctText),
      grade: meta.grade, subjectId: meta.subj.id, subjectName: meta.subj.name, topicId: meta.topic.id, topicName: meta.topic.name,
      q: { type: type, prompt: q.prompt || "", visual: q.visual || "", figure: q.figure || "", options: optsHtml, answer: q.answer,
        explain: q.explain || "", blankText: type === "blank" ? String(q.blankText || correctText) : "" } });
    return out;
  }
  function drawDaily(g) {
    var G = (typeof GRADES !== "undefined") ? GRADES[g] : null;
    if (!G) return [];
    var triples = [];
    G.subjects.forEach(function (s) {
      s.topics.forEach(function (t) {
        if (!t.pools) return;
        ["choose", "blank", "games"].forEach(function (pk) {
          (t.pools[pk] || []).forEach(function (gen) { triples.push({ gen: gen, meta: { grade: g, subj: s, topic: t } }); });
        });
      });
    });
    if (!triples.length) return [];
    var pf = curProfile();
    var rng = seedRand(todayStr() + "|" + g + "|" + (pf ? pf.name : ""));
    var oldRand = Math.random, oldTO = window.setTimeout;
    var oldFlag = false;
    try { oldFlag = roundSelectionActive; } catch (e) {}
    var items = [], seenKey = {}, seenSig = {};
    try {
      Math.random = rng;
      try { roundSelectionActive = true; } catch (e) {}
      window.setTimeout = function () { return 0; };
      var order = triples.slice();
      for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
      var calls = 0, idx = 0;
      while (items.length < 10 && calls < 3000) {
        var tr = order[idx % order.length]; idx++; calls++;
        var q = null;
        try { q = tr.gen(); } catch (e) { continue; }
        if (!q) continue;
        var conv = convertQ(q, tr.meta);
        for (var k = 0; k < conv.length && items.length < 10; k++) {
          var it = conv[k];
          if (seenKey[it.key]) continue;
          var sig = factOf((it.q.prompt || "") + " " + (it.q.type === "tf" ? txtOf(it.q.visual || "") : txtOf((it.q.options || [])[it.q.answer] || "")));
          if (seenSig[sig]) continue;
          seenKey[it.key] = 1; seenSig[sig] = 1; items.push(it);
        }
      }
    } finally {
      Math.random = oldRand; window.setTimeout = oldTO;
      try { roundSelectionActive = oldFlag; } catch (e) {}
    }
    return items;
  }
  /* Đề hôm nay: rút lần đầu theo hạt giống (ngày + lớp + tên hồ sơ) rồi
     LƯU vào cache — mở lại trong ngày luôn ra đúng đề đó. */
  function dailyToday() {
    var d = loadDaily();
    var g = 1;
    try { g = (typeof currentGrade !== "undefined" && currentGrade) ? currentGrade : (curProfile() ? curProfile().grade : 1); } catch (e) {}
    var pf = curProfile();
    var name = pf ? pf.name : "";
    var key = todayStr();
    var c = d.cache[key];
    if (c && c.grade === g && c.name === name && Array.isArray(c.items) && c.items.length) return { daily: d, entry: c, grade: g };
    var items = drawDaily(g);
    if (!items.length) return null;
    var entry = { grade: g, name: name, items: items, done: false, score: null };
    d.cache[key] = entry;
    var keys = Object.keys(d.cache).sort();
    while (keys.length > 3) { delete d.cache[keys.shift()]; }
    saveDaily(d);
    return { daily: d, entry: entry, grade: g };
  }

  /* ---------------- huy hiệu ---------------- */
  function loadBadges() {
    var b = loadJSON(LS_BADGES, null);
    if (!b || typeof b !== "object") b = {};
    if (!b.earned || typeof b.earned !== "object") b.earned = {};
    return b;
  }
  function saveBadges(b) { saveJSON(LS_BADGES, b); }
  function assessHistory() { var a = loadJSON(LS_ASSESS_RO, []); return Array.isArray(a) ? a : []; }
  function chapterDone(a) {
    if (typeof GRADES === "undefined" || !a || !a.playedTopics) return false;
    for (var g in GRADES) {
      var G = GRADES[g]; if (!G || !G.subjects) continue;
      for (var i = 0; i < G.subjects.length; i++) {
        var s = G.subjects[i];
        if (!s.topics || !s.topics.length) continue;
        var all = true;
        for (var j = 0; j < s.topics.length; j++) if (!((a.playedTopics[s.topics[j].id] || 0) >= 1)) { all = false; break; }
        if (all) return true;
      }
    }
    return false;
  }
  var BADGES = [
    { id: "first-star", emoji: "⭐", name: "Ngôi sao đầu tiên", cond: function () { var p = curProfile(); return !!p && (p.totalStars || 0) > 0; } },
    { id: "first-ten", emoji: "💯", name: "Điểm 10 đầu tiên", cond: function () { return assessHistory().some(function (r) { return r && typeof r.score === "number" && r.score >= 10; }); } },
    { id: "streak-3", emoji: "🔥", name: "Chuyên cần 3 ngày", cond: function () { return computeStreak(loadActivity()).n >= 3; } },
    { id: "streak-7", emoji: "🔥", name: "Chuyên cần 7 ngày", cond: function () { return computeStreak(loadActivity()).n >= 7; } },
    { id: "daily-5", emoji: "🎯", name: "5 ngày thử thách", cond: function () { return (loadDaily().totalDone || 0) >= 5; } },
    { id: "chapter", emoji: "🏅", name: "Hoàn thành một chương", cond: function () { return chapterDone(loadActivity()); } },
    { id: "stars-100", emoji: "🌟", name: "100 sao", cond: function () { var p = curProfile(); return !!p && (p.totalStars || 0) >= 100; } },
    { id: "stars-500", emoji: "🌟", name: "500 sao", cond: function () { var p = curProfile(); return !!p && (p.totalStars || 0) >= 500; } },
    { id: "clean-review", emoji: "📚", name: "Ôn sạch câu sai", cond: null }, /* chỉ trao ở cuối phiên ôn */
    /* V14 — Rung chuông vàng + Bộ sưu tập thẻ: điều kiện đọc từ hai khóa
       mới gameHocTap_rcv_v1 / gameHocTap_cards_v1 (logic ở giaitri.js). */
    { id: "rcv-bronze", emoji: "🥉", name: "Chuông đồng", cond: function () { var r = loadJSON("gameHocTap_rcv_v1", null); return !!r && (r.best || 0) >= 5; } },
    { id: "rcv-silver", emoji: "🥈", name: "Chuông bạc", cond: function () { var r = loadJSON("gameHocTap_rcv_v1", null); return !!r && (r.best || 0) >= 10; } },
    { id: "rcv-gold", emoji: "🥇", name: "Chuông vàng", cond: function () { var r = loadJSON("gameHocTap_rcv_v1", null); return !!r && (r.best || 0) >= 15; } },
    /* V20 — Tia chớp (giaitri.js): LUẬT GHÉP anh vu chốt 2026-10-19 —
       chuỗi đúng dài nhất 5/8/14 trong một vòng đạt điều kiện tỉ lệ
       đúng ≥ 50%; điều kiện đọc bestStreakQ (chuỗi dài nhất trong các
       vòng đạt điều kiện) do tcEndRun ghi vào gameHocTap_tiachop_v1. */
    { id: "tc-bronze", emoji: "⚡", name: "Tia chớp Đồng", desc: "Trong một vòng Tia chớp: trả lời đúng từ một nửa số câu trở lên và đúng liên tiếp 5 câu", cond: function () { var r = loadJSON("gameHocTap_tiachop_v1", null); return !!r && (r.bestStreakQ || 0) >= 5; } },
    { id: "tc-silver", emoji: "⚡", name: "Tia chớp Bạc", desc: "Trong một vòng Tia chớp: trả lời đúng từ một nửa số câu trở lên và đúng liên tiếp 8 câu", cond: function () { var r = loadJSON("gameHocTap_tiachop_v1", null); return !!r && (r.bestStreakQ || 0) >= 8; } },
    { id: "tc-gold", emoji: "⚡", name: "Tia chớp Vàng", desc: "Trong một vòng Tia chớp: trả lời đúng từ một nửa số câu trở lên và đúng liên tiếp 14 câu", cond: function () { var r = loadJSON("gameHocTap_tiachop_v1", null); return !!r && (r.bestStreakQ || 0) >= 14; } },
    { id: "card-collector", emoji: "🃏", name: "Nhà sưu tập", cond: function () { var c = loadJSON("gameHocTap_cards_v1", null); if (!c || !c.unlocked) return false; var total = (window.__GT && window.__GT.cards && window.__GT.cards.length) ? window.__GT.cards.length : 14; return Object.keys(c.unlocked).length >= total; } } /* V22: tổng thẻ lấy động từ __GT.cards khi giaitri.js đã nạp; dự phòng 14 = GT_CARDS.length hiện tại */
  ];
  function badgeDef(id) { for (var i = 0; i < BADGES.length; i++) if (BADGES[i].id === id) return BADGES[i]; return null; }
  function awardBadge(id) {
    var b = loadBadges();
    if (b.earned[id]) return false;
    b.earned[id] = Date.now(); saveBadges(b);
    var def = badgeDef(id);
    if (def) a1Toast("🎉 Huy hiệu mới: " + def.emoji + " " + def.name + "!");
    return true;
  }
  function checkBadges() {
    var b = loadBadges();
    BADGES.forEach(function (def) {
      if (!def.cond || b.earned[def.id]) return;
      var ok = false;
      try { ok = !!def.cond(); } catch (e) {}
      if (ok) { awardBadge(def.id); b = loadBadges(); }
    });
  }

  /* ---------------- phiên chơi dùng lại khung game ---------------- */
  function buildSessionQ(item) {
    var q = item.q || {};
    var topicRef = { grade:item.grade,subjectId:item.subjectId,topicId:item.topicId };
    if (q.type === "tf") {
      return { kind: "tf", prompt: q.prompt || "Đúng hay sai?", rounds: [{ visual: q.visual || "", truth: q.answer === 0, explain: q.explain || "" }], __a1Key: item.key, __topicRef: topicRef };
    }
    var out = { prompt: q.prompt || "", visual: q.visual || "", figure: q.figure || "",
      options: (q.options || []).map(function (h) { return { html: String(h == null ? "" : h) }; }),
      answer: q.answer, explain: q.explain || "", __a1Key: item.key, __topicRef: topicRef };
    if (q.type === "blank") { out.kind = "blank"; out.blankText = String(q.blankText || ""); }
    return out;
  }
  function startSession(kind, items, title) {
    var g = { title: title, pools: null, playlist: [], idx: 0, stars: 0, tried: false, locked: false, current: null, tf: null, noMoreQuestions: false };
    g.playlist = items.map(function (it) { return function () { return buildSessionQ(it); }; });
    while (g.playlist.length < 10) (function () { g.playlist.push(function () { return null; }); })();
    if (kind === "review") g.a1Review = true; else g.a1Daily = true;
    g.a1Count = items.length; g.a1Correct = 0; g.__a1DoneKeys = {};
    try { game = g; } catch (e) { window.game = g; }
    show("scr-game");
    nextQuestion();
  }
  function startReview() {
    var items = dueItems(Date.now()).slice(0, 10);
    if (!items.length) {
      var bank = loadWrong();
      if (!bank.length) a1Toast("Chưa có câu sai nào trong kho. Cứ học tiếp nhé, câu nào sai sẽ được nhắc ôn lại!");
      else {
        var next = bank.slice().sort(function (a, b) { return a.due - b.due; })[0];
        a1Toast("Chưa có câu nào đến hạn ôn. Đang chờ " + bank.length + " câu — câu gần nhất ôn vào " + fmtDay(next.due) + " nhé!");
      }
      return;
    }
    startSession("review", items, "📚 Ôn câu sai");
  }
  function startDaily() {
    /* v18 P2/P3: bộ câu mỗi ngày phải rút từ ngân hàng đầy đủ và ỔN ĐỊNH
       trong ngày — hoàn tất đồng bộ Phase C + nâng cao của lớp người chơi
       trước lần dựng đầu tiên (bộ câu được nhớ theo ngày trong máy). */
    try {
      var dg = (typeof profile !== "undefined" && profile && profile.grade) || (typeof currentGrade !== "undefined" ? currentGrade : 0);
      if (dg && typeof window.__ensureCompleteGrade === "function") window.__ensureCompleteGrade(dg);
      if (dg && typeof window.__ensureAdvGrade === "function") window.__ensureAdvGrade(dg);
    } catch (e) {}
    var res = dailyToday();
    if (!res) { a1Toast("Chưa rút được đề hôm nay. Em thử lại sau nhé!"); return; }
    startSession("daily", res.entry.items, "🎯 Thử thách hôm nay");
  }
  function endReview(g) {
    var dueLeft = dueItems(Date.now()).length;
    recordActivity();
    var b = loadBadges();
    if (dueLeft === 0 && (b.wrongPeak || 0) >= 5) awardBadge("clean-review");
    checkBadges(); refreshA1UI();
    show("scr-home");
    a1Summary("📚 Ôn câu sai xong rồi!",
      "Em trả lời đúng " + (g.a1Correct || 0) + "/" + (g.a1Count || 0) + " câu trong phiên ôn này. " +
      (dueLeft > 0 ? ("Còn " + dueLeft + " câu đến hạn — ôn tiếp khi nào rảnh nhé!") : "Hiện không còn câu nào đến hạn ôn. Giỏi lắm!"));
  }
  function endDaily(g) {
    var res = dailyToday();
    var score = g.stars || 0, total = g.a1Count || 0, firstTime = false;
    if (res && !res.entry.done) {
      firstTime = true;
      res.entry.done = true; res.entry.score = score;
      res.daily.doneDates[todayStr()] = true;
      res.daily.totalDone = (res.daily.totalDone || 0) + 1;
      saveDaily(res.daily);
    }
    recordActivity(); checkBadges(); refreshA1UI();
    show("scr-home");
    a1Summary("🎯 Thử thách hôm nay xong rồi!",
      "Em trả lời đúng ngay lần đầu " + score + "/" + total + " câu." +
      (firstTime ? " Em đã hoàn thành thử thách hôm nay rồi — nhớ quay lại ngày mai để giữ chuỗi nhé!" :
        " Hôm nay em đã hoàn thành thử thách từ lần làm đầu tiên rồi, lần này là luyện thêm thôi nhé!"));
  }

  /* ---------------- thẻ ở màn hình chính + thanh hồ sơ ---------------- */
  function wrongCardDesc() {
    var bank = loadWrong();
    var due = dueItems(Date.now()).length;
    if (due > 0) return "Có " + due + " câu đến hạn ôn hôm nay — chạm để ôn lại cho nhớ nhé!";
    if (bank.length) {
      var next = bank.slice().sort(function (a, b) { return a.due - b.due; })[0];
      return "Đang chờ " + bank.length + " câu • Câu gần nhất ôn vào " + fmtDay(next.due);
    }
    return "Câu nào làm sai sẽ được nhắc ôn lại ở đây cho đến khi thuộc";
  }
  function dailyCardDesc() {
    var d = loadDaily();
    var c = d.cache[todayStr()];
    var pf = curProfile();
    var g = 1;
    try { g = (typeof currentGrade !== "undefined" && currentGrade) ? currentGrade : (pf ? pf.grade : 1); } catch (e) {}
    if (c && c.done && c.grade === g && pf && c.name === pf.name) return "✅ Hôm nay đã hoàn thành — đúng ngay lần đầu " + (c.score == null ? "?" : c.score) + "/" + (c.items ? c.items.length : 10) + " câu";
    return "10 câu trộn các môn của lớp em • Làm mỗi ngày để giữ chuỗi 🔥";
  }
  function injectCards() {
    var grid = el("subject-dynamic");
    if (!grid || !curProfile()) return;
    if (!grid.querySelector(".a1-wrong-card")) {
      var card = document.createElement("button");
      card.className = "subj-card a1-wrong-card";
      card.innerHTML = '<span class="big-emoji">📚</span><span class="name">Ôn câu sai</span><span class="desc a1-wrong-desc"></span>';
      card.addEventListener("click", function () { startReview(); });
      grid.appendChild(card);
    }
    if (!grid.querySelector(".a1-daily-card")) {
      var card2 = document.createElement("button");
      card2.className = "subj-card a1-daily-card";
      card2.innerHTML = '<span class="big-emoji">🎯</span><span class="name">Thử thách hôm nay</span><span class="desc a1-daily-desc"></span>';
      card2.addEventListener("click", function () { startDaily(); });
      grid.appendChild(card2);
    }
    refreshCards();
  }
  function refreshCards() {
    var grid = el("subject-dynamic"); if (!grid) return;
    var wd = grid.querySelector(".a1-wrong-desc"); if (wd) wd.textContent = wrongCardDesc();
    var dd = grid.querySelector(".a1-daily-desc"); if (dd) dd.textContent = dailyCardDesc();
  }
  function decorateProfileBar() {
    var bar = el("profile-bar");
    var pf = curProfile();
    if (!bar || !pf) return;
    var who = bar.querySelector(".who");
    if (!who) return;
    var st = computeStreak(loadActivity());
    var earned = Object.keys(loadBadges().earned).length;
    var line = document.createElement("div");
    line.className = "a1-bar-extra";
    line.textContent = st.n > 0
      ? ("🔥 Chuỗi học: " + st.n + " ngày" + (st.today ? "" : " — học hôm nay để giữ chuỗi nhé!"))
      : "🔥 Học hôm nay để bắt đầu chuỗi ngày học nhé!";
    if (earned > 0) line.textContent += " • 🏅 Huy hiệu: " + earned + "/" + BADGES.length;
    who.appendChild(line);
  }
  function refreshA1UI() {
    try { renderProfileBar(); } catch (e) {}
    refreshCards();
  }

  /* ---------------- bọc các hàm lõi (theo đúng khuôn các lớp trước) ---------------- */
  if (typeof renderSubjects === "function") {
    var origRS = renderSubjects;
    renderSubjects = function () { var r = origRS.apply(this, arguments); try { injectCards(); } catch (e) {} return r; };
  }
  if (typeof renderProfileBar === "function") {
    var origRPB = renderProfileBar;
    renderProfileBar = function () { var r = origRPB.apply(this, arguments); try { decorateProfileBar(); } catch (e) {} return r; };
  }
  if (typeof startGame === "function") {
    var origSG = startGame;
    startGame = function (title, pools) {
      try {
        var ctx = topicContext();
        if (ctx && (ctx.topic.pools === pools || ctx.topic.advPools === pools)) recordTopicStart(ctx.grade, ctx.subj, ctx.topic);
      } catch (e) {}
      return origSG.apply(this, arguments);
    };
  }
  if (typeof finishScreen === "function") {
    var origFS = finishScreen;
    finishScreen = function (star) {
      try {
        var g = curGame();
        if (g && (g.a1Review || g.a1Daily) && !g.locked && g.current && g.current.__a1Key && !g.__a1DoneKeys[g.current.__a1Key]) {
          g.__a1DoneKeys[g.current.__a1Key] = true;
          if (star) g.a1Correct = (g.a1Correct || 0) + 1;
          if (g.a1Review) applyReviewOutcome(g.current.__a1Key, !!star);
        }
      } catch (e) {}
      return origFS.apply(this, arguments);
    };
  }
  if (typeof showResult === "function") {
    var origSR = showResult;
    showResult = function () {
      var g = curGame();
      if (g && g.a1Review) { try { endReview(g); } catch (e) {} return; }
      if (g && g.a1Daily) { try { endDaily(g); } catch (e) {} return; }
      var r = origSR.apply(this, arguments);
      try { recordActivity(); } catch (e) {}
      return r;
    };
  }
  if (typeof show === "function") {
    var origShow = show;
    show = function (id) {
      var r = origShow.apply(this, arguments);
      try {
        if (id === "scr-report") { captureFromAssess(); recordActivity(); }
        if (id === "scr-home") refreshCards();
      } catch (e) {}
      return r;
    };
  }

  injectCards();
  try { renderProfileBar(); } catch (e) {}

  /* ---------------- API phục vụ kiểm chứng (QA) ---------------- */
  window.__a1 = {
    LS: { ACT: LS_ACT, WRONG: LS_WRONG, DAILY: LS_DAILY, BADGES: LS_BADGES },
    GAPS: GAPS.slice(),
    loadActivity: loadActivity, loadWrong: loadWrong, loadDaily: loadDaily, loadBadges: loadBadges,
    computeStreak: function () { return computeStreak(loadActivity()); },
    dueItems: function () { return dueItems(Date.now()); },
    recordActivity: recordActivity, recordTopicStart: recordTopicStart,
    captureWrong: captureWrong, applyReviewOutcome: applyReviewOutcome,
    dailyToday: dailyToday, drawDaily: drawDaily,
    startReview: startReview, startDaily: startDaily,
    checkBadges: checkBadges, awardBadge: awardBadge,
    badges: BADGES.map(function (d) { return { id: d.id, emoji: d.emoji, name: d.name, desc: d.desc || "" }; })
  };
})();
/*__A1_FEATURES_END__*/
/* P1 (v18): xả hàng đợi capture mà vỏ đã đệm trong lúc A1 chưa nạp xong.
   Vỏ định nghĩa tạm window.__a1CapturePractice/__a1CaptureTF dạng đệm;
   khối A1 phía trên đã thay chúng bằng bản thật — phát lại từng mục. */
(function () {
  try {
    var buf = window.__a1PendingCaptures || [];
    window.__a1PendingCaptures = [];
    buf.forEach(function (it) {
      try {
        if (it.kind === "tf") { if (typeof window.__a1CaptureTF === "function") window.__a1CaptureTF(it.session, it.idx, it.correct); }
        else if (typeof window.__a1CapturePractice === "function") window.__a1CapturePractice(it.q, it.ctx);
      } catch (e) {}
    });
  } catch (e) {}
})();

