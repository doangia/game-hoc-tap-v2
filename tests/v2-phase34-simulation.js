/* Node simulation for v2 Phase 3-4 (quests, streak, shop, helpers).
   Runs against the real module code (assets/data/v2-phase34.js),
   not a re-implementation. Not loaded by the game. */
"use strict";
var m = require("../assets/data/v2-phase34.js");
var n = 0;
function eq(actual, expected, label) {
  n++;
  var a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { console.error("FAIL " + label + ": got " + a + ", want " + e); process.exit(1); }
  console.log("PASS " + label + " -> " + a);
}
function teenProfile(coins) {
  return { name: "Test", grade: 8, lop: "8A", totalStars: 37, best: { "8|g8-math|m8-c1": 7 },
    xp: 370, coins: coins == null ? 100 : coins, character: "owl", tone: "teen",
    subjectXp: {}, topicPlays: {}, v2migrated: true,
    skills: { "m8-addsub": { level: 2, correct: 8, total: 12, window: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1] } },
    review: [{ skill: "m8-addsub", topic: "8|g8-math|m8-c1", prompt: "x", interval: 1, nextReview: "2026-10-24", count: 0 }],
    sim: { lastPaperId: "old", lastTopic: "8|g8-math|m8-c1", weak: [], retakeUnlocked: false, reviewDone: false } };
}

/* 1. Migration preserves Phase 1/2 data */
var p = teenProfile(100);
var q = m.ensureV2P34(p);
eq(p.totalStars, 37, "migration keeps totalStars");
eq(p.xp, 370, "migration keeps xp");
eq(p.coins, 100, "migration keeps coins");
eq(p.skills["m8-addsub"].total, 12, "migration keeps skills");
eq(p.review.length, 1, "migration keeps review queue");
eq(q.streak.current, 0, "streak starts 0");
eq(q.achievements.length, 0, "no achievements initially");

/* 2. Grades 1-5: no quest/streak tracking */
var kid = { name: "Kid", grade: 2, xp: 50, coins: 5, totalStars: 5, best: {} };
eq(m.recordRoundComplete(kid, 8, "2|g2-math|t1", "2026-10-24", false), null, "grade 2 round not tracked");
eq(kid.v2p34, undefined, "grade 2 profile untouched");

/* 3. Daily quests: rounds + stars anti-farm (one topic/day counts) */
m.recordRoundComplete(p, 8, "8|g8-math|m8-c1", "2026-10-24", false);
eq(p.v2p34.quests.rounds.p, 1, "round quest progress 1");
eq(p.v2p34.quests.stars.p, 8, "stars quest 8 after first topic");
m.recordRoundComplete(p, 5, "8|g8-math|m8-c1", "2026-10-24", false);
eq(p.v2p34.quests.stars.p, 8, "same topic repeat adds no stars quest progress");
m.recordRoundComplete(p, 3, "8|g8-nv|nv8-b1", "2026-10-24", false);
eq(p.v2p34.quests.stars.p, 11, "different topic adds stars quest progress");
var c1 = m.claimDaily(p, "stars", "2026-10-24");
eq(c1.ok, true, "stars quest claim ok");
eq(p.v2p34.quests.stars.claimed, true, "stars quest claimed flag");
eq(m.claimDaily(p, "stars", "2026-10-24").ok, false, "stars quest cannot claim twice");
eq(m.claimDaily(p, "rounds", "2026-10-24").ok, true, "round quest claim ok");
eq(m.claimDaily(p, "review", "2026-10-24").ok, false, "review quest not done yet");

/* 4. Streak: same day no double, next day +1, freeze covers 1 missed day */
eq(p.v2p34.streak.current, 1, "streak 1 on first day");
m.recordRoundComplete(p, 4, "8|g8-math|m8-c1", "2026-10-25", false);
eq(p.v2p34.streak.current, 2, "streak 2 on consecutive day");
var pf = teenProfile(100);
m.recordRoundComplete(pf, 5, "8|g8-math|m8-c1", "2026-10-20", false);
eq(m.buyFreeze(pf).ok, true, "buy freeze ok");
eq(pf.v2p34.streak.freezes, 1, "freeze held 1");
m.recordRoundComplete(pf, 5, "8|g8-math|m8-c1", "2026-10-22", false); /* missed 2026-10-21 */
eq(pf.v2p34.streak.current, 2, "freeze preserves streak over 1 missed day");
eq(pf.v2p34.streak.freezes, 0, "freeze consumed");
m.recordRoundComplete(pf, 5, "8|g8-math|m8-c1", "2026-10-25", false); /* missed 23, 24, no freeze */
eq(pf.v2p34.streak.current, 1, "streak resets after gap without freeze");
eq(pf.v2p34.streak.lost, 2, "lost streak remembered for recovery");

/* 5. Freeze cap and insufficient coins */
var pb = teenProfile(25);
eq(m.buyFreeze(pb).ok, false, "freeze with 25 coins fails");
eq(pb.coins, 25, "coins unchanged on failed freeze");
pb.coins = 100;
eq(m.buyFreeze(pb).ok, true, "freeze 1 ok");
eq(m.buyFreeze(pb).ok, true, "freeze 2 ok");
eq(m.buyFreeze(pb).ok, false, "freeze 3 blocked by cap 2");
eq(pb.v2p34.streak.freezes, 2, "freeze cap is 2");

/* 6. Recovery: 3 reviews same day within window restores; 30-day cooldown */
var rr = m.recordReviewComplete(pf, true, "2026-10-25");
eq(rr.recovered, false, "1 review does not recover");
m.recordReviewComplete(pf, true, "2026-10-25");
rr = m.recordReviewComplete(pf, true, "2026-10-25");
eq(rr.recovered, true, "3 reviews in one day recovers streak");
eq(pf.v2p34.streak.current, 2, "streak restored to lost value");
eq(pf.v2p34.streak.lost, 0, "lost streak cleared after recovery");
/* Second loss within 30 days: recovery must be blocked */
m.recordRoundComplete(pf, 5, "8|g8-math|m8-c1", "2026-10-26", false);
m.recordRoundComplete(pf, 5, "8|g8-math|m8-c1", "2026-10-29", false); /* gap, no freeze */
eq(pf.v2p34.streak.lost > 0, true, "second loss recorded");
m.recordReviewComplete(pf, true, "2026-10-29");
m.recordReviewComplete(pf, true, "2026-10-29");
rr = m.recordReviewComplete(pf, true, "2026-10-29");
eq(rr.recovered, false, "recovery blocked within 30 days of last use");

/* 7. Weekly quest: 5 different days, claim once */
var pw = teenProfile(100);
["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23"].forEach(function (d) {
  m.recordRoundComplete(pw, 3, "8|g8-math|m8-c1", d, false);
});
eq(pw.v2p34.quests.weekly.days.length, 5, "weekly 5 days");
var wc = m.claimWeekly(pw, "2026-10-23");
eq(wc.ok, true, "weekly claim ok");
eq(wc.coins, 30, "weekly reward 30 coins");
eq(m.claimWeekly(pw, "2026-10-23").ok, false, "weekly cannot claim twice");

/* 8. Weakness quest: generated from weak skill, completed by a review */
var pk = teenProfile(100);
pk.skills = { "m8-div": { level: 2, correct: 1, total: 5, window: [0, 0, 1, 0, 0] } };
m.refreshWeaknessQuest(pk, "2026-10-24");
eq(pk.v2p34.quests.weakness.skills, ["m8-div"], "weakness quest generated from weak skill");
m.recordReviewComplete(pk, true, "2026-10-24");
eq(pk.v2p34.quests.weakness.p, 1, "review completes weakness quest");
var wk2 = m.claimWeakness(pk, "2026-10-24");
eq(wk2.ok, true, "weakness claim ok");
eq(wk2.xp, 15, "weakness reward 15 XP");
eq(wk2.coins, 10, "weakness reward 10 coins");

/* 9. Shop: no negative coins, no double ownership, equip only owned */
var ps = teenProfile(20);
eq(m.buyItem(ps, "frame-gold").ok, false, "frame with 20 coins fails");
eq(ps.coins, 20, "coins unchanged on failed purchase");
ps.coins = 100;
eq(m.buyItem(ps, "frame-gold").ok, true, "frame-gold buy ok");
eq(ps.coins, 70, "frame-gold deducts 30");
eq(m.buyItem(ps, "frame-gold").ok, false, "frame cannot be bought twice");
eq(m.buyItem(ps, "skin-dragon").ok, false, "skin-dragon with 70 coins fails");
ps.coins = 170;
eq(m.buyItem(ps, "skin-dragon").ok, true, "skin-dragon buy ok");
eq(m.equipSkin(ps, "dragon"), true, "equip owned skin ok");
eq(ps.character, "dragon", "character switches to owned skin");
eq(m.equipSkin(ps, "unicorn"), false, "equip unowned skin fails");
eq(m.buyItem(ps, "help-eliminate").ok, true, "helper eliminate buy ok");
eq(ps.v2p34.helpers.eliminate, 1, "helper inventory 1");

/* 10. Helpers: max 2 per game, banned in simulation */
global.document = {
  getElementById: function () { return null; },
  querySelectorAll: function () { return [{ disabled: false, style: {} }, { disabled: false, style: {} }, { disabled: false, style: {} }]; }
};
global.game = { current: { options: [{}, {}, {}], answer: 0 } };
var ph = teenProfile(100);
ph.v2p34 = m.ensureV2P34(ph);
ph.v2p34.helpers.eliminate = 5;
var h1 = m.useHelper(ph, "eliminate");
eq(h1.ok, true, "helper 1 ok");
eq(h1.used, 1, "helper used 1/2");
var h2 = m.useHelper(ph, "eliminate");
eq(h2.ok, true, "helper 2 ok");
var h3 = m.useHelper(ph, "eliminate");
eq(h3.ok, false, "helper 3 blocked by limit 2");
eq(h3.reason, "limit", "helper limit reason");
global.document.getElementById = function (id) { return id === "v2-sim-overlay" ? {} : null; };
eq(m.useHelper(ph, "eliminate").ok, false, "helper banned when simulation overlay open");
eq(m.useHelper(ph, "eliminate").reason, "simulation", "simulation ban reason");
delete global.game;
delete global.document;

/* 11. Mastery cards + achievements, no duplicates */
var pm = teenProfile(100);
pm.skills = { "m8-mul": { level: 3, correct: 10, total: 12, window: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1] } };
var mastered = m.scanMastery(pm);
eq(mastered, ["m8-mul"], "mastery detected");
eq(pm.v2p34.cards.length, 1, "one knowledge card earned");
eq(pm.v2p34.achievements.indexOf("master-1") !== -1, true, "master-1 achievement");
eq(m.scanMastery(pm).length, 0, "no duplicate card on rescan");
m.recordSimComplete(pm, "v2sim-8|g8-math|m8-c1-1", "2026-10-24");
eq(pm.v2p34.achievements.indexOf("sim-1") !== -1, true, "sim-1 achievement");
m.recordSimComplete(pm, "v2sim-8|g8-math|m8-c1-1", "2026-10-24");
eq(pm.v2p34.achievements.filter(function (a) { return a === "sim-1"; }).length, 1, "sim achievement once per paper");

/* 12. Daily reset on a new day */
var pd = teenProfile(100);
m.recordRoundComplete(pd, 8, "8|g8-math|m8-c1", "2026-10-24", false);
m.claimDaily(pd, "rounds", "2026-10-24");
m.recordRoundComplete(pd, 8, "8|g8-math|m8-c1", "2026-10-25", false);
eq(pd.v2p34.quests.rounds.claimed, false, "daily quest resets on new day");
eq(pd.v2p34.quests.rounds.p, 1, "daily quest progress restarts");

console.log("ALL CHECKS PASSED (" + n + " checks)");
