// V2 UI shell simulation test — NOT loaded by the game.
// Checks only the pure logic exported by assets/data/v2-ui-shell.js
// (panel -> tab mapping, grade -> tabs, claimable/streak-at-risk),
// because the DOM part needs a real browser. Run: node tests/v2-ui-shell-simulation.js
"use strict";
var shell = require("../assets/data/v2-ui-shell.js");
var n = 0, failures = 0;
function eq(actual, expected, label) {
  n++;
  var a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { console.error("FAIL " + label + ": got " + a + ", want " + e); failures++; }
  else console.log("PASS " + label + " -> " + a);
}
eq(shell.panelTab("daily"), "quests", "daily -> quests");
eq(shell.panelTab("weekly"), "quests", "weekly -> quests");
eq(shell.panelTab("weakness"), "quests", "weakness -> quests");
eq(shell.panelTab("streak"), "quests", "streak -> quests");
eq(shell.panelTab("shop"), "shop", "shop -> shop");
eq(shell.panelTab("cards"), "shop", "cards -> shop");
eq(shell.panelTab("achievements"), "achievements", "achievements -> achievements");
eq(shell.panelTab("unknown"), null, "unknown panel -> null (no duplicate tab)");
eq(shell.tabsForGrade(8), ["home", "quests", "shop", "achievements", "profile"], "grade 8 has 5 tabs");
eq(shell.tabsForGrade(6), ["home", "quests", "shop", "achievements", "profile"], "grade 6 has 5 tabs");
eq(shell.tabsForGrade(5), ["home", "profile"], "grade 5 has only home + profile");
eq(shell.tabsForGrade(2), ["home", "profile"], "grade 2 has only home + profile");
eq(shell.isClaimable({ rounds: { p: 1, claimed: false } }), true, "claimable when round quest done");
eq(shell.isClaimable({ stars: { p: 7, claimed: false } }), false, "stars quest not claimable at 7/8");
eq(shell.isClaimable({ stars: { p: 8, claimed: false } }), true, "stars quest claimable at 8/8");
eq(shell.isClaimable({ rounds: { p: 1, claimed: true } }), false, "claimed quest is not claimable again");
eq(shell.isClaimable(null), false, "no quests -> not claimable");
eq(shell.streakAtRisk({ current: 5 }, { rounds: { p: 0 } }), true, "streak at risk when no round today");
eq(shell.streakAtRisk({ current: 5 }, { rounds: { p: 1 } }), false, "streak safe after a round today");
eq(shell.streakAtRisk({ current: 0 }, { rounds: { p: 0 } }), false, "no streak -> no warning");
console.log(failures === 0 ? "ALL CHECKS PASSED (" + n + " checks)" : failures + " FAILURES");
process.exit(failures === 0 ? 0 : 1);
