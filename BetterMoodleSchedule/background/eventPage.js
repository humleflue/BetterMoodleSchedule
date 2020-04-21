/* eslint no-console: 0 */

// Makes the icon active only on the Moodle Schedule page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { // Extra params maybe to be used later:
  console.log(`New request`, request);
  switch (request.todo) {
    case `showPageAction`:
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.pageAction.show(tabs[0].id);
      });
      break;
    case `harmonicTheme`:
      if (request.useTheme) {
        chrome.tabs.executeScript({ file: `content/js/harmonicTheme.js` });
        chrome.tabs.insertCSS({ file: `content/css/harmonicTheme.css` }, sendResponse({ cssApplied: true }));
      }
      break;
    default:
      throw new Error(`SWITCH ERROR: "${request.todo}" is not defined`);
  }
});
