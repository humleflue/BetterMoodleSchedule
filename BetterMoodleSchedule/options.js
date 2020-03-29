const status = document.getElementById(`status`);

// Resets chrome.storage on click
const restoreBtn = document.getElementById(`restore`);
restoreBtn.onclick = () => {
  const choice = chrome.extension.getBackgroundPage().confirm( // Chrome alert()
    `WARNING: This action will remove all your customized options in your moodle schedule \n
     Are you sure you want to do this?`,
  );
  if (choice) {
    chrome.storage.sync.clear();
    chrome.storage.local.clear();
    status.innerText = `Schedule restored successfully. Please reload the Moodle Schedule to see the effects.`;
  }
};
