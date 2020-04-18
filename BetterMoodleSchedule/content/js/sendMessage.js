// Activates the extension icon
chrome.runtime.sendMessage({ todo: `showPageAction` });

// Get stored state for harmonicTheme
chrome.storage.sync.get([`harmonicThemeCheckbox`], (result) => {
  if (result.harmonicThemeCheckbox === true) {
    chrome.runtime.sendMessage({ todo: `harmonicTheme`, useTheme: true });
  }
});
