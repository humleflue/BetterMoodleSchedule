// Activates the extension icon
chrome.runtime.sendMessage({ todo: `showPageAction` });

// Get stored state for harmonicTheme
chrome.storage.sync.get([`harmonicThemeCheckbox`], (result) => {
  if (result.harmonicThemeCheckbox === true) {
    chrome.runtime.sendMessage({ todo: `harmonicTheme`, useTheme: true }, (res) => {
      if (res && res.cssApplied) {
        setTimeout(() => { // FIXME: Still not optimal, but it works for now...
          highlightDay(new Date(), `LightGray`);
        }, 100);
      }
    });
  }
});

chrome.storage.sync.get([`darkThemeCheckbox`], (result) => {
  if (result.darkThemeCheckbox === true) {
    chrome.runtime.sendMessage({ todo: `darkTheme`, useTheme: true }, (res) => {
      if (res && res.cssApplied) {
        setTimeout(() => { // FIXME: Still not optimal, but it works for now...
          highlightDay(new Date(), `#36393e`);
        }, 100);
      }
    });
  }
});
