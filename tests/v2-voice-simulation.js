// v2 voice engine simulation — NOT loaded by the game (Node only).
// Proves, using the REAL functions extracted from index.html (not a rewrite):
//  1. findEnVoice picks en-US before en-GB, never picks a vi voice when no en exists.
//  2. findViVoice picks HoaiMy before NamMinh before a generic vi voice.
//  3. Language-strict policy: with only en voices, viVoiceForDevice() is null
//     and findFallbackVoice("vi") is null (no cross-language fallback);
//     findFallbackVoice("en") still returns the en voice for en text.
//  4. speakViDevice source never calls findFallbackVoice and fails with
//     "no-vi-voice" instead of playing an English voice for Vietnamese text.
//  5. waitForEnVoice returns null after a short timeout when the voice list
//     stays empty (the caller then shows the warning + reveals the text,
//     it never plays with a Vietnamese default voice).
//  6. voiceFallbackChain order for every route, on Edge and non-Edge.
//  7. splitPromptViEn: quoted English words split from Vietnamese instructions.
//  8. edgeSplitSentences splits long text into <=220-char chunks.
//  9. voiceRouteMode accepts auto/device/prerecorded/edge, old "packaged" -> auto.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf-8");

function extractFn(src, sig) {
  const i = src.indexOf(sig);
  if (i < 0) throw new Error("function not found: " + sig);
  const j = src.indexOf("{", i);
  let depth = 0;
  for (let k = j; k < src.length; k++) {
    if (src[k] === "{") depth++;
    else if (src[k] === "}") { depth--; if (depth === 0) return src.slice(i, k + 1); }
  }
  throw new Error("no close brace for " + sig);
}

const FNS = [
  "function refreshVoices", // placeholder replaced below (stub, not extracted)
];
const wanted = [
  "function findFallbackVoice(",
  "function findViVoice(",
  "function findViVoiceByName(",
  "function viVoiceForDevice(",
  "function findEnVoice(",
  "function waitForEnVoice(",
  "function isEdgeBrowser(",
  "function voiceFallbackChain(",
  "function splitPromptViEn(",
  "function edgeSplitSentences(",
  "function voiceRouteMode(",
  "function speakViDevice(",
];
const sources = wanted.map((sig) => {
  if (sig === "function refreshVoices") return "";
  return extractFn(html, sig);
});

const sandbox = {
  console,
  setTimeout, clearTimeout, Date, Math, JSON,
  navigator: { userAgent: "Mozilla/5.0 Chrome/120.0" },
  window: { speechSynthesis: {} },
  audioSettings: { voiceRoute: "auto", viVoiceName: "" },
  mockVoices: [],
};
sandbox.refreshVoices = function () { return sandbox.mockVoices; };
sandbox.window = { speechSynthesis: {} };
vm.createContext(sandbox);
vm.runInContext(sources.join("\n"), sandbox);

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("PASS: " + name); }
  else { failed++; console.log("FAIL: " + name); }
}
function voice(name, lang, extra) {
  return Object.assign({ name, lang, localService: true, default: false }, extra || {});
}

// 1. findEnVoice: en-US before en-GB, never vi.
sandbox.mockVoices = [
  voice("Google UK English", "en-GB"),
  voice("Microsoft Zira", "en-US", { default: true }),
  voice("Google US English", "en-US", { localService: false }),
  voice("Microsoft HoaiMy", "vi-VN", { localService: false }),
];
check("findEnVoice picks en-US (Google US) over en-GB", sandbox.findEnVoice().name === "Google US English");
sandbox.mockVoices = [voice("Microsoft HoaiMy", "vi-VN"), voice("Google Tiếng Việt", "vi-VN")];
check("findEnVoice returns null when only vi voices exist (no vi fallback for en)", sandbox.findEnVoice() === null);
sandbox.mockVoices = [voice("English Voice", "en_US")];
check("findEnVoice normalizes en_US", sandbox.findEnVoice() !== null && sandbox.findEnVoice().name === "English Voice");

// 2. findViVoice: HoaiMy first, then NamMinh, then generic vi.
sandbox.mockVoices = [
  voice("Google Tiếng Việt", "vi-VN", { localService: false }),
  voice("Microsoft NamMinh", "vi-VN", { localService: false }),
  voice("Microsoft HoaiMy", "vi-VN", { localService: false }),
];
check("findViVoice picks HoaiMy before NamMinh and generic vi", sandbox.findViVoice().name === "Microsoft HoaiMy");
sandbox.mockVoices = [voice("Microsoft NamMinh", "vi-VN"), voice("Google Tiếng Việt", "vi-VN")];
check("findViVoice picks NamMinh when HoaiMy absent", sandbox.findViVoice().name === "Microsoft NamMinh");

// 3. Language-strict policy.
sandbox.mockVoices = [voice("Google US English", "en-US"), voice("Microsoft Zira", "en-US")];
sandbox.audioSettings.viVoiceName = "";
check("viVoiceForDevice is null when only en voices exist (no en voice for vi text)", sandbox.viVoiceForDevice() === null);
check("findFallbackVoice('vi') is null when only en voices exist", sandbox.findFallbackVoice("vi") === null);
check("findFallbackVoice('en') returns an en voice for en text", sandbox.findFallbackVoice("en") !== null);
check("findFallbackVoice() with no language returns null (safe default)", sandbox.findFallbackVoice() === null);
sandbox.mockVoices = [voice("Microsoft HoaiMy", "vi-VN")];
sandbox.audioSettings.viVoiceName = "Microsoft HoaiMy";
check("viVoiceForDevice honours the player-picked vi voice", sandbox.viVoiceForDevice().name === "Microsoft HoaiMy");
sandbox.audioSettings.viVoiceName = "Google US English";
sandbox.mockVoices = [voice("Google US English", "en-US"), voice("Microsoft HoaiMy", "vi-VN")];
check("viVoiceForDevice rejects a picked non-vi voice for vi text", sandbox.viVoiceForDevice() === null);
sandbox.audioSettings.viVoiceName = "";

// 4. speakViDevice source: strict policy in code.
const speakViSrc = extractFn(html, "function speakViDevice(");
check("speakViDevice never calls findFallbackVoice", speakViSrc.indexOf("findFallbackVoice") === -1);
check("speakViDevice fails with no-vi-voice when no vi voice", speakViSrc.indexOf("no-vi-voice") !== -1);
check("speakViDevice assigns only the selected vi voice (u.voice = v)", speakViSrc.indexOf("u.voice = v") !== -1);
const onDemandSrc = extractFn(html, "function speakViOnDemand(");
check("speakViOnDemand has no hard block that skips the warning path", onDemandSrc.indexOf("findFallbackVoice") === -1);

// 6. voiceFallbackChain order.
sandbox.navigator.userAgent = "Mozilla/5.0 Chrome/120.0";
check("auto on non-Edge tries device only (Edge skipped, no slow wait)", JSON.stringify(sandbox.voiceFallbackChain("auto")) === JSON.stringify(["device"]));
sandbox.navigator.userAgent = "Mozilla/5.0 Edg/120.0";
check("auto on Edge tries edge then device", JSON.stringify(sandbox.voiceFallbackChain("auto")) === JSON.stringify(["edge", "device"]));
check("explicit edge tries edge then device", JSON.stringify(sandbox.voiceFallbackChain("edge")) === JSON.stringify(["edge", "device"]));
check("device tries device only", JSON.stringify(sandbox.voiceFallbackChain("device")) === JSON.stringify(["device"]));
check("prerecorded tries device for dynamic text (fixed lines already used MP3)", JSON.stringify(sandbox.voiceFallbackChain("prerecorded")) === JSON.stringify(["device"]));

// 7. splitPromptViEn.
let segs = sandbox.splitPromptViEn("Từ 'sail' nghĩa là gì?");
check("splitPromptViEn splits quoted en word from vi instruction",
  segs.length === 3 && segs[0].lang === "vi" && segs[1].lang === "en" && segs[1].text === "sail" && segs[2].lang === "vi");
segs = sandbox.splitPromptViEn("Chọn đáp án đúng");
check("splitPromptViEn without quotes and with diacritics is all vi", segs.length === 1 && segs[0].lang === "vi");
segs = sandbox.splitPromptViEn("Choose the correct answer");
check("splitPromptViEn without quotes and without diacritics is all en", segs.length === 1 && segs[0].lang === "en");
segs = sandbox.splitPromptViEn("What does “apple” mean?");
check("splitPromptViEn handles curly quotes", segs.some((s) => s.lang === "en" && s.text === "apple"));

// 8. edgeSplitSentences.
const longText = "Câu hỏi đầu tiên rất dài. " + "Đây là một câu dài khác ".repeat(12) + "và câu cuối.";
const chunks = sandbox.edgeSplitSentences(longText);
check("edgeSplitSentences splits into chunks of at most 220 chars", chunks.every((c) => c.length <= 220) && chunks.length > 1);

// 9. voiceRouteMode.
sandbox.audioSettings.voiceRoute = "edge";
check("voiceRouteMode accepts edge", sandbox.voiceRouteMode() === "edge");
sandbox.audioSettings.voiceRoute = "prerecorded";
check("voiceRouteMode accepts prerecorded", sandbox.voiceRouteMode() === "prerecorded");
sandbox.audioSettings.voiceRoute = "packaged";
check("voiceRouteMode maps old packaged to auto", sandbox.voiceRouteMode() === "auto");

// 5. waitForEnVoice with an empty list -> null (caller warns + reveals text).
sandbox.mockVoices = [];
sandbox.waitForEnVoice(300, function (v) {
  check("waitForEnVoice returns null after timeout when voice list stays empty", v === null);
  // Voice appearing mid-wait is picked up.
  sandbox.mockVoices = [];
  let flips = 0;
  const origRefresh = sandbox.refreshVoices;
  sandbox.refreshVoices = function () { flips++; return flips >= 2 ? [voice("Google US English", "en-US")] : []; };
  sandbox.waitForEnVoice(2000, function (v2) {
    check("waitForEnVoice picks up a voice that appears during the wait", v2 !== null && v2.name === "Google US English");
    sandbox.refreshVoices = origRefresh;
    console.log("\n" + passed + " passed, " + failed + " failed");
    process.exit(failed ? 1 : 0);
  });
});
