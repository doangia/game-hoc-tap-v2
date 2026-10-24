/* ================================================================
   GAME HỌC TẬP v2 — PHASE 3 + 4: Nhiệm vụ, chuỗi ngày, thành tích,
   cửa hàng/trang bị, thẻ kiến thức.
   - Chỉ chạy cho lớp 6-12 (teen). Lớp 1-5 giữ nguyên trải nghiệm
     Phase 1, toàn bộ panel Phase 3-4 bị ẩn (xem isTeen).
   - KHÔNG đổi kinh tế Phase 1: vẫn 10 XP/sao, 1 xu/sao, lượt lặp
     cùng chủ đề trong ngày 100%/50%/25%. Research đề xuất lượt 3
     trở đi 0 XP và hệ số độ khó 10/15/20, nhưng đổi luật đó sẽ làm
     mất XP người chơi đã tích theo luật cũ, nên GIỮ LUẬT PHASE 1
     và ghi rõ xung đột này ở báo cáo, không sửa lén.
   - KHÔNG có bảng lớp, không xếp hạng người khác, không tiền thật,
     không quảng cáo, không network call. "Ghost" ở đây chỉ là so
     với chính mình: chuỗi tốt nhất và sao tốt nhất của chính người
     chơi, lấy từ hồ sơ local.
   - Trợ giúp BỊ CẤM HOÀN TOÀN trong mô phỏng kiểm tra: mô phỏng
     chạy bằng overlay riêng của Phase 2, module này không chèn
     bất kỳ nút trợ giúp nào vào overlay đó, và useHelper từ chối
     khi overlay mô phỏng đang mở.
   - Làm chủ (mastery) là bản rút gọn trung thực từ research:
     cửa sổ 10 câu gần nhất đúng >= 80%, tổng >= 10 câu, và đã lên
     mức 3-4 (mức vận dụng trong Phase 2). Phase 2 không đếm riêng
     ">= 2 câu mức vận dụng", nên điều kiện mức >= 3 là proxy được
     ghi rõ, không giả vờ là đúng y hệt research.
   - File chạy được cả trong trình duyệt (script tag) và trong Node
     để kiểm chứng (không chạm document ở lúc nạp, trừ khi initUi
     được gọi và document tồn tại).
   ================================================================ */
(function () {
  var root = (typeof window !== "undefined") ? window : (typeof global !== "undefined" ? global : this);
  function todayStr(d) {
    d = d || new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (day < 10 ? "0" + day : day);
  }
  function parseDay(s) {
    var p = String(s).split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function addDaysStr(str, n) {
    var d = parseDay(str); d.setDate(d.getDate() + n);
    return todayStr(d);
  }
  function daysBetween(a, b) {
    return Math.round((parseDay(b) - parseDay(a)) / 86400000);
  }
  function weekKey(day) {
    var d = parseDay(day), dow = (d.getDay() + 6) % 7; /* Thứ 2 = 0 */
    d.setDate(d.getDate() - dow);
    return todayStr(d);
  }
  function escHtml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var V2_LEVEL_XP = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700];
  function levelForXp(xp) {
    try {
      if (root.__v2 && typeof root.__v2.levelForXp === "function") return root.__v2.levelForXp(xp);
    } catch (e) {}
    xp = Math.max(0, Math.floor(xp || 0)); var lvl = 1, i;
    for (i = 0; i < V2_LEVEL_XP.length; i++) { if (xp >= V2_LEVEL_XP[i]) lvl = i + 1; }
    if (xp >= 2700) lvl = 10 + Math.floor((xp - 2700) / 600);
    return lvl;
  }
  function isTeen(profile) { return !!profile && typeof profile.grade === "number" && profile.grade >= 6; }

  /* ---------------- Danh mục cửa hàng ---------------- */
  var SHOP = {
    "frame-gold": { kind: "frame", name: "Khung Vàng", emoji: "🟨", price: 30 },
    "frame-star": { kind: "frame", name: "Khung Sao", emoji: "⭐", price: 50 },
    "skin-dragon": { kind: "skin", name: "Rồng", emoji: "🐉", price: 100, char: "dragon" },
    "skin-unicorn": { kind: "skin", name: "Kỳ lân", emoji: "🦄", price: 125, char: "unicorn" },
    "skin-penguin": { kind: "skin", name: "Chim cánh cụt", emoji: "🐧", price: 150, char: "penguin" },
    "rare-trophy": { kind: "rare", name: "Cúp Vàng Hiếm", emoji: "🏆", price: 200 },
    "help-eliminate": { kind: "helper", name: "Loại 1 đáp án sai", emoji: "🔍", price: 20 },
    "help-hint": { kind: "helper", name: "Gợi ý từng bước", emoji: "💡", price: 15 }
  };
  var FREEZE_PRICE = 30, FREEZE_MAX = 2;
  var ACHIEVEMENTS = {
    "first-levelup": { name: "Lên cấp đầu tiên", desc: "Lên cấp lần đầu tiên." },
    "streak-7": { name: "Chuỗi 7 ngày", desc: "Hoàn thành lượt học 7 ngày liên tiếp." },
    "master-1": { name: "Làm chủ 1 kĩ năng", desc: "Làm chủ kĩ năng đầu tiên." },
    "master-5": { name: "Làm chủ 5 kĩ năng", desc: "Làm chủ 5 kĩ năng." },
    "reviews-10": { name: "Ôn tập 10 lượt", desc: "Hoàn thành 10 lượt ôn lại." },
    "sim-1": { name: "Hoàn thành 1 mô phỏng", desc: "Nộp 1 bài mô phỏng kiểm tra." }
  };

  /* ---------------- Trạng thái hồ sơ ---------------- */
  function ensureV2P34(profile) {
    if (!profile) return null;
    if (!profile.v2p34) {
      profile.v2p34 = {
        quests: { day: null, rounds: { p: 0, claimed: false }, review: { p: 0, claimed: false }, stars: { p: 0, claimed: false, topics: {} },
                  weekly: { week: null, days: [], masteredThisWeek: false, claimed: false },
                  weakness: { skills: [], p: 0, claimed: false, generated: null } },
        streak: { current: 0, best: 0, lastDay: null, freezes: 0, lost: 0, lostDay: null, recoveryDay: null, recoveryCount: 0, recoveryLastUsed: null },
        achievements: [], ownedFrames: [], ownedSkins: [], ownedRare: [], frame: null,
        helpers: { eliminate: 0, hint: 0 }, reviewsTotal: 0, cards: []
      };
    }
    var q = profile.v2p34;
    if (!q.quests) q.quests = { day: null, rounds: { p: 0, claimed: false }, review: { p: 0, claimed: false }, stars: { p: 0, claimed: false, topics: {} }, weekly: { week: null, days: [], masteredThisWeek: false, claimed: false }, weakness: { skills: [], p: 0, claimed: false, generated: null } };
    if (!q.streak) q.streak = { current: 0, best: 0, lastDay: null, freezes: 0, lost: 0, lostDay: null, recoveryDay: null, recoveryCount: 0, recoveryLastUsed: null };
    if (!q.achievements) q.achievements = [];
    if (!q.ownedFrames) q.ownedFrames = [];
    if (!q.ownedSkins) q.ownedSkins = [];
    if (!q.ownedRare) q.ownedRare = [];
    if (!q.helpers) q.helpers = { eliminate: 0, hint: 0 };
    if (typeof q.reviewsTotal !== "number") q.reviewsTotal = 0;
    if (!q.cards) q.cards = [];
    return q;
  }
  function resetPeriods(profile, today) {
    var q = ensureV2P34(profile), qs = q.quests;
    if (qs.day !== today) {
      qs.day = today;
      qs.rounds = { p: 0, claimed: false };
      qs.review = { p: 0, claimed: false };
      qs.stars = { p: 0, claimed: false, topics: {} };
    }
    var wk = weekKey(today);
    if (!qs.weekly || qs.weekly.week !== wk) {
      qs.weekly = { week: wk, days: [], masteredThisWeek: false, claimed: false };
    }
    return q;
  }
  function saveNow(profile) {
    try { if (typeof root.saveProfile === "function") root.saveProfile(); } catch (e) {}
    return profile;
  }
  function addXpCoins(profile, xp, coins) {
    if (!profile) return;
    if (typeof profile.xp !== "number") profile.xp = 0;
    if (typeof profile.coins !== "number") profile.coins = 0;
    var before = levelForXp(profile.xp);
    profile.xp += xp; profile.coins += coins;
    profile.level = levelForXp(profile.xp);
    if (profile.level > before) unlockAchievement(profile, "first-levelup");
  }
  function unlockAchievement(profile, id) {
    var q = ensureV2P34(profile);
    if (q.achievements.indexOf(id) !== -1) return false;
    q.achievements.push(id);
    if (typeof document !== "undefined" && document) playV2Audio34("v2-achievement.mp3");
    return true;
  }
  function playV2Audio34(file) {
    try {
      if (typeof Audio === "undefined") return;
      var a = new Audio("assets/audio/v2/" + file);
      var pr = a.play(); if (pr && pr.catch) pr.catch(function () {});
    } catch (e) {}
  }

  /* ---------------- Làm chủ và thẻ kiến thức ---------------- */
  function isMastered(st) {
    if (!st || !st.window) return false;
    var sum = 0, i;
    for (i = 0; i < st.window.length; i++) sum += st.window[i];
    var rate = st.window.length ? sum / st.window.length : 0;
    return st.total >= 10 && st.window.length >= 10 && rate >= 0.8 && typeof st.level === "number" && st.level >= 3;
  }
  function skillName(id) {
    try {
      if (root.__v2p2 && root.__v2p2.SKILLS && root.__v2p2.SKILLS[id]) return root.__v2p2.SKILLS[id].name;
    } catch (e) {}
    return id;
  }
  function scanMastery(profile) {
    /* Quét các kĩ năng đã đạt làm chủ: cấp thẻ + thành tích, không
       cấp lại thẻ đã có. Trả về danh sách kĩ năng mới làm chủ. */
    var q = ensureV2P34(profile), out = [], id, st, has;
    if (!profile.skills) return out;
    for (id in profile.skills) {
      st = profile.skills[id];
      if (!isMastered(st)) continue;
      has = q.cards.some(function (c) { return c.skill === id; });
      if (has) continue;
      q.cards.push({ skill: id, name: skillName(id), line: "Đã làm chủ: " + skillName(id), date: todayStr() });
      out.push(id);
      if (typeof document !== "undefined" && document) playV2Audio34("v2-card-earned.mp3");
    }
    if (out.length) {
      q.quests.weekly.masteredThisWeek = true;
      if (q.cards.length >= 1) unlockAchievement(profile, "master-1");
      if (q.cards.length >= 5) unlockAchievement(profile, "master-5");
    }
    return out;
  }
  function weakSkillIds(profile) {
    var out = [], id, st, sum, i, rate;
    if (profile.skills) {
      for (id in profile.skills) {
        st = profile.skills[id]; sum = 0;
        if (!st.window) continue;
        for (i = 0; i < st.window.length; i++) sum += st.window[i];
        rate = st.window.length ? sum / st.window.length : 1;
        if (st.total >= 3 && rate < 0.7) out.push(id);
      }
    }
    try {
      if (profile.sim && profile.sim.weak) profile.sim.weak.forEach(function (s) { if (out.indexOf(s) === -1) out.push(s); });
    } catch (e) {}
    return out.slice(0, 5);
  }
  function refreshWeaknessQuest(profile, today) {
    var q = ensureV2P34(profile), qs = q.quests;
    var weak = weakSkillIds(profile);
    if (!weak.length) { qs.weakness = { skills: [], p: 0, claimed: false, generated: null }; return qs.weakness; }
    if (qs.weakness.claimed) return qs.weakness; /* đã nhận thưởng thì không tạo mới trong cùng chu kỳ ôn */
    if (JSON.stringify(qs.weakness.skills) !== JSON.stringify(weak)) {
      qs.weakness = { skills: weak, p: 0, claimed: false, generated: today };
    }
    return qs.weakness;
  }

  /* ---------------- Chuỗi ngày ---------------- */
  function recordStreakDay(profile, today) {
    var q = ensureV2P34(profile), s = q.streak;
    if (s.lastDay === today) return s;
    if (!s.lastDay) { s.current = 1; }
    else {
      var gap = daysBetween(s.lastDay, today);
      if (gap === 1) { s.current += 1; }
      else if (gap > 1) {
        var missed = gap - 1;
        if (s.freezes >= missed) { s.freezes -= missed; s.current += 1; }
        else {
          /* Mất chuỗi: KHÔNG trừ XP, không xấu hổ công khai. Lưu lại
             để mở cửa sổ hồi chuỗi, chỉ dùng được 1 lần/30 ngày. */
          s.lost = s.current; s.lostDay = s.lastDay;
          s.current = 1; s.recoveryDay = today; s.recoveryCount = 0;
        }
      }
    }
    s.lastDay = today;
    if (s.current > s.best) s.best = s.current;
    if (s.current >= 7) unlockAchievement(profile, "streak-7");
    return s;
  }
  function recordReviewForRecovery(profile, today) {
    var q = ensureV2P34(profile), s = q.streak;
    if (!s.lost || !s.recoveryDay) return false;
    if (daysBetween(s.recoveryDay, today) > 3) { s.lost = 0; s.lostDay = null; s.recoveryDay = null; s.recoveryCount = 0; return false; }
    if (s.recoveryLastUsed && daysBetween(s.recoveryLastUsed, today) < 30) return false;
    if (s.recoveryDay !== today) { s.recoveryDay = today; s.recoveryCount = 0; }
    s.recoveryCount += 1;
    if (s.recoveryCount >= 3) {
      /* Hồi chuỗi: khôi phục đúng số chuỗi đã mất, không cộng thêm. */
      s.current = Math.max(s.current, s.lost);
      if (s.current > s.best) s.best = s.current;
      s.lost = 0; s.lostDay = null; s.recoveryDay = null; s.recoveryCount = 0;
      s.recoveryLastUsed = today;
      if (typeof document !== "undefined" && document) playV2Audio34("v2-streak-milestone.mp3");
      return true;
    }
    return false;
  }

  /* ---------------- Lượt chơi, lượt ôn, mô phỏng ---------------- */
  function recordRoundComplete(profile, stars, topicKey, today, levelUp) {
    if (!profile) return null;
    if (!isTeen(profile)) return null; /* lớp 1-5: không tích nhiệm vụ/chuỗi */
    today = today || todayStr();
    var q = resetPeriods(profile, today), qs = q.quests;
    recordStreakDay(profile, today);
    qs.rounds.p = 1;
    /* Chống cày sao nhiệm vụ: mỗi chủ đề trong ngày chỉ tính sao của
       lượt đầu tiên cho nhiệm vụ "8 sao", lượt lặp cùng chủ đề không
       cộng thêm sao nhiệm vụ (XP lượt lặp vẫn theo luật Phase 1). */
    if (topicKey && !qs.stars.topics[topicKey]) { qs.stars.topics[topicKey] = true; qs.stars.p += (stars || 0); }
    else if (!topicKey) { qs.stars.p += (stars || 0); }
    if (qs.weekly.days.indexOf(today) === -1) qs.weekly.days.push(today);
    if (levelUp) unlockAchievement(profile, "first-levelup");
    scanMastery(profile);
    refreshWeaknessQuest(profile, today);
    saveNow(profile);
    return q;
  }
  function recordReviewComplete(profile, isWeak, today) {
    if (!profile) return null;
    if (!isTeen(profile)) return null;
    today = today || todayStr();
    var q = resetPeriods(profile, today), qs = q.quests;
    q.reviewsTotal += 1;
    qs.review.p = 1;
    if (isWeak || (qs.weakness.skills && qs.weakness.skills.length)) qs.weakness.p = 1;
    if (q.reviewsTotal >= 10) unlockAchievement(profile, "reviews-10");
    var recovered = recordReviewForRecovery(profile, today);
    scanMastery(profile);
    saveNow(profile);
    return { q: q, recovered: recovered };
  }
  function recordSimComplete(profile, paperId, today) {
    if (!profile) return null;
    if (!isTeen(profile)) return null;
    today = today || todayStr();
    var q = resetPeriods(profile, today);
    if (q.lastSimPaper === paperId) return q; /* không tính 2 lần cùng 1 bài */
    q.lastSimPaper = paperId;
    unlockAchievement(profile, "sim-1");
    refreshWeaknessQuest(profile, today);
    saveNow(profile);
    return q;
  }

  /* ---------------- Nhận thưởng nhiệm vụ ---------------- */
  function claimDaily(profile, kind, today) {
    if (!profile || !isTeen(profile)) return { ok: false, reason: "not-teen" };
    today = today || todayStr();
    var q = resetPeriods(profile, today), qs = q.quests, target;
    if (kind === "rounds") { target = 1; if (qs.rounds.p < target) return { ok: false, reason: "not-done" }; if (qs.rounds.claimed) return { ok: false, reason: "claimed" }; qs.rounds.claimed = true; }
    else if (kind === "review") { target = 1; if (qs.review.p < target) return { ok: false, reason: "not-done" }; if (qs.review.claimed) return { ok: false, reason: "claimed" }; qs.review.claimed = true; }
    else if (kind === "stars") { target = 8; if (qs.stars.p < target) return { ok: false, reason: "not-done" }; if (qs.stars.claimed) return { ok: false, reason: "claimed" }; qs.stars.claimed = true; }
    else return { ok: false, reason: "unknown" };
    addXpCoins(profile, 20, 10);
    if (typeof document !== "undefined" && document) playV2Audio34("v2-quest-done.mp3");
    saveNow(profile);
    return { ok: true, xp: 20, coins: 10 };
  }
  function claimWeekly(profile, today) {
    if (!profile || !isTeen(profile)) return { ok: false, reason: "not-teen" };
    today = today || todayStr();
    var q = resetPeriods(profile, today), w = q.quests.weekly;
    if (w.claimed) return { ok: false, reason: "claimed" };
    if (w.days.length < 5 && !w.masteredThisWeek) return { ok: false, reason: "not-done" };
    w.claimed = true;
    addXpCoins(profile, 0, 30);
    if (typeof document !== "undefined" && document) playV2Audio34("v2-quest-done.mp3");
    saveNow(profile);
    return { ok: true, xp: 0, coins: 30 };
  }
  function claimWeakness(profile, today) {
    if (!profile || !isTeen(profile)) return { ok: false, reason: "not-teen" };
    today = today || todayStr();
    var q = resetPeriods(profile, today), w = q.quests.weakness;
    if (!w.skills || !w.skills.length) return { ok: false, reason: "no-weak" };
    if (w.p < 1) return { ok: false, reason: "not-done" };
    if (w.claimed) return { ok: false, reason: "claimed" };
    w.claimed = true;
    addXpCoins(profile, 15, 10);
    if (typeof document !== "undefined" && document) playV2Audio34("v2-quest-done.mp3");
    saveNow(profile);
    return { ok: true, xp: 15, coins: 10 };
  }

  /* ---------------- Cửa hàng ---------------- */
  function buyItem(profile, id) {
    if (!profile || !isTeen(profile)) return { ok: false, reason: "not-teen" };
    var item = SHOP[id];
    if (!item) return { ok: false, reason: "unknown" };
    var q = ensureV2P34(profile);
    if (typeof profile.coins !== "number") profile.coins = 0;
    if (item.kind === "helper") {
      if (profile.coins < item.price) return { ok: false, reason: "no-coins" };
      profile.coins -= item.price;
      if (id === "help-eliminate") q.helpers.eliminate += 1; else q.helpers.hint += 1;
    } else {
      var owned = item.kind === "frame" ? q.ownedFrames : item.kind === "skin" ? q.ownedSkins : q.ownedRare;
      if (owned.indexOf(id) !== -1) return { ok: false, reason: "owned" };
      if (profile.coins < item.price) return { ok: false, reason: "no-coins" };
      profile.coins -= item.price;
      owned.push(id);
      if (item.kind === "frame" && !q.frame) q.frame = id;
    }
    if (typeof document !== "undefined" && document) playV2Audio34("v2-shop-buy.mp3");
    saveNow(profile);
    return { ok: true, item: item };
  }
  function buyFreeze(profile) {
    if (!profile || !isTeen(profile)) return { ok: false, reason: "not-teen" };
    var q = ensureV2P34(profile);
    if (q.streak.freezes >= FREEZE_MAX) return { ok: false, reason: "max-freeze" };
    if ((profile.coins || 0) < FREEZE_PRICE) return { ok: false, reason: "no-coins" };
    profile.coins -= FREEZE_PRICE;
    q.streak.freezes += 1;
    saveNow(profile);
    return { ok: true, freezes: q.streak.freezes };
  }
  function equipFrame(profile, id) {
    var q = ensureV2P34(profile);
    if (id && q.ownedFrames.indexOf(id) === -1) return false;
    q.frame = id || null;
    saveNow(profile);
    return true;
  }
  function equipSkin(profile, charId) {
    var q = ensureV2P34(profile);
    var ok = false, id;
    for (id in SHOP) { if (SHOP[id].kind === "skin" && SHOP[id].char === charId && q.ownedSkins.indexOf(id) !== -1) ok = true; }
    if (!ok) return false;
    profile.character = charId;
    saveNow(profile);
    return true;
  }

  /* ---------------- Trợ giúp trong lượt (không dùng trong mô phỏng) ---------------- */
  var lastGameRef = null, helpersUsedThisGame = 0;
  function currentGame() {
    try { if (typeof game !== "undefined" && game) return game; } catch (e) {}
    try { if (root.game) return root.game; } catch (e) {}
    return null;
  }
  function helpersUsed() {
    var g = currentGame();
    if (g !== lastGameRef) { lastGameRef = g; helpersUsedThisGame = 0; }
    return helpersUsedThisGame;
  }
  function useHelper(profile, kind) {
    if (!profile || !isTeen(profile)) return { ok: false, reason: "not-teen" };
    if (typeof document !== "undefined" && document.getElementById("v2-sim-overlay")) return { ok: false, reason: "simulation" };
    var g = currentGame();
    if (!g || !g.current) return { ok: false, reason: "no-game" };
    if (helpersUsed() >= 2) return { ok: false, reason: "limit" };
    var q = ensureV2P34(profile);
    if (kind === "eliminate") {
      if (q.helpers.eliminate <= 0) return { ok: false, reason: "none" };
      var cur = g.current;
      if (!cur.options || typeof cur.answer !== "number") return { ok: false, reason: "not-mcq" };
      var opts = document.querySelectorAll("#q-options .opt");
      var i, done = false;
      for (i = 0; i < opts.length; i++) {
        if (i !== cur.answer && !opts[i].disabled) { opts[i].disabled = true; opts[i].style.opacity = "0.35"; done = true; break; }
      }
      if (!done) return { ok: false, reason: "no-wrong-left" };
      q.helpers.eliminate -= 1; helpersUsedThisGame += 1;
    } else if (kind === "hint") {
      if (q.helpers.hint <= 0) return { ok: false, reason: "none" };
      var hint = null;
      try { if (root.__v2p2 && root.__v2p2.HINTS && g.current.__v2skill) hint = root.__v2p2.HINTS[g.current.__v2skill]; } catch (e) {}
      if (!hint) return { ok: false, reason: "no-hint" };
      var box = document.getElementById("q-visual");
      if (box) { var d = document.createElement("div"); d.className = "v2-hint"; d.textContent = "💡 " + hint; box.insertBefore(d, box.firstChild); }
      q.helpers.hint -= 1; helpersUsedThisGame += 1;
    } else return { ok: false, reason: "unknown" };
    saveNow(profile);
    return { ok: true, used: helpersUsedThisGame };
  }

  /* ---------------- Giao diện (trình duyệt) ---------------- */
  function injectCss() {
    if (typeof document === "undefined" || document.getElementById("v2-p34-css")) return;
    var s = document.createElement("style"); s.id = "v2-p34-css";
    s.textContent = ".v2-p34{background:#fff;border:3px solid #f0dfba;border-radius:22px;padding:14px 16px;margin-bottom:16px;box-shadow:0 4px 0 #f0dfba}.v2-p34 h3{margin:2px 0 8px;font-size:18px}.v2-p34 .qrow{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}.v2-p34 .bar{flex:1;min-width:120px;height:14px;background:#f5ecd7;border-radius:8px;overflow:hidden}.v2-p34 .fill{height:100%;background:#ffb300}.v2-p34 button{border-radius:12px;padding:8px 12px;font-weight:800;background:#fff;border:3px solid #f0dfba;cursor:pointer}.v2-p34 button:disabled{opacity:.5;cursor:default}.v2-p34 .done{color:#2e7d32}.v2-frame-gold{outline:4px solid #ffb300;outline-offset:2px;border-radius:50%}.v2-frame-star{outline:4px solid #7e57c2;outline-offset:2px;border-radius:50%}.v2-helper-row{display:flex;gap:8px;margin:6px 0}.v2-helper-row button{border-radius:12px;padding:8px 12px;font-weight:800;background:#fffdf6;border:3px solid #f0dfba;cursor:pointer}";
    document.head.appendChild(s);
  }
  function getProfile() {
    try {
      if (typeof root.profile !== "undefined" && root.profile) return root.profile;
      if (typeof profile !== "undefined" && profile) return profile;
    } catch (e) {}
    return null;
  }
  function questRow(label, p, target, claimed, action) {
    var pct = Math.min(100, Math.round(p * 100 / target));
    var btn = claimed ? "<span class=\"done\">✅ Đã nhận</span>" : (p >= target ? "<button type=\"button\" data-p34=\"" + action + "\">🎁 Nhận thưởng</button>" : "<button type=\"button\" disabled>Chưa đủ</button>");
    return "<div class=\"qrow\"><span style=\"min-width:220px\">" + escHtml(label) + "</span><span class=\"bar\"><span class=\"fill\" style=\"width:" + pct + "%\"></span></span><span>" + p + "/" + target + "</span>" + btn + "</div>";
  }
  function renderPanels() {
    if (typeof document === "undefined") return;
    var prof = getProfile();
    var host = document.getElementById("v2-p34-panels");
    if (!prof || !isTeen(prof)) { if (host) host.innerHTML = ""; applyFrame(); return; }
    injectCss();
    if (!host) {
      var bar = document.getElementById("profile-bar");
      if (!bar || !bar.parentNode) return;
      host = document.createElement("div"); host.id = "v2-p34-panels";
      bar.parentNode.insertBefore(host, bar.nextSibling);
      host.addEventListener("click", function (ev) {
        var t = ev.target && ev.target.getAttribute ? ev.target.getAttribute("data-p34") : null;
        if (!t) return;
        var p = getProfile(); if (!p) return;
        var r = null;
        if (t === "claim-rounds") r = claimDaily(p, "rounds");
        else if (t === "claim-review") r = claimDaily(p, "review");
        else if (t === "claim-stars") r = claimDaily(p, "stars");
        else if (t === "claim-weekly") r = claimWeekly(p);
        else if (t === "claim-weakness") r = claimWeakness(p);
        else if (t === "buy-freeze") r = buyFreeze(p);
        else if (t.indexOf("buy-") === 0) r = buyItem(p, t.slice(4));
        else if (t.indexOf("frame-") === 0) equipFrame(p, t.slice(6) === "none" ? null : t.slice(6));
        else if (t.indexOf("skin-") === 0) equipSkin(p, t.slice(5));
        if (r && !r.ok && r.reason) alert("Chưa thực hiện được: " + r.reason + ".");
        renderPanels();
        try { if (typeof renderProfileBar === "function") renderProfileBar(); } catch (e) {}
      });
    }
    var q = resetPeriods(prof, todayStr());
    refreshWeaknessQuest(prof, todayStr());
    scanMastery(prof);
    var qs = q.quests, s = q.streak;
    var bestStars = 0, k;
    if (prof.best) for (k in prof.best) if (prof.best[k] > bestStars) bestStars = prof.best[k];
    var html = "";
    html += "<div class=\"v2-p34\"><h3>🎯 Nhiệm vụ hôm nay</h3>";
    html += questRow("Hoàn thành 1 lượt chơi", qs.rounds.p, 1, qs.rounds.claimed, "claim-rounds");
    html += questRow("Hoàn thành 1 lượt ôn lại câu sai", qs.review.p, 1, qs.review.claimed, "claim-review");
    html += questRow("Kiếm 8 sao đúng lần đầu trong ngày", qs.stars.p, 8, qs.stars.claimed, "claim-stars");
    html += "<p style=\"margin:6px 0\">Nhiệm vụ chỉ tính lượt chơi và lượt ôn đã hoàn thành, không tính chỉ mở game hay bấm nút. Sao nhiệm vụ mỗi chủ đề trong ngày chỉ tính lượt đầu tiên.</p></div>";
    html += "<div class=\"v2-p34\"><h3>📅 Nhiệm vụ tuần</h3>";
    html += questRow("Chơi 5 ngày khác nhau trong tuần, hoặc làm chủ 1 kĩ năng", (qs.weekly.days.length >= 5 || qs.weekly.masteredThisWeek) ? 1 : 0, 1, qs.weekly.claimed, "claim-weekly");
    html += "<p style=\"margin:6px 0\">Đã chơi " + qs.weekly.days.length + " ngày trong tuần này · Thưởng: 30 xu.</p></div>";
    if (qs.weakness.skills && qs.weakness.skills.length) {
      html += "<div class=\"v2-p34\"><h3>🎯 Nhiệm vụ ôn điểm yếu</h3><p style=\"margin:6px 0\">Ôn các kĩ năng: " + qs.weakness.skills.map(skillName).map(escHtml).join(" · ") + "</p>";
      html += questRow("Hoàn thành 1 lượt ôn điểm yếu", qs.weakness.p, 1, qs.weakness.claimed, "claim-weakness") + "</div>";
    }
    html += "<div class=\"v2-p34\"><h3>🔥 Chuỗi ngày học</h3><p style=\"margin:6px 0\">Chuỗi hiện tại: <b>" + s.current + " ngày</b> · Tốt nhất: <b>" + s.best + " ngày</b> · Đóng băng đang giữ: " + s.freezes + "/2 (30 xu/cái, mua trước ngày nghỉ, bảo vệ đúng 1 ngày vắng).</p>";
    html += "<p style=\"margin:6px 0\">👻 So với chính bạn: chuỗi tốt nhất " + s.best + " ngày · sao tốt nhất " + bestStars + " sao/lượt. Không có bảng xếp hạng với người khác.</p>";
    if (s.lost && s.recoveryDay) html += "<p style=\"margin:6px 0\">⚠️ Chuỗi " + s.lost + " ngày vừa bị đứt. Hoàn thành 3 lượt ôn trong hôm nay (trong 3 ngày sau khi đứt, 1 lần/30 ngày) để khôi phục.</p>";
    html += "<div class=\"qrow\"><button type=\"button\" data-p34=\"buy-freeze\">❄️ Mua đóng băng (30 xu)</button></div></div>";
    html += "<div class=\"v2-p34\"><h3>🏅 Thành tích</h3><p style=\"margin:6px 0\">" + Object.keys(ACHIEVEMENTS).map(function (id) {
      var got = q.achievements.indexOf(id) !== -1;
      return (got ? "✅ " : "☐ ") + escHtml(ACHIEVEMENTS[id].name);
    }).join(" · ") + "</p><p style=\"margin:6px 0\">Thành tích chỉ để ghi nhận, không tự sinh XP hay xu khi mở lại.</p></div>";
    html += "<div class=\"v2-p34\"><h3>🛍️ Cửa hàng — chỉ bằng xu học được, không tiền thật</h3><p style=\"margin:6px 0\">Xu hiện có: <b>" + (prof.coins || 0) + "</b> · Trợ giúp: loại đáp án còn " + q.helpers.eliminate + ", gợi ý còn " + q.helpers.hint + " (tối đa 2 cái/lượt, cấm trong mô phỏng kiểm tra).</p>";
    Object.keys(SHOP).forEach(function (id) {
      var it = SHOP[id];
      if (it.kind === "helper") {
        html += "<div class=\"qrow\"><span>" + it.emoji + " " + escHtml(it.name) + " — " + it.price + " xu</span><button type=\"button\" data-p34=\"buy-" + id + "\">Mua</button></div>";
      } else if (it.kind === "frame") {
        var ownedF = q.ownedFrames.indexOf(id) !== -1;
        html += "<div class=\"qrow\"><span>" + it.emoji + " " + escHtml(it.name) + " — " + it.price + " xu</span>" + (ownedF ? "<button type=\"button\" data-p34=\"frame-" + id + "\">Dùng khung này</button>" : "<button type=\"button\" data-p34=\"buy-" + id + "\">Mua</button>") + "</div>";
      } else if (it.kind === "skin") {
        var ownedS = q.ownedSkins.indexOf(id) !== -1;
        html += "<div class=\"qrow\"><span>" + it.emoji + " " + escHtml(it.name) + " — " + it.price + " xu</span>" + (ownedS ? "<button type=\"button\" data-p34=\"skin-" + it.char + "\">Dùng nhân vật này</button>" : "<button type=\"button\" data-p34=\"buy-" + id + "\">Mua</button>") + "</div>";
      } else {
        var ownedR = q.ownedRare.indexOf(id) !== -1;
        html += "<div class=\"qrow\"><span>" + it.emoji + " " + escHtml(it.name) + " — " + it.price + " xu" + (ownedR ? " · ✅ Đã sở hữu" : "") + "</span>" + (ownedR ? "" : "<button type=\"button\" data-p34=\"buy-" + id + "\">Mua</button>") + "</div>";
      }
    });
    html += "<div class=\"qrow\"><button type=\"button\" data-p34=\"frame-none\">Bỏ khung avatar</button></div></div>";
    html += "<div class=\"v2-p34\"><h3>🃏 Bộ sưu tập thẻ kiến thức</h3><p style=\"margin:6px 0\">" + (q.cards.length ? q.cards.map(function (c) { return "🃏 <b>" + escHtml(c.name) + "</b> — " + escHtml(c.line); }).join("<br>") : "Chưa có thẻ nào. Làm chủ một kĩ năng (đúng lần đầu >= 80% trong 10 câu gần nhất, đã lên mức 3) để nhận thẻ.") + "</p></div>";
    host.innerHTML = html;
    applyFrame();
    renderHelperButtons();
  }
  function applyFrame() {
    if (typeof document === "undefined") return;
    var prof = getProfile();
    var av = document.querySelector("#profile-bar .avatar");
    if (!av) return;
    av.classList.remove("v2-frame-gold", "v2-frame-star");
    if (!prof || !isTeen(prof)) return;
    var q = ensureV2P34(prof);
    if (q.frame === "frame-gold") av.classList.add("v2-frame-gold");
    else if (q.frame === "frame-star") av.classList.add("v2-frame-star");
  }
  function renderHelperButtons() {
    if (typeof document === "undefined") return;
    var card = document.getElementById("q-card");
    var old = document.getElementById("v2-helper-row");
    var prof = getProfile();
    var show = !!prof && isTeen(prof) && !document.getElementById("v2-sim-overlay") && card && document.getElementById("scr-game") && document.getElementById("scr-game").classList.contains("on");
    if (!show) { if (old) old.remove(); return; }
    if (!old) {
      old = document.createElement("div"); old.id = "v2-helper-row"; old.className = "v2-helper-row";
      var speakBtn = document.getElementById("q-speak-btn");
      if (speakBtn && speakBtn.parentNode) speakBtn.parentNode.insertBefore(old, speakBtn.nextSibling);
      else card.appendChild(old);
      old.addEventListener("click", function (ev) {
        var b = ev.target && ev.target.closest ? ev.target.closest("[data-helper]") : null;
        if (!b) return;
        var p = getProfile(); if (!p) return;
        var r = useHelper(p, b.getAttribute("data-helper"));
        if (!r.ok) alert("Chưa dùng được trợ giúp: " + r.reason + ".");
        renderHelperButtons();
      });
    }
    var q = ensureV2P34(prof);
    old.innerHTML = "<button type=\"button\" data-helper=\"eliminate\">🔍 Loại 1 đáp án sai (" + q.helpers.eliminate + " còn)</button><button type=\"button\" data-helper=\"hint\">💡 Gợi ý từng bước (" + q.helpers.hint + " còn)</button><span>Đã dùng " + helpersUsed() + "/2 trong lượt này · Không dùng được trong mô phỏng kiểm tra.</span>";
  }
  var pendingReview = null;
  function initUi() {
    if (typeof document === "undefined") return;
    injectCss();
    try {
      if (typeof root.saveRoundResult === "function" && !root.saveRoundResult.__v2p34wrapped) {
        var origSave = root.saveRoundResult;
        var wrappedSave = function (stars) {
          var p = getProfile();
          var before = p ? levelForXp(p.xp || 0) : 1;
          var res = origSave(stars);
          try {
            var p2 = getProfile();
            var topicKey = null;
            try { if (typeof currentTopicKey !== "undefined") topicKey = currentTopicKey; } catch (e) {}
            if (p2) recordRoundComplete(p2, stars, topicKey, todayStr(), res && res.leveledUp);
          } catch (e) {}
          return res;
        };
        wrappedSave.__v2p34wrapped = true;
        root.saveRoundResult = wrappedSave;
      }
    } catch (e) {}
    try {
      if (root.__v2p2 && typeof root.__v2p2.startReviewRound === "function" && !root.__v2p2.startReviewRound.__v2p34wrapped) {
        var origReview = root.__v2p2.startReviewRound;
        var wrappedReview = function (profile, topicKey, isWeak) {
          var beforeDone = profile && profile.sim ? !!profile.sim.reviewDone : false;
          var beforeRetake = profile && profile.sim ? !!profile.sim.retakeUnlocked : false;
          pendingReview = { weak: !!isWeak, beforeDone: beforeDone, beforeRetake: beforeRetake, counted: false };
          return origReview(profile, topicKey, isWeak);
        };
        wrappedReview.__v2p34wrapped = true;
        root.__v2p2.startReviewRound = wrappedReview;
      }
    } catch (e) {}
    try {
      if (root.__v2p2 && typeof root.__v2p2.scorePaper === "function" && !root.__v2p2.scorePaper.__v2p34wrapped) {
        var origScore = root.__v2p2.scorePaper;
        var wrappedScore = function (paper, answers) {
          var sc = origScore(paper, answers);
          try {
            var p = getProfile();
            if (p && paper && paper.paperId && paper.paperId.indexOf("v2sim-") === 0) recordSimComplete(p, paper.paperId, todayStr());
          } catch (e) {}
          return sc;
        };
        wrappedScore.__v2p34wrapped = true;
        root.__v2p2.scorePaper = wrappedScore;
      }
    } catch (e) {}
    if (typeof MutationObserver !== "undefined") {
      var obs = new MutationObserver(function () {
        if (pendingReview && !pendingReview.counted && !document.getElementById("v2-sim-overlay")) {
          var p = getProfile();
          if (p && p.sim && ((!!p.sim.reviewDone && !pendingReview.beforeDone) || (!!p.sim.retakeUnlocked && !pendingReview.beforeRetake))) {
            pendingReview.counted = true;
            try { recordReviewComplete(p, pendingReview.weak, todayStr()); } catch (e) {}
          }
          if (!document.getElementById("v2-sim-overlay")) pendingReview = null;
        }
        applyFrame();
      });
      obs.observe(document.body, { childList: true, subtree: true });
      var barObs = new MutationObserver(function () { applyFrame(); });
      var bar = document.getElementById("profile-bar");
      if (bar) barObs.observe(bar, { childList: true, subtree: true });
    }
    renderPanels();
    setInterval(renderPanels, 3000);
    setInterval(function () { var p = getProfile(); if (p && isTeen(p)) { scanMastery(p); } }, 15000);
  }

  var api = {
    SHOP: SHOP, ACHIEVEMENTS: ACHIEVEMENTS, FREEZE_PRICE: FREEZE_PRICE, FREEZE_MAX: FREEZE_MAX,
    todayStr: todayStr, addDaysStr: addDaysStr, daysBetween: daysBetween, weekKey: weekKey,
    ensureV2P34: ensureV2P34, resetPeriods: resetPeriods, isTeen: isTeen, isMastered: isMastered,
    scanMastery: scanMastery, weakSkillIds: weakSkillIds, refreshWeaknessQuest: refreshWeaknessQuest,
    recordStreakDay: recordStreakDay, recordReviewForRecovery: recordReviewForRecovery,
    recordRoundComplete: recordRoundComplete, recordReviewComplete: recordReviewComplete, recordSimComplete: recordSimComplete,
    claimDaily: claimDaily, claimWeekly: claimWeekly, claimWeakness: claimWeakness,
    buyItem: buyItem, buyFreeze: buyFreeze, equipFrame: equipFrame, equipSkin: equipSkin,
    useHelper: useHelper, helpersUsed: helpersUsed, levelForXp: levelForXp
  };
  root.__v2p34 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined" && document) {
    try { initUi(); } catch (e) {}
  }
})();
