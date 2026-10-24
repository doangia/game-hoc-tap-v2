/* ================================================================
   GAME HỌC TẬP v2 — UI SHELL: HEADER BAR + BOTTOM BAR (duyệt 24/10)
   - Chỉ tổ chức lại giao diện, KHÔNG đổi kinh tế XP/xu, luật nhiệm
     vụ/chuỗi/cửa hàng/thành tích, key localStorage hay dữ liệu.
   - Di chuyển (move node) các panel đã có, không clone: nút Nhận
     thưởng/Mua giữ nguyên vì listener nhiệm vụ/cửa hàng của Phase
     3-4 đã chuyển sang document (xem v2-phase34.js).
   - Panel Phase 3-4 được renderPanels() vẽ lại mỗi 3 giây vào host
     #v2-p34-panels (đang display:none để làm khu vực chờ), shell
     quan sát host bằng MutationObserver và phân phối lại ngay sau
     mỗi lần vẽ. Sửa lặp 24/10: distributePanels() xoá bản cũ cùng
     key và các panel không còn trong đợt mới trước khi append, và
     không làm gì khi host rỗng (callback sau khi move), nên mỗi
     panel luôn chỉ có đúng 1 bản trong tab.
   - Lớp 1-5: chỉ tab Học + Hồ sơ; hệ thống nặng vẫn tắt như cũ.
   - Màn đăng nhập và màn chơi ẩn header/bottom bar; overlay mô
     phỏng (z-index 9999) vẫn phủ trên cùng và không có trợ giúp.
   - XP của lượt chỉ chốt sau khi nộp (do hệ số lặp chủ đề), nên
     màn chơi hiện XP tích lũy của người chơi, không hiện số XP
     lượt ước tính gây sai lệch; XP lượt chốt hiện ở màn kết quả
     như Phase 1 đã làm.
   - Lựa chọn ở điểm mơ hồ (ghi để Danh veto): nút chọn nhân vật,
     đổi giọng và đăng xuất vẫn nằm trong #profile-bar ở header
     (giữ nguyên id và listener của renderProfileBar, tránh trùng
     id nếu nhân bản sang tab Hồ sơ); tab Hồ sơ chỉ tóm tắt hồ sơ
     + chứa đầy đủ panel âm thanh và báo lỗi, kèm dòng ghi chú
     vị trí của các nút đó.
   - File chạy được cả trong Node (chỉ export logic thuần, không
     chạm document khi document không tồn tại) để test được.
   ================================================================ */
(function () {
  var root = (typeof window !== "undefined") ? window : (typeof global !== "undefined" ? global : this);
  var PANEL_TAB = { daily: "quests", weekly: "quests", weakness: "quests", streak: "quests", shop: "shop", cards: "shop", achievements: "achievements" };
  function panelTab(panel) { return PANEL_TAB[panel] || null; }
  function tabsForGrade(grade) { return (typeof grade === "number" && grade >= 6) ? ["home", "quests", "shop", "achievements", "profile"] : ["home", "profile"]; }
  function isClaimable(quests) {
    if (!quests) return false;
    function q(x) { return x && x.p >= 1 && !x.claimed; }
    /* Nhiệm vụ sao: target 8, không phải 1 — kiểm tra riêng. */
    if (quests.rounds && quests.rounds.p >= 1 && !quests.rounds.claimed) return true;
    if (quests.review && quests.review.p >= 1 && !quests.review.claimed) return true;
    if (quests.stars && quests.stars.p >= 8 && !quests.stars.claimed) return true;
    if (quests.weekly && (quests.weekly.days && quests.weekly.days.length >= 5 || quests.weekly.masteredThisWeek) && !quests.weekly.claimed) return true;
    if (quests.weakness && quests.weakness.p >= 1 && !quests.weakness.claimed) return true;
    return false;
  }
  function streakAtRisk(streak, quests) {
    if (!streak || !streak.current) return false;
    if (quests && quests.rounds && quests.rounds.p > 0) return false;
    return true;
  }
  var api = { panelTab: panelTab, tabsForGrade: tabsForGrade, isClaimable: isClaimable, streakAtRisk: streakAtRisk, PANEL_TAB: PANEL_TAB };
  root.__v2shell = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document === "undefined" || !document.getElementById) return;

  var currentTab = "home";
  function $(id) { return document.getElementById(id); }
  function getProfile() {
    try {
      if (root.profile) return root.profile;
      if (typeof profile !== "undefined" && profile) return profile;
    } catch (e) {}
    return null;
  }
  function gradeOf() {
    var p = getProfile();
    if (p && typeof p.grade === "number") return p.grade;
    var bar = $("profile-bar");
    var m = bar && bar.textContent ? bar.textContent.match(/Lớp\s+(\d+)/) : null;
    return m ? parseInt(m[1], 10) : 1;
  }
  function showTab(tab) {
    var allowed = tabsForGrade(gradeOf());
    if (allowed.indexOf(tab) === -1) tab = "home";
    currentTab = tab;
    var panels = { home: $("v2-tab-home"), quests: $("v2-tab-quests"), shop: $("v2-tab-shop"), achievements: $("v2-tab-achievements"), profile: $("v2-tab-profile") };
    Object.keys(panels).forEach(function (k) { if (panels[k]) panels[k].hidden = (k !== tab); });
    var btns = document.querySelectorAll("#v2-bottombar [data-v2-tab]");
    btns.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-v2-tab") === tab); });
    try { window.scrollTo(0, 0); } catch (e) {}
  }
  function goTab(tab) {
    /* Tab là điều hướng thật: nếu đang ở màn chủ đề/chuyên đề/giải
       trí/kết quả thì về trang đầu trước rồi mới hiện tab. */
    var home = $("scr-home");
    if (home && !home.classList.contains("on")) {
      if (typeof root.show === "function") { try { root.show("scr-home"); } catch (e) {} }
      else home.classList.add("on");
      /* show() của vỏ cũ chỉ biết 4 màn; ép các màn còn lại tắt. */
      ["scr-topics", "scr-chuyende", "scr-giaitri", "scr-result", "scr-game", "scr-login"].forEach(function (id) { var s = $(id); if (s) s.classList.remove("on"); });
      home.classList.add("on");
    }
    showTab(tab);
    syncShell();
  }
  function distributePanels() {
    var host = $("v2-p34-panels");
    if (!host) return;
    var targets = { quests: $("v2-tab-quests-inner"), shop: $("v2-tab-shop-inner"), achievements: $("v2-tab-achievements-inner") };
    var panels = host.querySelectorAll ? host.querySelectorAll("[data-p34-panel]") : [];
    /* Sửa lặp 24/10: panel đã move sang tab thì không còn là con của host,
       nên lần render sau host.innerHTML mới không xoá được bản cũ trong
       tab và shell lại append thêm bản mới — cứ 3 giây tab lại thêm một
       bản sao. Cách sửa: chỉ phân phối khi host đang có một đợt render
       mới (panels.length > 0); khi host rỗng (đợt callback sau khi move)
       thì không làm gì, tránh xoá sạch tab. Trong một đợt mới, trước khi
       append thì xoá bản cũ cùng data-p34-panel trong tab đích, và xoá
       luôn các panel của tab đó không còn trong đợt mới (ví dụ weakness
       biến mất khi hết kĩ năng yếu), nên mỗi panel luôn chỉ có đúng 1
       bản trong tab sau mỗi chu kỳ. */
    if (!panels.length) return;
    var fresh = {};
    panels.forEach(function (p) { fresh[p.getAttribute("data-p34-panel")] = true; });
    Object.keys(targets).forEach(function (tab) {
      var target = targets[tab];
      if (!target || !target.querySelectorAll) return;
      target.querySelectorAll("[data-p34-panel]").forEach(function (old) {
        var key = old.getAttribute("data-p34-panel");
        if (!fresh[key] && panelTab(key) === tab) old.remove();
      });
    });
    panels.forEach(function (panel) {
      var tab = panelTab(panel.getAttribute("data-p34-panel"));
      if (tab && targets[tab]) {
        var key = panel.getAttribute("data-p34-panel");
        targets[tab].querySelectorAll("[data-p34-panel=\"" + key + "\"]").forEach(function (old) { old.remove(); });
        targets[tab].appendChild(panel); /* move, không clone */
      }
    });
  }
  function syncShell() {
    distributePanels();
    var grade = gradeOf(), teen = grade >= 6, allowed = tabsForGrade(grade);
    if (allowed.indexOf(currentTab) === -1) showTab("home");
    document.body.classList.toggle("v2-kids", !teen);
    var btns = document.querySelectorAll("#v2-bottombar [data-v2-tab]");
    btns.forEach(function (b) { b.style.display = (allowed.indexOf(b.getAttribute("data-v2-tab")) !== -1) ? "" : "none"; });
    /* Trạng thái màn hình: header/bottom bar chỉ ở màn chính. */
    var loginOn = $("scr-login") && $("scr-login").classList.contains("on");
    var gameOn = $("scr-game") && $("scr-game").classList.contains("on");
    var simOpen = !!document.getElementById("v2-sim-overlay");
    document.body.classList.toggle("v2-in-login", !!loginOn);
    document.body.classList.toggle("v2-in-game", !!gameOn);
    document.body.classList.toggle("v2-sim-open", simOpen);
    /* Header: menu 👤 vẽ lại là đóng lại, đồng bộ aria-expanded. */
    var menuBtn = $("v2-header-menu"), menuPanel = $("v2-hd-menu");
    if (menuBtn && menuPanel && menuPanel.hidden) menuBtn.setAttribute("aria-expanded", "false");
    /* Header: chuỗi ngày + chấm đỏ nhiệm vụ + cảnh báo chuỗi. */
    var p = getProfile(), streakEl = $("v2-header-streak"), badge = $("v2-header-badge"), dot = $("v2-tab-dot-quests");
    if (p && p.v2p34) {
      var s = p.v2p34.streak || { current: 0 };
      if (streakEl) { var st = "🔥 " + (s.current || 0); if (streakEl.textContent !== st) streakEl.textContent = st; streakEl.classList.toggle("at-risk", streakAtRisk(s, p.v2p34.quests)); }
      var claim = isClaimable(p.v2p34.quests);
      if (badge) badge.hidden = !claim;
      if (dot) dot.hidden = !claim;
    } else {
      if (streakEl) streakEl.textContent = "🔥 0";
      if (badge) badge.hidden = true;
      if (dot) dot.hidden = true;
    }
    /* Hồ sơ: tóm tắt chỉ đọc, không nhân bản nút chọn nhân vật/giọng.
       Thiết kế lại 24/10 theo hướng game hơn: tên/lớp một dòng ngắn,
       các số liệu thành ô icon số lớn, thay cho đoạn văn nối bằng "·". */
    var sum = $("v2-profile-summary");
    if (sum && p) {
      var lvl = p.level || 1;
      var streakNow = (p.v2p34 && p.v2p34.streak) ? (p.v2p34.streak.current || 0) : 0;
      var stat = function (icon, num, label) { return "<div class=\"v2-stat\"><span class=\"v2-stat-icon\">" + icon + "</span><span class=\"v2-stat-num\">" + num + "</span><span class=\"v2-stat-label\">" + label + "</span></div>"; };
      var sumHtml = "<div class=\"v2-profile-name\">" + (p.name || "") + " · Lớp " + (p.grade || "") + (p.lop ? " · " + p.lop : "") + "</div><div class=\"v2-stat-grid\">" + stat("⭐", p.totalStars || 0, "Sao") + stat("🎓", lvl, "Cấp") + stat("✨", p.xp || 0, "XP") + stat("🪙", p.coins || 0, "Xu") + stat("🔥", streakNow, "Chuỗi") + "</div>";
      if (sum.innerHTML !== sumHtml) sum.innerHTML = sumHtml; /* chỉ gán khi đổi, tránh vòng lặp MutationObserver */
    }
    var ghost = $("v2-ghost-note");
    if (ghost && p && p.v2p34) {
      var bestStars = 0, k;
      if (p.best) for (k in p.best) if (p.best[k] > bestStars) bestStars = p.best[k];
      var ghostText = "👻 Kỷ lục của bạn: 🔥 " + ((p.v2p34.streak && p.v2p34.streak.best) || 0) + " ngày · ⭐ " + bestStars + " sao/lượt";
      if (ghost.textContent !== ghostText) ghost.textContent = ghostText;
    }
    var xpEl = $("v2-game-xp");
    if (xpEl && p) { var xpText = "Cấp " + (p.level || 1) + " · " + (p.xp || 0) + " XP"; if (xpEl.textContent !== xpText) xpEl.textContent = xpText; }
  }
  function openProfilePanel(panelId) {
    goTab("profile");
    var panel = $(panelId);
    if (panel) panel.hidden = false;
    var row = panel && panel.parentNode;
    if (panel) setTimeout(function () { try { panel.scrollIntoView({ block: "start" }); } catch (e) {} }, 0);
  }
  function init() {
    var bar = $("v2-bottombar");
    if (bar) bar.addEventListener("click", function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest("[data-v2-tab]") : null;
      if (b) goTab(b.getAttribute("data-v2-tab"));
    });
    var snd = $("v2-header-sound"), set = $("v2-header-settings");
    if (snd) snd.addEventListener("click", function () { openProfilePanel("sound-panel-home"); });
    if (set) set.addEventListener("click", function () { openProfilePanel("sound-panel-home"); });
    /* Header mới: nút 👤 mở/đóng menu chứa giới tính, giọng và đổi
       người chơi (các nút đó giữ nguyên id, listener vẫn do
       renderProfileBar gắn mỗi lần vẽ lại header). Dùng delegation
       trên #v2-header nên không mất handler khi header vẽ lại. */
    var hdr = $("v2-header");
    if (hdr) hdr.addEventListener("click", function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest("#v2-header-menu") : null;
      if (!b) return;
      var panel = $("v2-hd-menu");
      if (!panel) return;
      panel.hidden = !panel.hidden;
      b.setAttribute("aria-expanded", String(!panel.hidden));
    });
    if (typeof MutationObserver !== "undefined") {
      var host = $("v2-p34-panels");
      if (host) new MutationObserver(function () { distributePanels(); syncShell(); }).observe(host, { childList: true });
      var profBar = $("profile-bar");
      if (profBar) new MutationObserver(function () { syncShell(); }).observe(profBar, { childList: true, subtree: true });
      new MutationObserver(function () { syncShell(); }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    }
    setInterval(syncShell, 3000);
    showTab("home");
    syncShell();
  }
  root.__v2showTab = goTab;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
