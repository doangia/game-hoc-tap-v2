// V2 Phase 1 simulation test — NOT loaded by the game (index.html never
// references this file). It extracts the real profile script block from
// index.html, stubs the browser globals it needs, and checks migration,
// XP/level thresholds, diminishing repeat XP, streak bonus and character
// rendering. Run: node tests/v2-profile-simulation.js  (from the repo root)
"use strict";
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const blocks = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const profileBlock = blocks.find(s => s.includes("HỒ SƠ + LƯU TRÊN MÁY"));
if (!profileBlock) { console.error("FAIL: profile script block not found"); process.exit(1); }
// Drop the boot section (it runs login/DOM code); keep only definitions.
const bootAt = profileBlock.indexOf('screens.push("scr-login")');
const code = bootAt >= 0 ? profileBlock.slice(0, bootAt) : profileBlock;

// ---- Fake browser globals ----
const store = {};
global.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};
const els = {};
function makeEl(id) {
  return { id, innerHTML: "", value: "", _handlers: {},
    addEventListener: function (ev, fn) { this._handlers[ev] = fn; },
    setAttribute: function () {}, getAttribute: function () { return null; },
    querySelectorAll: function () { return []; } };
}
global.el = id => (els[id] || (els[id] = makeEl(id)));
global.show = () => {};
global.GRADES = {};
global.openTopics = () => {}; // defined by an earlier game script block in the real page
global.currentSubject = null;
global.window = global;
global.document = { body: { classList: { toggle: () => {} } }, querySelectorAll: () => [] };

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? "PASS" : "FAIL") + " " + name + (extra !== undefined ? " -> " + extra : ""));
  if (!cond) failures++;
}

// vm.runInThisContext (not eval): like a browser <script>, top-level function
// declarations become globals even though the block starts with "use strict".
require("vm").runInThisContext(code); // defines loadProfile, saveProfile, saveRoundResult, renderProfileBar, v2*, etc.
const LS_KEY = "gameHocTap_profile_v2";

// 1. Old v1 profile (grade 8) migrates once, stars/best intact.
store[LS_KEY] = JSON.stringify({ name: "Test8", grade: 8, lop: "8A", totalStars: 37, best: { "8|g8-math|m8-c1": 7 } });
loadProfile();
check("v1 grade8 migrates: xp = 37*10", profile.xp === 370, profile.xp);
check("v1 grade8 migrates: coins = 37", profile.coins === 37, profile.coins);
check("v1 grade8 migrates: level 3 (250<=370<450)", profile.level === 3, profile.level);
check("v1 grade8 migrates: tone teen", profile.tone === "teen", profile.tone);
check("v1 grade8 migrates: character owl default", profile.character === "owl", profile.character);
check("v1 grade8 migrates: totalStars intact", profile.totalStars === 37, profile.totalStars);
check("v1 grade8 migrates: best intact", profile.best["8|g8-math|m8-c1"] === 7, JSON.stringify(profile.best));
check("v1 grade8 migrates: flag set", profile.v2migrated === true);
loadProfile(); // second load must NOT double-convert
check("second load does not double-convert xp", profile.xp === 370, profile.xp);
check("second load does not double-convert coins", profile.coins === 37, profile.coins);

// 2. Old v1 profile (grade 2) -> kids tone.
store[LS_KEY] = JSON.stringify({ name: "Test2", grade: 2, totalStars: 5, best: {} });
loadProfile();
check("v1 grade2 migrates: tone kids", profile.tone === "kids", profile.tone);
check("v1 grade2 migrates: xp = 50", profile.xp === 50, profile.xp);

// 3. Level boundaries.
const bounds = [[0, 1], [99, 1], [100, 2], [249, 2], [250, 3], [449, 3], [450, 4], [2699, 9], [2700, 10], [3299, 10], [3300, 11], [3900, 12]];
for (const [xp, lvl] of bounds) check(`levelForXp(${xp}) = ${lvl}`, v2LevelForXp(xp) === lvl, v2LevelForXp(xp));
const prog = v2XpProgress(370);
check("xpProgress(370): level 3, cur 250, next 450, pct 60",
  prog.level === 3 && prog.cur === 250 && prog.next === 450 && prog.pct === 60, JSON.stringify(prog));

// 4. Diminishing repeat XP + streak bonus + per-subject XP.
profile = { name: "Sim", grade: 8, lop: "", totalStars: 0, best: {}, xp: 0, coins: 0, character: "owl", tone: "teen", subjectXp: {}, topicPlays: {}, v2migrated: true, level: 1 };
saveProfile();
currentTopicKey = "8|g8-math|m8-c1";
global.game = { xpBonus: 0 };
let r1 = saveRoundResult(8);
check("round 1 same topic: xpGain 80", r1.xpGain === 80, r1.xpGain);
check("round 1: coins 8", profile.coins === 8, profile.coins);
check("round 1: subject g8-math xp 80", profile.subjectXp["g8-math"] && profile.subjectXp["g8-math"].xp === 80, JSON.stringify(profile.subjectXp));
let r2 = saveRoundResult(8);
check("round 2 same topic same day: xpGain 40 (50%)", r2.xpGain === 40, r2.xpGain);
let r3 = saveRoundResult(8);
check("round 3 same topic same day: xpGain 20 (25%)", r3.xpGain === 20, r3.xpGain);
global.game = { xpBonus: 5 };
currentTopicKey = "8|g8-nv|nv8-b1";
let r4 = saveRoundResult(3);
check("streak bonus: 3 stars first play +5 = 35", r4.xpGain === 35, r4.xpGain);

// 5. Level-up detection across a boundary.
profile.xp = 95; profile.level = v2LevelForXp(95); profile.coins = 0;
currentTopicKey = "8|g8-math|m8-c1"; profile.topicPlays = {}; game = { xpBonus: 0 };
let r5 = saveRoundResult(1); // +10 XP -> 105, crosses 100
check("level-up detected crossing 100", r5.leveledUp === true && r5.levelBefore === 1 && r5.levelAfter === 2, JSON.stringify(r5));

// 6. Character persists and renders in the profile bar avatar.
profile.character = "fox";
renderProfileBar();
const barHtml = els["profile-bar"].innerHTML;
// 26/10, theo quyết định của Danh "thiên thần thay luôn búp bê người":
// header luôn hiện thiên thần, không còn búp bê hay thú cưng ở đây nữa
// (tủ đồ vẫn giữ nguyên code, chỉ là header không dùng nó nữa).
check("profile bar avatar shows angel", barHtml.includes("v2-hd-doll") && barHtml.includes("assets/img/avatar.svg"), barHtml.slice(0, 200));
// DEMO v8 25/10 (Danh duyệt): stars/coins/badges move out of the
// profile bar into the top-right currency container, updated by the
// same renderProfileBar call; XP/level stay in the profile bar.
check("profile bar shows XP/level", barHtml.includes("XP"), barHtml.slice(0, 300));
check("currency container shows coins", (els["v2-hd-currency"] && els["v2-hd-currency"].innerHTML.includes("xu")), els["v2-hd-currency"] ? els["v2-hd-currency"].innerHTML.slice(0, 200) : "missing");

console.log(failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED");
process.exit(failures === 0 ? 0 : 1);
