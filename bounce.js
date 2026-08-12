import { DEFAULTS } from "./settings.js";

const { destination, tabPatterns } = await chrome.storage.sync.get(DEFAULTS);
const tab = await chrome.tabs.getCurrent();

try {
  const target = (
    await chrome.tabs.query({ url: tabPatterns, windowType: "normal" })
  ).reduce((a, b) => (a.lastAccessed > b.lastAccessed ? a : b));

  if (target.windowId !== tab.windowId) {
    await chrome.tabs.move(target.id, {
      windowId: tab.windowId,
      index: tab.index + 1,
    });
  }
  await chrome.tabs.update(target.id, { active: true });
  await chrome.windows.update(tab.windowId, { focused: true });

  const { [tab.id]: fresh } = await chrome.storage.session.get(`${tab.id}`);
  if (fresh !== undefined) {
    chrome.tabs.remove(tab.id);
  } else {
    history.back();
  }
} catch {
  location.replace(destination);
}
