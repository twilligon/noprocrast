import { DEFAULTS } from "./settings.js";

function lines(id) {
  return document
    .getElementById(id)
    .value.split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

const s = await chrome.storage.sync.get(DEFAULTS);
document.getElementById("blocked").value = s.blocked.join("\n");
document.getElementById("tabPatterns").value = s.tabPatterns.join("\n");
document.getElementById("destination").value = s.destination;

document.getElementById("save").addEventListener("click", () => {
  chrome.storage.sync.set({
    blocked: lines("blocked"),
    tabPatterns: lines("tabPatterns"),
    destination: document.getElementById("destination").value.trim(),
  });
});
