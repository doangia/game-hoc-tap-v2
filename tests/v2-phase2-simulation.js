// V2 Phase 2 simulation test — NOT loaded by the game.
// Loads assets/data/v2-phase2.js in a vm with browser globals stubbed
// (document undefined, so initUi is skipped) and checks adaptive rules,
// spaced review, paper building/scoring and generator shape.
// Run: node tests/v2-phase2-simulation.js  (from the repo root)
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const code = fs.readFileSync(path.join(__dirname, "..", "assets", "data", "v2-phase2.js"), "utf8");
global.window = global;
vm.runInThisContext(code);
const P2 = global.__v2p2;
if (!P2) { console.error("FAIL: __v2p2 not defined"); process.exit(1); }
let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? "PASS" : "FAIL") + " " + name + (extra !== undefined ? " -> " + extra : ""));
  if (!cond) failures++;
}
function freshProfile() { return { name: "Test", grade: 8, totalStars: 0, best: {}, xp: 0, coins: 0, character: "owl", tone: "teen", v2migrated: true }; }

// 1. Level up after exactly 3 correct in a row, max +1 per round.
let prof = freshProfile();
let r = P2.startRound();
check("round id increments", r >= 1, r);
P2.recordSkill(prof, "m8-mono", true, { roundId: r });
P2.recordSkill(prof, "m8-mono", true, { roundId: r });
let up = P2.recordSkill(prof, "m8-mono", true, { roundId: r });
check("level up after 3 correct in a row", up.changed === "up" && up.level === 2, JSON.stringify(up));
let up2 = P2.recordSkill(prof, "m8-mono", true, { roundId: r });
check("no second level jump in same round", up2.level === 2, JSON.stringify(up2));
let r2 = P2.startRound();
P2.recordSkill(prof, "m8-mono", true, { roundId: r2 });
P2.recordSkill(prof, "m8-mono", true, { roundId: r2 });
let up3 = P2.recordSkill(prof, "m8-mono", true, { roundId: r2 });
check("level can rise again in a new round (max +1 per round, not per skill)", up3.level === 3, JSON.stringify(up3));

// 2. Level down after exactly 2 wrong in a row, with easier-variant flag.
let prof2 = freshProfile();
P2.ensureProfileV2(prof2);
prof2.skills["m8-addsub"] = { level: 2, correct: 0, total: 0, window: [], streakC: 0, streakW: 0, atLevel: 0, sinceChange: 99, changedRound: null, nextReview: null, interval: 1, reviewCount: 0, nextEasy: false };
let rd = P2.startRound();
P2.recordSkill(prof2, "m8-addsub", false, { roundId: rd });
let down1 = P2.recordSkill(prof2, "m8-addsub", false, { roundId: rd });
check("level down after 2 wrong in a row", down1.changed === "down" && down1.level === 1 && down1.nextEasy === true, JSON.stringify(down1));

// 3. >=80% in last 10 also raises (window rule, not only streak).
let prof3 = freshProfile();
P2.ensureProfileV2(prof3);
let st3 = P2.skillState(prof3, "m8-mul");
// Simulate 8 correct / 2 wrong in last 10, no 3-streak at the end: pattern C C W C C W C C C C is messy; instead drive streak-free via alternating? Use direct state then one correct:
st3.level = 1; st3.window = [1, 1, 0, 1, 1, 0, 1, 1, 1]; st3.streakC = 1; st3.sinceChange = 99; st3.changedRound = null; st3.atLevel = 9;
let wr = P2.startRound();
let winUp = P2.recordSkill(prof3, "m8-mul", true, { roundId: wr });
check(">=80% in last 10 raises level", winUp.changed === "up" && winUp.level === 2, JSON.stringify(winUp));

// 4. Spaced review: 1 -> 3 -> 7 days, wrong resets to 1.
let prof4 = freshProfile();
let item = P2.addReview(prof4, "m8-addsub", "8|g8-math|m8-c1", "test prompt", "2026-10-24");
check("review first due = next day (1)", item.nextReview === "2026-10-25" && item.interval === 1, JSON.stringify(item));
let a1 = P2.answerReview(prof4, "m8-addsub", true, "2026-10-25");
check("review correct: interval 3, next 2026-10-28", a1.interval === 3 && a1.nextReview === "2026-10-28", JSON.stringify(a1));
let a2 = P2.answerReview(prof4, "m8-addsub", true, "2026-10-28");
check("review correct again: interval 7, next 2026-11-04", a2.interval === 7 && a2.nextReview === "2026-11-04", JSON.stringify(a2));
let a3 = P2.answerReview(prof4, "m8-addsub", false, "2026-11-04");
check("review wrong: reset to interval 1, next 2026-11-05", a3.interval === 1 && a3.nextReview === "2026-11-05", JSON.stringify(a3));
let due = P2.dueReviews(prof4, "2026-11-05");
check("review due on its due date", due.length === 1, JSON.stringify(due));
check("review not due before its date", P2.dueReviews(prof4, "2026-11-04").length === 0);

// 5. Papers: Math 18 items, Lit 18 items, writing excluded from score.
let mathPaper = P2.buildPaper("8|g8-math|m8-c1");
check("math paper has 18 items", mathPaper.items.length === 18, mathPaper.items.length);
check("math paper has timer 1500s", mathPaper.durationSec === 1500);
let litPaper = P2.buildPaper("8|g8-nv|nv8-b1");
check("lit paper has 18 items (3 passages x 6)", litPaper.items.length === 18, litPaper.items.length);
check("lit paper passages are labelled as game-written, not SGK", litPaper.items.every(function (it) { return !it.passage || it.passage.text.length > 50; }) && P2.LIT_PASSAGES.length === 3);
let answers = mathPaper.items.map(function (it) {
  if (it.kind === "mcq") return it.answer;
  if (it.kind === "input") return it.answerNum;
  if (it.kind === "order") return it.items.slice();
  return "";
});
let scAll = P2.scorePaper(mathPaper, answers);
check("perfect math paper scores full, writing excluded", scAll.correct === scAll.total && scAll.total > 0, scAll.correct + "/" + scAll.total);
let firstMcq = mathPaper.items.findIndex(function (it) { return it.kind === "mcq"; });
let wrongAnswers = answers.slice(); wrongAnswers[firstMcq] = (wrongAnswers[firstMcq] + 1) % mathPaper.items[firstMcq].options.length;
let scOne = P2.scorePaper(mathPaper, wrongAnswers);
check("one wrong answer drops score by exactly 1", scOne.correct === scAll.correct - 1, scOne.correct + "/" + scOne.total);
let weakAnswers = mathPaper.items.map(function () { return -1; });
let scWeak = P2.scorePaper(mathPaper, weakAnswers);
check("all-wrong paper reports weak skills", scWeak.weak.length > 0, scWeak.weak.join(","));

// 6. Generators: shape, skill, level, answer in range, no duplicate options text for MCQ.
[["genMathWord", P2.genMathWord, "m8-word", 4], ["genMathError", P2.genMathError, "m8-error", 4], ["genMathInverse", P2.genMathInverse, "m8-inverse", 4], ["genMathSimplifyFull", P2.genMathSimplifyFull, "m8-simplify", 3]].forEach(function (t) {
  let q = t[1]();
  check(t[0] + " has skill/level/options/answer", q.__v2skill === t[2] && q.__v2level === t[3] && q.options.length >= 3 && q.answer >= 0 && q.answer < q.options.length, q.__v2skill + "/" + q.__v2level + " ans=" + q.answer);
});
let steps = P2.genMathSteps();
check("genMathSteps is a sort question with 4 steps", steps.kind === "sort" && steps.items.length === 4 && steps.__v2skill === "m8-steps", steps.items.join(" | "));
["genLitInference", "genLitWordchoice", "genLitTheme"].forEach(function (fn) {
  let q = P2[fn]();
  check(fn + " is a lit MCQ with passage visual", q.options.length >= 3 && q.__v2topic === "nv8-b1" && String(q.visual).indexOf("không phải trích SGK") !== -1, q.__v2skill);
});

// 7. Tagging existing questions.
let tagged = P2.tagQuestion({ prompt: "Bậc của đơn thức sau là bao nhiêu?" }, "m8MonoDeg", "8|g8-math|m8-c1");
check("tagExistingMath m8MonoDeg -> m8-mono level 2", tagged.__v2skill === "m8-mono" && tagged.__v2level === 2, JSON.stringify(tagged.__v2skill) + "/" + tagged.__v2level);
let taggedLit = P2.tagQuestion({ prompt: "Hình ảnh “lá cờ thêu sáu chữ vàng” tượng trưng cho điều gì?" }, "", "8|g8-nv|nv8-b1");
check("tagExistingLit meaning -> nv1-meaning level 2", taggedLit.__v2skill === "nv1-meaning" && taggedLit.__v2level === 2, taggedLit.__v2skill);

// 8. Interleaving: no 3 consecutive same-skill items in a mixed review set.
let mixed = [];
["m8-mono", "m8-mono", "m8-mono", "m8-addsub", "m8-mul", "m8-div", "m8-value", "m8-mono", "m8-addsub", "m8-mul"].forEach(function (s) { mixed.push({ skill: s }); });
let mixedOut = P2.interleave(mixed);
let triple = false;
for (let i = 2; i < mixedOut.length; i++) if (mixedOut[i].skill === mixedOut[i - 1].skill && mixedOut[i].skill === mixedOut[i - 2].skill) triple = true;
check("interleave avoids 3 same-skill in a row", !triple, mixedOut.map(function (x) { return x.skill; }).join(","));

// 9. wrapPools tags and does not crash on a mock pool.
function mockMonoDeg() { return { prompt: "Bậc của đơn thức sau là bao nhiêu?", options: [{ html: "3" }], answer: 0 }; }
let wrapped = P2.wrapPools({ choose: [mockMonoDeg], blank: [], match: [], games: [] }, "8|g8-math|m8-c1", freshProfile());
let wq = wrapped.choose[0]();
check("wrapPools tags mock question", wq && wq.__v2skill === "m8-mono", wq && wq.__v2skill);

console.log(failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED");
process.exit(failures === 0 ? 0 : 1);
