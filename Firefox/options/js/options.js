const restoreBtn = document.getElementById(`restore`);
const harmonicThemeCheckbox = document.getElementById(`harmonicThemeCheckbox`);

function updateStatus(text) {
  const status = document.getElementById(`status`);
  status.innerText = text;
}

/* Resets chrome.storage on click */
restoreBtn.onclick = () => {
  const choice = chrome.extension.getBackgroundPage().confirm( // Chrome alert()
    `WARNING: This action will remove all your customized options in your moodle schedule \n
     Are you sure you want to do this?`,
  );
  if (choice) {
    chrome.storage.sync.clear();
    chrome.storage.local.clear();
    restoreOptionsPage();
    updateStatus(`Schedule restored. Reload the Moodle Schedule to see the effects.`);
  }
};
// Restores options.html to original state
function restoreOptionsPage() {
  harmonicThemeCheckbox.checked = true;
  darkThemeCheckbox.checked = true;
}

// Get and set stored state for checkbox
chrome.storage.sync.get([`harmonicThemeCheckbox`], (result) => {
  if (result.harmonicThemeCheckbox === true) {
    harmonicThemeCheckbox.checked = true;
  }
  else if (result.harmonicThemeCheckbox === false) {
    harmonicThemeCheckbox.checked = false;
  }
});
// Enables/disables the Harmonic Theme. TODO: Enable emoji-indicator control
harmonicThemeCheckbox.addEventListener(`change`, (event) => {
  if (event.target.checked) {
    chrome.storage.sync.set({ harmonicThemeCheckbox: true });
    updateStatus(`Theme enabled! Reload the Moodle Schedule to see the effects.`);
  }
  else {
    chrome.storage.sync.set({ harmonicThemeCheckbox: false });
    updateStatus(`Theme disabled. Reload the Moodle Schedule to see the effects.`);
  }
});


// Get and set stored state for checkbox
chrome.storage.sync.get([`darkThemeCheckbox`], (result) => {
  if (result.darkThemeCheckbox === true) {
    darkThemeCheckbox.checked = true;
  }
  else if (result.darkThemeCheckbox === false) {
    darkThemeCheckbox.checked = false;
  }
});
// Enables/disables the Dark Theme. TODO: Enable emoji-indicator control
darkThemeCheckbox.addEventListener(`change`, (event) => {
  if (event.target.checked) {
    chrome.storage.sync.set({ darkThemeCheckbox: true });
    updateStatus(`Theme enabled! Reload the Moodle Schedule to see the effects.`);
  }
  else {
    chrome.storage.sync.set({ darkThemeCheckbox: false });
    updateStatus(`Theme disabled. Reload the Moodle Schedule to see the effects.`);
  }
});
