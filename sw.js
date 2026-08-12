import { DEFAULTS } from "./settings.js";

async function syncRules() {
  const { blocked } = await chrome.storage.sync.get(DEFAULTS);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: (
      await chrome.declarativeNetRequest.getDynamicRules()
    ).map((r) => r.id),
    addRules: blocked.map((urlFilter, i) => ({
      id: i + 1,
      action: { type: "redirect", redirect: { extensionPath: "/bounce.html" } },
      condition: { urlFilter, resourceTypes: ["main_frame"] },
    })),
  });
}

chrome.runtime.onInstalled.addListener(() => {
  syncRules();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.blocked) {
    syncRules();
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  const url = tab.pendingUrl ?? tab.url;
  if (!(url.startsWith("http://") || url.startsWith("https://"))) {
    chrome.storage.session.set({ [tab.id]: true });
  }
});

chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (
    info.url &&
    (info.url.startsWith("http://") || info.url.startsWith("https://"))
  ) {
    chrome.storage.session.remove(`${tabId}`);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`${tabId}`);
});
