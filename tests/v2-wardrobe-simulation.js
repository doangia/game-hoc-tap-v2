/* Node simulation for v2 Wardrobe + gift boxes (25/10).
   Runs against the real module code (assets/data/v2-wardrobe.js),
   not a re-implementation. Not loaded by the game.
   NOTE: since the final visual step, dollHTML renders an inline
   SVG doll (layered, back to front); the old emoji-column doll
   is gone. Section 11-12 cover the SVG layers. */
"use strict";
var m = require("../assets/data/v2-wardrobe.js");
var n = 0;
function eq(actual, expected, label) {
  n++;
  var a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { console.error("FAIL " + label + ": got " + a + ", want " + e); process.exit(1); }
  console.log("PASS " + label + " -> " + a);
}
function teenProfile(coins, xp) {
  return { name: "Test", grade: 8, lop: "8A", totalStars: 10, best: { "8|g8-math|m8-c1": 7 },
    xp: xp == null ? 450 : xp, coins: coins == null ? 100 : coins, character: "human", gender: "female",
    skinTone: "medium", pet: null, tone: "teen", subjectXp: {}, topicPlays: {}, v2migrated: true, skills: {} };
}
function masteredSkill() { return { level: 3, correct: 10, total: 12, window: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1] }; }

/* 1. Migration of an old animal profile: pet kept, gender NOT assigned */
var old = { name: "Cu", grade: 8, totalStars: 37, best: {}, xp: 370, coins: 37, character: "cat", tone: "teen", v2migrated: true };
var mig = m.migrateHuman(old);
eq(mig.needsGate, true, "old profile without gender needs gate");
eq(old.pet, "cat", "old cat character becomes pet");
eq(old.v2wardrobe.owned.indexOf("pet-cat") !== -1, true, "migrated pet owned");
eq(old.v2wardrobe.equipped.pet, "pet-cat", "migrated pet equipped");
eq(old.gender, undefined, "gender never auto-assigned");
eq(old.totalStars, 37, "migration keeps totalStars");
eq(old.coins, 37, "migration keeps coins");
eq(old.skinTone, "medium", "old profile gets neutral medium tone default");
/* Old shop skin dragon -> dragon pet */
var old2 = { name: "Rong", grade: 8, totalStars: 5, best: {}, xp: 50, coins: 5, character: "dragon", tone: "teen", v2migrated: true };
m.migrateHuman(old2);
eq(old2.pet, "dragon", "old dragon skin becomes pet");
eq(old2.v2wardrobe.owned.indexOf("pet-dragon") !== -1, true, "migrated dragon pet owned");
/* Already-gendered profile: no gate, pet migration still applies */
var g = teenProfile(100); g.character = "owl"; g.gender = "male";
eq(m.migrateHuman(g).needsGate, false, "gendered profile needs no gate");
eq(g.pet, "owl", "gendered old owl still becomes pet");

/* 2. Gender change unequips gender-mismatched items but keeps ownership */
var pg = teenProfile(500);
m.ensureWardrobe(pg);
pg.v2wardrobe.owned.push("dress-short", "pants-long");
pg.v2wardrobe.equipped.bottom = "dress-short";
eq(m.setGender(pg, "male"), true, "set gender male ok");
eq(pg.v2wardrobe.equipped.bottom, undefined, "dress unequipped after switching to male");
eq(pg.v2wardrobe.owned.indexOf("dress-short") !== -1, true, "dress ownership kept after gender switch");
eq(m.setGender(pg, "other"), false, "invalid gender rejected");
eq(m.setSkinTone(pg, "dark"), true, "skin tone change ok");
eq(pg.skinTone, "dark", "skin tone stored");
eq(m.setSkinTone(pg, "blue"), false, "invalid tone rejected");

/* 3. Try-on spends nothing and does not change equipped */
var pt = teenProfile(100);
eq(m.tryOnItem(pt, "shirt-formal").ok, true, "try-on ok");
eq(pt.coins, 100, "try-on spends no coins");
eq(pt.v2wardrobe.equipped.shirt, undefined, "try-on does not change equipped");
eq(m.effectiveEquipped(pt).shirt, "shirt-formal", "preview shows tried item");
eq(m.tryOnItem(pt, "shirt-tee").ok, true, "try-on replaces same slot only");
eq(m.effectiveEquipped(pt).shirt, "shirt-tee", "preview updates to new try-on");
eq(m.wearItem(pt, "shirt-tee").ok, false, "cannot wear unowned item");
eq(m.buyItem(pt, "shirt-tee").ok, true, "buy shirt ok");
eq(pt.coins, 80, "buy deducts 20");
eq(pt.v2wardrobe.equipped.shirt, "shirt-tee", "buy equips item");
eq(m.buyItem(pt, "shirt-tee").ok, false, "cannot buy twice");
eq(m.buyItem(pt, "coat-wind").ok, true, "buy rare coat ok at level 4");
var pl = teenProfile(100, 0);
eq(m.buyItem(pl, "coat-wind").ok, false, "level-locked buy blocked at level 1");
eq(pl.coins, 100, "locked buy spends nothing");
eq(m.tryOnItem(pl, "coat-wind").ok, true, "locked item can still be tried on");
eq(m.buyItem(pl, "shirt-tee").ok, true, "level 1 item buy ok");
pl.coins = 10;
eq(m.buyItem(pl, "shirt-formal").ok, false, "insufficient coins blocked");
eq(pl.coins, 10, "failed buy spends nothing");

/* 4. Colour variants are free choices, not purchases */
var pv = teenProfile(100);
eq(m.setVariant(pv, "shirt-tee", "Đỏ"), true, "variant set ok");
eq(m.variantOf(pv, "shirt-tee"), "Đỏ", "variant stored");
eq(pv.coins, 100, "variant change spends nothing");

/* 5. Newcomer pack: needs 3 first-try stars, fixed contents, claim once */
var pn = teenProfile(100); pn.totalStars = 2;
eq(m.newcomerAvailable(pn), false, "newcomer not available at 2 stars");
pn.totalStars = 3;
eq(m.newcomerAvailable(pn), true, "newcomer available at 3 stars");
var nc = m.claimNewcomer(pn);
eq(nc.ok, true, "newcomer claim ok");
eq(nc.items, ["nw-shirt", "nw-hat", "nw-bg"], "newcomer contents fixed");
eq(nc.coins, 20, "newcomer coins 20");
eq(pn.coins, 120, "newcomer coins added");
eq(pn.v2wardrobe.equipped.shirt, "nw-shirt", "newcomer shirt equipped");
eq(m.claimNewcomer(pn).ok, false, "newcomer cannot claim twice");
eq(m.newcomerAvailable(pn), false, "newcomer unavailable after claim");

/* 6. Milestone boxes: fixed contents, level-gated, claim once each */
var pb = teenProfile(500, 0); /* level 1 */
eq(m.boxAvailable(pb, m.BOXES[0]), false, "bronze box locked at level 1");
eq(m.claimBox(pb, 5).ok, false, "bronze box claim blocked below level");
pb.xp = 700; /* level 5 */
eq(m.levelOf(pb), 5, "level 5 at 700 XP");
eq(m.boxAvailable(pb, m.BOXES[0]), true, "bronze box available at level 5");
var b1 = m.claimBox(pb, 5);
eq(b1.ok, true, "bronze claim ok");
eq(b1.items, ["box5-shirt", "box5-hat"], "bronze contents fixed");
eq(b1.coins, 30, "bronze coins 30");
eq(m.claimBox(pb, 5).ok, false, "bronze cannot claim twice");
eq(m.boxAvailable(pb, m.BOXES[1]), false, "silver locked at level 5");
pb.xp = 2700; /* level 10: already passed bronze+silver at migration */
eq(m.boxAvailable(pb, m.BOXES[0]), false, "bronze already claimed stays claimed");
eq(m.boxAvailable(pb, m.BOXES[1]), true, "silver available for player already past level 10");
eq(m.claimBox(pb, 10).items, ["box10-coat", "box10-shoes"], "silver contents fixed");
/* Gold box resolves the gender-matched signature item */
var pgold = teenProfile(500, 1750); /* level 8? no: 1750 = level 8; use 2200 = level 9, 2700 = level 10... level 15 needs 2700+5*600=5700 */
pgold.xp = 5700;
eq(m.levelOf(pgold), 15, "level 15 at 5700 XP");
var goldF = m.claimBox(pgold, 15);
eq(goldF.items, ["box15-dress", "box15-glasses"], "gold box gives female dress for female player");
var pgoldM = teenProfile(500, 5700); pgoldM.gender = "male";
var goldM = m.claimBox(pgoldM, 15);
eq(goldM.items, ["box15-suit", "box15-glasses"], "gold box gives male suit for male player");
/* Box contents are identical on repeat reads (no randomness) */
eq(JSON.stringify(m.boxContents(m.BOXES[2], "female").map(function (i) { return i.id; })), JSON.stringify(["box15-dress", "box15-glasses"]), "box contents stable across reads");

/* 7. Hard-quest gifts: availability + claim once, never sold */
var ph = teenProfile(100);
ph.v2p34 = { streak: { current: 7, best: 7 } };
eq(m.giftAvailable(ph, "gift-streak7"), true, "streak-7 gift available");
eq(m.claimGift(ph, "gift-streak7").ok, true, "streak gift claim ok");
eq(ph.v2wardrobe.owned.indexOf("gift-crown") !== -1, true, "gift crown owned");
eq(m.claimGift(ph, "gift-streak7").ok, false, "gift cannot claim twice");
eq(m.buyItem(ph, "gift-crown").ok, false, "gift item is not for sale");
ph.v2wardrobe.firstTryBest = 20;
eq(m.giftAvailable(ph, "gift-streak20"), true, "20-streak gift available");
ph.v2wardrobe.simPerfect = true;
eq(m.giftAvailable(ph, "gift-simperfect"), true, "perfect-sim gift available");
var pm = teenProfile(100);
["m8-mono", "m8-addsub", "m8-mul", "m8-div", "m8-value", "m8-simplify", "m8-word", "m8-steps", "m8-error", "m8-inverse"].forEach(function (s) { pm.skills[s] = masteredSkill(); });
eq(m.giftAvailable(pm, "gift-topic-m8"), true, "topic-mastery gift available when all 10 math skills mastered");
var pm2 = teenProfile(100);
pm2.skills["m8-mono"] = masteredSkill();
eq(m.giftAvailable(pm2, "gift-topic-m8"), false, "topic gift blocked when only 1 skill mastered");
/* First-try streak counting */
var ps = teenProfile(100);
m.recordAnswer(ps, true); m.recordAnswer(ps, true); m.recordAnswer(ps, false);
eq(ps.v2wardrobe.firstTryStreak, 0, "wrong answer resets first-try streak");
eq(ps.v2wardrobe.firstTryBest, 2, "best streak remembered");
for (var si = 0; si < 20; si++) m.recordAnswer(ps, true);
eq(m.giftAvailable(ps, "gift-streak20"), true, "20 correct in a row unlocks wings gift");

/* 8. Sets: wear when owned, buy-all only when affordable and unlocked */
var pst = teenProfile(1000);
var setBuy = m.buySet(pst, "set-school");
eq(setBuy.ok, true, "buy set-school ok");
eq(setBuy.coins, 30 + 30 + 20 + 20, "set price is sum of unowned items");
eq(pst.v2wardrobe.equipped.shirt, "shirt-formal", "set equips shirt");
eq(pst.v2wardrobe.equipped.bottom, "pants-long", "set equips pants");
var pst2 = teenProfile(10);
eq(m.buySet(pst2, "set-school").ok, false, "set buy blocked without coins");
eq(m.wearSet(pst2, "set-school").ok, false, "set wear blocked when not owned");

/* 9. Saved outfits: at least 3, one-tap apply, rename, delete */
var po = teenProfile(1000);
m.buyItem(po, "shirt-tee"); m.buyItem(po, "pants-long"); m.buyItem(po, "shoes-sport");
eq(m.saveOutfit(po, "Đi học").ok, true, "outfit 1 saved");
m.buyItem(po, "shirt-sport"); m.buyItem(po, "pants-short");
eq(m.saveOutfit(po, "Thể thao").ok, true, "outfit 2 saved");
m.buyItem(po, "shirt-formal");
eq(m.saveOutfit(po, "Lịch sự").ok, true, "outfit 3 saved");
eq(po.v2wardrobe.outfits.length, 3, "3 outfits saved");
eq(m.applyOutfit(po, 0).applied >= 3, true, "apply outfit equips saved slots in one call");
eq(po.v2wardrobe.equipped.shirt, "shirt-tee", "apply restores first outfit shirt");
eq(m.renameOutfit(po, 0, "Đi học mới"), true, "rename ok");
eq(po.v2wardrobe.outfits[0].name, "Đi học mới", "rename stored");
eq(m.deleteOutfit(po, 0), true, "delete ok");
eq(po.v2wardrobe.outfits.length, 2, "outfit deleted");
/* Apply skips items no longer owned */
po.v2wardrobe.outfits.push({ name: "Cũ", equipped: { shirt: "coat-lab", bottom: "pants-long" } });
m.applyOutfit(po, 2);
eq(po.v2wardrobe.equipped.bottom, "pants-long", "apply keeps owned slot from snapshot");
eq(po.v2wardrobe.equipped.shirt, "shirt-tee", "apply skips unowned snapshot item");

/* 10. Kids catalogue is smaller than teen catalogue */
var kidItems = m.visibleItems({ grade: 2, gender: "female" }, false);
var teenItems = m.visibleItems({ grade: 8, gender: "female" }, true);
eq(kidItems.length < teenItems.length, true, "kids see fewer items than teens");
eq(kidItems.every(function (it) { return it.kids; }), true, "kids items are all kids-flagged");
eq(m.categoryItems({ grade: 8, gender: "female" }, true, "dress", "").every(function (it) { return it.kind === "dress"; }), true, "dress category only dresses");
eq(m.categoryItems({ grade: 8, gender: "female" }, true, "pants", "").every(function (it) { return it.kind !== "dress"; }), true, "pants category excludes dresses");

/* 11. Doll preview (SVG): layer independence, dress covers shirt */
var pd = teenProfile(1000);
m.buyItem(pd, "hat-cap"); m.buyItem(pd, "shirt-tee"); m.buyItem(pd, "pants-long"); m.buyItem(pd, "shoes-sport");
var html1 = m.dollHTML(pd, false);
eq(html1.indexOf("<svg") !== -1, true, "doll renders inline SVG");
eq(html1.indexOf('data-layer="hat"') !== -1 && html1.indexOf('data-layer="shirt"') !== -1 && html1.indexOf('data-layer="bottom"') !== -1 && html1.indexOf('data-layer="shoes"') !== -1, true, "doll shows all worn layers as SVG");
eq(html1.indexOf("🧢") === -1 && html1.indexOf("👕") === -1 && html1.indexOf("👖") === -1 && html1.indexOf("👟") === -1, true, "doll no longer uses emoji clothing");
m.unequipSlot(pd, "shirt");
var html2 = m.dollHTML(pd, false);
eq(html2.indexOf('data-layer="shirt"') === -1, true, "removing shirt removes only the shirt layer");
eq(html2.indexOf('data-layer="hat"') !== -1 && html2.indexOf('data-layer="bottom"') !== -1, true, "other layers survive a slot change");
/* Dress covers the shirt layer */
var pdr = teenProfile(1000);
m.ensureWardrobe(pdr);
pdr.v2wardrobe.owned.push("dress-short");
m.wearItem(pdr, "dress-short");
pdr.v2wardrobe.owned.push("shirt-tee");
m.wearItem(pdr, "shirt-tee");
var html3 = m.dollHTML(pdr, false);
eq(html3.indexOf('data-layer="dress"') !== -1, true, "dress shown in preview");
eq(html3.indexOf('data-layer="shirt"') === -1, true, "dress covers the shirt layer in preview");
eq(m.faceEmoji({ gender: "female", skinTone: "dark" }), "👧🏿", "female dark face emoji");
eq(m.faceEmoji({ gender: "male", skinTone: "light" }), "👦🏻", "male light face emoji");

/* 12. SVG layer order, skin tones, distinct silhouettes */
var pf = teenProfile(1000);
m.buyItem(pf, "hair-f-long"); m.buyItem(pf, "face-round"); m.buyItem(pf, "shirt-tee"); m.buyItem(pf, "coat-wind");
m.buyItem(pf, "pants-long"); m.buyItem(pf, "shoes-sport"); m.buyItem(pf, "hat-cap"); m.buyItem(pf, "acc-backpack");
m.buyItem(pf, "bg-classroom"); m.buyItem(pf, "pet-cat");
eq(m.dollLayers(pf), ["background", "pet", "back-hair", "body", "shoes", "bottom", "shirt", "coat", "front-hair", "hat", "glasses", "accessory", "foreground"], "layer order is background, pet, back-hair, body, shoes, bottom, shirt, coat, front-hair, hat, glasses, accessory, foreground");
var htmlF = m.dollHTML(pf, false);
var order = ["background", "pet", "back-hair", "body", "shoes", "bottom", "shirt", "coat", "front-hair", "hat", "glasses", "accessory", "foreground"];
var positions = order.map(function (l) { return htmlF.indexOf('data-layer="' + l + '"'); });
var ordered = positions.every(function (p, i) { return p !== -1 && (i === 0 || p > positions[i - 1]); });
eq(ordered, true, "SVG groups appear in strict back-to-front order in the markup");
var pDark = teenProfile(1000); pDark.skinTone = "dark";
var pLight = teenProfile(1000); pLight.skinTone = "light";
eq(m.dollHTML(pDark, false).indexOf("#8d5524") !== -1, true, "dark skin tone applied in SVG");
eq(m.dollHTML(pLight, false).indexOf("#ffdfc4") !== -1, true, "light skin tone applied in SVG");
eq(m.dollHTML(pDark, false) !== m.dollHTML(pLight, false), true, "skin tone changes the doll");
var pHair1 = teenProfile(1000); pHair1.gender = "male"; m.buyItem(pHair1, "hair-m-short");
var pHair2 = teenProfile(1000); pHair2.gender = "male"; m.buyItem(pHair2, "hair-m-spike");
eq(m.dollHTML(pHair1, false) !== m.dollHTML(pHair2, false), true, "two boy hair styles draw differently");
var pBg1 = teenProfile(1000); m.buyItem(pBg1, "bg-classroom");
var pBg2 = teenProfile(1000); m.buyItem(pBg2, "bg-beach");
eq(m.dollHTML(pBg1, false) !== m.dollHTML(pBg2, false), true, "classroom and beach backgrounds draw differently");
eq(m.itemThumbSVG(pf, m.ITEMS["shirt-tee"]).indexOf("<svg") !== -1, true, "shirt tile is SVG");
eq(m.itemThumbSVG(pf, m.ITEMS["shirt-tee"]) !== m.itemThumbSVG(pf, m.ITEMS["shirt-formal"]), true, "tee and formal shirt thumbnails differ in silhouette");
eq(m.itemThumbSVG(pf, m.ITEMS["pet-cat"]).indexOf("<svg") !== -1, true, "pet tile is SVG");
eq(m.dollHTML(pf, false).indexOf('data-layer="pet"') !== -1, true, "pet drawn beside the doll");

/* 13. Every catalogue item renders an SVG thumbnail without error */
var pAll = teenProfile(1000);
var thumbOk = true, thumbCount = 0;
Object.keys(m.ITEMS).forEach(function (id) {
  var t = m.itemThumbSVG(pAll, m.ITEMS[id]);
  thumbCount++;
  if (t.indexOf("<svg") === -1 || t.indexOf("</svg>") === -1) thumbOk = false;
});
eq(thumbOk, true, "all catalogue items render an SVG thumbnail");
eq(thumbCount > 70, true, "catalogue has more than 70 items rendered");
var pMaleFull = teenProfile(1000); pMaleFull.gender = "male";
m.buyItem(pMaleFull, "hair-m-short"); m.buyItem(pMaleFull, "shirt-formal"); m.buyItem(pMaleFull, "pants-jean"); m.buyItem(pMaleFull, "shoes-boot"); m.buyItem(pMaleFull, "hat-cap");
eq(m.dollHTML(pMaleFull, true).indexOf("<svg") !== -1, true, "male full outfit renders big SVG preview");
var pFemFull = teenProfile(1000); pFemFull.gender = "female";
m.buyItem(pFemFull, "hair-f-long"); m.buyItem(pFemFull, "dress-long"); m.buyItem(pFemFull, "shoes-doll"); m.buyItem(pFemFull, "hat-wide");
eq(m.dollHTML(pFemFull, true).indexOf('data-layer="dress"') !== -1, true, "female full dress renders big SVG preview");

console.log("ALL CHECKS PASSED (" + n + " checks)");
