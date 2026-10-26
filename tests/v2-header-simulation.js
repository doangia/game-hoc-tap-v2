// V2 header simulation test — NOT loaded by the game.
// Checks the pure, testable parts of the header:
//  (1) miniDollSVG() returns the real wardrobe SVG doll (same outfit,
//      skin tone and pet as the wardrobe screen), without the stage
//      wrapper or the try-on note;
//  (2) index.html still contains every old header control and stat
//      (gender select, tone toggle, logout, streak, sound, settings,
//      stars, XP, coins, badges), with the rarely used controls moved
//      inside the 👤 menu panel;
//  (3) DEMO v8 25/10 (user order: "ok, thực hiện" on demo v8, after
//      the 23f73f7 restore): stars / coins / badges move from under
//      the XP bar to the top of a separate right column
//      (#v2-hd-currency, pinned to the very top), with the flame /
//      sound / settings / profile actions row 32px below it so the
//      gap between the two rows roughly equals the gap below the
//      lower row. The only intentional exception to the 23f73f7
//      baseline besides this move is the wardrobe default-outfit
//      safety (doll never undressed), which lives in v2-wardrobe.js
//      and is covered by the wardrobe tests, not by the header markup.
// Run: node tests/v2-header-simulation.js
"use strict";
var fs = require("fs"), path = require("path");
var wd = require("../assets/data/v2-wardrobe.js");
var n = 0, failures = 0;
function eq(actual, expected, label) {
  n++;
  var a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { console.error("FAIL " + label + ": got " + a + ", want " + e); failures++; }
  else console.log("PASS " + label + " -> " + a);
}
function has(hay, needle, label) { eq(hay.indexOf(needle) !== -1, true, label); }

var p = { name: "Minh Mi", grade: 10, lop: "8B8", totalStars: 0, best: {},
  xp: 0, coins: 0, character: "human", gender: "female", skinTone: "medium",
  pet: null, tone: "teen", subjectXp: {}, topicPlays: {}, v2migrated: true, skills: {} };
wd.ensureWardrobe(p);
var mini = wd.miniDollSVG(p);
has(mini, "<svg", "mini doll is an SVG");
has(mini, 'data-layer="body"', "mini doll has body layer");
has(mini, "#d9a066", "mini doll uses medium skin tone");
eq(mini.indexOf("v2-doll-stage") === -1, true, "mini doll strips the stage wrapper");
eq(mini.indexOf("mặc thử") === -1, true, "mini doll strips the try-on note");
eq(mini.indexOf("</svg>") === mini.length - 6, true, "mini doll ends at the closing svg tag");

var p2 = JSON.parse(JSON.stringify(p));
wd.ensureWardrobe(p2);
p2.v2wardrobe.owned.push("pet-cat");
p2.v2wardrobe.equipped.pet = "pet-cat";
var miniPet = wd.miniDollSVG(p2);
has(miniPet, 'data-layer="pet"', "mini doll includes the equipped pet");

var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var shell = fs.readFileSync(path.join(__dirname, "..", "assets", "data", "v2-ui-shell.js"), "utf8");
has(html, 'id="v2-header-menu"', "header menu button exists");
has(html, 'id="v2-hd-menu" hidden', "header menu panel exists and starts hidden");
has(html, 'id="v2-gender-sel"', "gender select still exists");
has(html, 'id="btn-tone-toggle"', "tone toggle still exists");
has(html, 'id="btn-logout"', "logout still exists");
eq(html.indexOf('id="v2-hd-menu"') < html.indexOf('id="v2-gender-sel"'), true, "gender select lives inside the menu panel");
has(html, 'id="v2-header-streak"', "streak element still exists");
has(html, 'id="v2-header-sound"', "sound button still exists");
has(html, 'id="v2-header-settings"', "settings button still exists");
has(html, "v2-hd-lvl", "level circular badge exists");
has(html, "v2-hd-xpbar", "thick XP bar exists");
has(html, "v2-hd-chip", "stat chips exist");
has(html, "/16 huy hiệu", "badges chip shows earned out of total");
has(html, 'id="v2-hd-currency"', "DEMO v8: currency container exists at the top of the right column");
has(html, "v2-hd-right-col", "DEMO v8: separate right column exists");
has(html, "gap: 32px", "DEMO v8: right column gap is 32px (lower actions row moved up to balance)");
eq(html.indexOf('id="v2-hd-currency"') < html.indexOf('id="v2-header-streak"'), true, "DEMO v8: currency row comes before the actions row");
eq(html.indexOf('<div class="v2-hd-chips">') === -1, true, "DEMO v8: no chips row under the XP bar anymore");
has(html, "Hộp ", "next milestone unlock line exists");
eq(html.indexOf('<label class="v2-xp" for="v2-gender-sel">Giới tính:</label>') === -1, true, "old full-width gender row is gone");
has(shell, "v2-header-menu", "ui shell toggles the header menu");
has(html, "max-width: 560px", "narrow-phone media query exists");

/* DEMO v8 25/10 (Danh duyệt "ok, thực hiện"): nền 23f73f7 giữ nguyên
   — vòng cấp kề khối XP, số XP giữ nguyên câu đầy đủ "lên cấp",
   nền track thanh XP gốc #f5ecd7, câu chuỗi ngày của feat-a1 giữ
   nguyên bản gốc — chỉ khác ở chỗ sao/xu/huy hiệu chuyển từ dưới
   thanh XP lên cột phải trên cùng. Ngoại lệ duy nhất khác so với
   23f73f7 là bộ mặc định trong v2-wardrobe.js (búp bê không bao giờ
   trần), được kiểm tra ở bộ test tủ đồ. */
var renderFn = html.slice(html.indexOf("function renderProfileBar"), html.indexOf("function renderGradeTabs"));
eq(html.indexOf('grid-template-areas: "doll top" "level level"') === -1, true, "no 2-row grid layout from the over-broad fix");
eq(renderFn.indexOf("v2-hd-lvl") < renderFn.indexOf("v2-hd-xpwrap"), true, "level badge sits beside the XP block in the same row");
eq(renderFn.indexOf('<div class="v2-hd-chips">') === -1, true, "DEMO v8: profile bar no longer renders a chips row under the XP bar");
has(renderFn, 'el("v2-hd-currency")', "DEMO v8: render updates the top-right currency container");
has(renderFn, "XP nữa lên cấp ", "XP numbers keep the full next-level phrase");
has(html, ".v2-hd-xpbar { height: 18px; background: #f5ecd7", "RESTORE: XP bar track is the original 23f73f7 colour");
var p3 = JSON.parse(JSON.stringify(p));
p3.v2wardrobe = { owned: [], equipped: {}, tryOn: {}, variants: {}, outfits: [] };
var miniBare = wd.miniDollSVG(p3);
has(miniBare, 'data-layer="shirt"', "RESTORE: doll with empty outfit still renders a shirt (default outfit kept)");
has(miniBare, 'data-layer="bottom"', "RESTORE: doll with empty outfit still renders pants (default outfit kept)");
has(miniBare, 'data-layer="shoes"', "RESTORE: doll with empty outfit still renders shoes (default outfit kept)");
/* Hệ thống thiết kế v1 (26/10, Danh duyệt): token chuẩn, shell và
   component theo ảnh mẫu — nền trời, thẻ giấy da, nút chính vàng,
   đáp án màu đầy + hình khối theo thứ tự. */
has(html, "--ds-gold: #ffd866", "design system gold token exists");
has(html, "--ds-brown: #81572a", "design system brown token exists");
has(html, "--ds-parchment: #fef9f2", "design system parchment token exists");
eq(html.indexOf('background: linear-gradient(#ffffff, #dff1fd)') !== -1, true, "header uses sky gradient with gold trim");
has(html, ".v2-tab-btn.active { background: var(--ds-gold)", "active bottom tab uses gold");
has(html, '.opt.opt-c0 { background: var(--ds-red)', "answer 1 is strong red");
has(html, '.opt.opt-c1 { background: var(--ds-blue)', "answer 2 is strong blue");
has(html, '.opt.opt-c2 { background: var(--ds-yellow)', "answer 3 is strong yellow");
has(html, '.opt.opt-c3 { background: var(--good)', "answer 4 is strong green");
has(html, '.big-btn.primary { background: var(--ds-gold)', "primary button uses gold");
has(html, 'background: var(--ds-parchment)', "parchment cards exist");
/* 25/10, theo ý Danh: bảng chọn lớp không hiện mặc định trên trang
   chính khi người chơi đã chọn lớp lúc đăng nhập; chỉ hiện khi bấm
   Đổi lớp. Bảng chọn lớp lúc đăng nhập vẫn giữ nguyên. */
has(html, 'id="v2-grade-change-btn"', "home has a small Change-grade button");
has(html, 'id="v2-grade-picker-wrap" hidden', "home grade picker starts hidden");
eq(html.indexOf("Chọn lớp rồi chạm") === -1, true, "home greeting no longer tells the player to pick a grade");
has(html, 'id="login-grades"', "login grade picker is untouched");
var a1 = fs.readFileSync(path.join(__dirname, "..", "assets", "data", "feat-a1.js"), "utf8");
eq(a1.indexOf('who.appendChild(line)') === -1, true, "DEMO v8: feat-a1 no longer appends the duplicate streak/badges line to the header");
has(a1, "decorateProfileBar", "decorate function still exists so the render wrapper stays safe");
has(a1, "computeStreak", "streak data itself is untouched (still used elsewhere)");

console.log(failures === 0 ? "ALL CHECKS PASSED (" + n + " checks)" : failures + " FAILURES");
process.exit(failures === 0 ? 0 : 1);
