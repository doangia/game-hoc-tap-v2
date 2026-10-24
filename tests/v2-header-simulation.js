// V2 header redesign simulation test — NOT loaded by the game.
// Checks the pure, testable parts of the new header:
//  (1) miniDollSVG() returns the real wardrobe SVG doll (same outfit,
//      skin tone and pet as the wardrobe screen), without the stage
//      wrapper or the try-on note;
//  (2) index.html still contains every old header control and stat
//      (gender select, tone toggle, logout, streak, sound, settings,
//      stars, XP, coins, badges) after the redesign, with the rarely
//      used controls moved inside the 👤 menu panel, and the stars /
//      coins / badges chips moved into the top-right currency row
//      (before the streak chip), no longer under the XP bar.
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
has(html, 'id="v2-hd-currency"', "currency row exists in the top-right cluster");
eq(html.indexOf('id="v2-hd-currency"') < html.indexOf('id="v2-header-streak"'), true, "currency row comes before the streak chip in the top-right cluster");
eq(html.indexOf('id="v2-hd-currency"') < html.indexOf('id="v2-header-sound"'), true, "currency row comes before the sound button in the top-right cluster");
eq(html.indexOf('<div class="v2-hd-chips">') === -1, true, "chips row under the XP bar is gone");
has(html, ".v2-hd-currency", "currency row is styled");
eq(html.indexOf("v2-hd-currency { flex-basis: 100%") !== -1, true, "currency row takes its own wrapped row on narrow phones");
has(html, "Hộp ", "next milestone unlock line exists");
eq(html.indexOf('<label class="v2-xp" for="v2-gender-sel">Giới tính:</label>') === -1, true, "old full-width gender row is gone");
has(shell, "v2-header-menu", "ui shell toggles the header menu");
has(html, "max-width: 560px", "narrow-phone media query exists");

/* Phạm vi hẹp 25/10 (đính chính của người dùng): chỉ cụm sao/xu/huy
   hiệu lên góc phải + 2 sửa lỗi, còn lại giữ nguyên như bản 23f73f7.
   (a) Không còn bố cục grid 2 hàng của bản sửa vỡ layout trước đó;
   khối cấp/XP vẫn là hàng .v2-hd-level gốc: vòng cấp kề khối XP,
   số XP giữ nguyên câu đầy đủ "lên cấp". (b) Nền track thanh XP đậm
   để nhìn thấy được ngay cả ở 0%. (c) Câu chuỗi ngày của feat-a1 giữ
   nguyên như bản gốc, không rút gọn, không sửa búp bê hay vị trí nút. */
var renderFn = html.slice(html.indexOf("function renderProfileBar"), html.indexOf("function renderGradeTabs"));
eq(html.indexOf('grid-template-areas: "doll top" "level level"') === -1, true, "no 2-row grid layout from the over-broad fix");
eq(renderFn.indexOf("v2-hd-lvl") < renderFn.indexOf("v2-hd-xpwrap"), true, "level badge sits beside the XP block in the same row");
has(renderFn, "XP nữa lên cấp ", "XP numbers keep the full next-level phrase");
has(html, ".v2-hd-xpbar { height: 18px; background: #f0dfba", "XP bar track is dark enough to see at 0%");
var a1 = fs.readFileSync(path.join(__dirname, "..", "assets", "data", "feat-a1.js"), "utf8");
has(a1, "học hôm nay để giữ chuỗi nhé!", "streak sentence is unchanged from the original");
has(a1, "Huy hiệu: ", "streak area keeps its original badges mention (unchanged scope)");

console.log(failures === 0 ? "ALL CHECKS PASSED (" + n + " checks)" : failures + " FAILURES");
process.exit(failures === 0 ? 0 : 1);
