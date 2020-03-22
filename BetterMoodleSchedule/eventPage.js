// Makes the icon active only on the Moodle Schedule page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.todo === `showPageAction`) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.pageAction.show(tabs[0].id);
    });
  }
  else if (request.todo === `eventListenEventTime`) {
    setTimeout(() => {
      chrome.notifications.create(`timeForLecture`, request.NotifOptions);
    }, parseInt(request.timeUntilNotif));
  }
});
