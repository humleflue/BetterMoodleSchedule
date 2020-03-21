
chrome.runtime.sendMessage({ todo: `showPageAction` });

addCourseOptions(); // Adds option to hide all events of a course
hideSpecificEvent(); // User can hide specific event by doubleclicking
showAllEventsOfDay(); // User can show all hidden events of a day by clicking on the date or the day of the week
changeSpecificEventTime(); // User can change an events time by clicking on it
getFromChromeStorage(); // Retrieves all values from chrome storage and applies them
eventListenEventTime();

// Skifter danebrog ud med et coronaflag på siden FIXME: Fjernes efter corona :D
replaceDanebrog(); // FIXME: Fjernes efter corona :D
function replaceDanebrog() { // FIXME: Fjernes efter corona :D
  const divLanguages = document.getElementById(`languages`); // FIXME: Fjernes efter corona :D
  const imgElem = divLanguages.childNodes[1].childNodes[0]; // FIXME: Fjernes efter corona :D
  if (imgElem.src === `https://www.moodle.aau.dk/calmoodle/img/dk.png`) { // FIXME: Fjernes efter corona :D
    imgElem.src = `https://i.redd.it/cojuelrafcm41.jpg`; // FIXME: Fjernes efter corona :D
    imgElem.width = `36`; // FIXME: Fjernes efter corona :D
  } // FIXME: Fjernes efter corona :D
} // FIXME: Fjernes efter corona :D

/* ***************************** ADDCOURSEOPTIONS ****************************** */
function addCourseOptions() {
  const courseTable = document.getElementById(`kursustable`);
  const optionsBody = courseTable.getElementsByTagName(`tbody`)[0].rows;

  // Adds checkboxes to "kursustable"
  for (let i = 0; i < optionsBody.length; i++) {
    const courseName = optionsBody[i].getElementsByTagName(`td`)[1].innerText;

    // Create checkbox
    const checkbox = document.createElement(`input`);
    checkbox.type = `checkbox`;
    checkbox.classList.add(`BMS-checkbox`);
    optionsBody[i].getElementsByTagName(`td`)[0].appendChild(checkbox);
    checkbox.checked = true;
    // Waits for a change of state in each checkbox
    checkbox.addEventListener(`change`, (e) => {
      if (e.target.checked) {
        chrome.storage.sync.set({ [courseName]: true });
        showOrHideCourse(courseName, `visible`);
      }
      else {
        chrome.storage.sync.set({ [courseName]: false });
        showOrHideCourse(courseName, `hidden`);
      }
    });
  }
  // Adds instructions underneath table
  const para = document.createElement(`p`);
  const instructionsText = document.createTextNode(`Uncheck the check boxes above to hide entire course from schedule.\
                                                  Click the extension icon for more functionalities (found in the top right corner of the Chrome interface).`);
  para.appendChild(instructionsText);
  para.id = `BMS-instructions`;
  const instructions = courseTable.parentNode.insertBefore(para, courseTable.nextSibling);
  // Adds a button which resets chrome.storage underneath the instructions
  const btn = document.createElement(`button`);
  btn.innerHTML = `Restore original schedule`;
  const resetBtn = instructions.parentNode.insertBefore(btn, instructions.nextSibling);
  resetBtn.onclick = () => {
    chrome.storage.sync.clear();
    chrome.storage.local.clear();
    // Display a confirmation message
    const resetMsgP = document.createElement(`p`);
    const resetMsgText = document.createTextNode(`Your Moodle Schedule has been restored to original. Reload the page to see the effects.`);
    const resetMsgElem = resetMsgP.appendChild(resetMsgText);
    resetMsgP.id = `BMS-reset`;
    resetBtn.parentNode.insertBefore(resetMsgP, resetBtn.nextSibling);
    setTimeout(() => {
      resetMsgElem.remove();
    }, 5000);
  };
}
// Set courseName to either 'visible' or 'hidden'
function showOrHideCourse(courseName, visibility) {
  const allCourseEvents = document.getElementsByClassName(`event`);

  for (const event of allCourseEvents) {
    if (event.getElementsByTagName(`a`)[0].text === courseName) {
      event.style.visibility = visibility;
    }
  }
}

/* ****************************** HIDESPECIFICEVENT ****************************** */
function hideSpecificEvent() {
  const allCourseEvents = document.getElementsByClassName(`event`);
  for (const event of allCourseEvents) {
    event.addEventListener(`dblclick`, () => {
      event.style.visibility = `hidden`;
      setEventStateInChromeStorage(event, `hidden`);
    });
  }
}
function setEventStateInChromeStorage(event, state) {
  const identifier = `${getUniqueEventIdentifier(event)}_state`;
  chrome.storage.sync.set({ [identifier]: state });
}
function getUniqueEventIdentifier(event) {
  const index = getChildNodeIndex(event);
  const date = event.parentNode.childNodes[1].innerText;
  return `${date}: Event NO${index}`;
}
function getChildNodeIndex(child) {
  let i = 0;
  while ((child = child.previousSibling) != null) {
    i++;
  }
  return i;
}

/* ****************************** SHOWALLEVENTSOFDAY ****************************** */
function showAllEventsOfDay() {
  const allDays = document.getElementsByClassName(`day`);
  for (const day of allDays) {
    showAllEventsOfDayOnClick(day.childNodes[0]);
    showAllEventsOfDayOnClick(day.childNodes[1]);
  }
}
function showAllEventsOfDayOnClick(elem) {
  elem.addEventListener(`click`, () => {
    const events = elem.parentNode.childNodes;
    // Starts from 2 as the first two elements are day of week and date - rest of the elements will be events
    for (let i = 2; i < events.length; i++) {
      events[i].style.visibility = `visible`;
      setEventStateInChromeStorage(events[i], `visible`);
    }
  });
}

/* ****************************** CHANGESPECIFICEVENTTIME ****************************** */
function changeSpecificEventTime() {
  const allCourseEventsTime = document.getElementsByClassName(`time`);
  for (const time of allCourseEventsTime) {
    const identifier = `${getUniqueEventIdentifier(time.parentNode)}_time`;
    const originaltext = time.innerText;
    // Let's user change time of event on click
    time.addEventListener(`click`, () => {
      const regEx = /\w+:([0-9][0-9] - [0-9][0-9]:[0-9][0-9])/;
      const eventTime = regEx.exec(time.innerText)[0]; // Gets the time of the event to use in the prompt
      let done = false;
      let wantedTime = prompt(`Enter new time of event:`, eventTime);
      do {
        const correctSyntax = testTimeForSyntax(wantedTime);
        if (!correctSyntax) {
          wantedTime = prompt(`ERROR! WRONG SYNTAX!\nPlease try again maintaining the following syntax: "01:23 - 01:23"`, eventTime);
        }
        else {
          done = true;
        }
      } while (!done);
      if (wantedTime !== null) {
        time.innerText = `Time: ${wantedTime}`;
        chrome.storage.sync.set({ [identifier]: time.innerText });
      }
    });
    // Restores original value on right click
    time.addEventListener(`contextmenu`, (elem) => {
      elem.preventDefault();
      time.innerText = originaltext;
      chrome.storage.sync.set({ [identifier]: time.innerText });
    });
  }
}
// This function checks string for follwoing syntax: "01:23 - 01:23"
function testTimeForSyntax(str) {
  if (str === null) { // This means that the user pressed cancel on the prompt
    return true;
  }
  if (str.length !== 13) {
    return false;
  }

  const regEx = /([0-9][0-9]:[0-9][0-9] - [0-9][0-9]:[0-9][0-9])/;
  return regEx.test(str);
}

/* ****************************** EVENTLISTENEVENTTIME ****************************** */
/* Date format: 17/03/2020
 * Time format: 10:15
 */
function eventListenEventTime() {
  const allCourseEventsTime = document.getElementsByClassName(`time`);
  const curDate = new Date();
  for (const timeElem of allCourseEventsTime) {
    const eventStartTime = /\w+:([0-9][0-9])/.exec(timeElem.innerText)[0];
    const time = eventStartTime.split(`:`);
    const eventDate = timeElem.parentNode.parentNode.childNodes[1].innerText;
    const date = eventDate.split(`/`);
    const fullDate = new Date(date[2], --date[1], date[0], time[0], time[1]); // new Date(year, month, day, hour, and minute)
    const timeUntilEvent = fullDate.getTime() - curDate.getTime();
    const timeUntilNotif = timeUntilEvent - (15 * 60 * 1000); // Displays notification 15 minutes before lecture
    if (timeUntilNotif > 0 && timeUntilNotif < 2147483648) { // Makes sure the event haven't already been there and we don't get overflow in setTimeout()
      const courseName = timeElem.parentNode.getElementsByTagName(`a`)[0].text;
      chrome.runtime.sendMessage({
        todo: `eventListenEventTime`,
        timeUntilNotif: [timeUntilNotif],
        NotifOptions: {
          type: `basic`,
          iconUrl: `icon48.png`,
          title: `It's time for your lecture!`,
          message: `"${courseName}" starts at ${eventStartTime}. It's time to go.`,
        },
      });
    }
  }
}

/* ****************************** GETFROMCHROMESTORAGE ****************************** */
function getFromChromeStorage() {
  getCheckboxStateFromChromeStorage();
  getEventStatesFromChromeStorage();
  getEventTimesFromChromeStorage();
}

function getCheckboxStateFromChromeStorage() {
  const courseTable = document.getElementById(`kursustable`);
  const optionsBody = courseTable.getElementsByTagName(`tbody`)[0].rows;

  for (let i = 0; i < optionsBody.length; i++) {
    const courseName = optionsBody[i].getElementsByTagName(`td`)[1].innerText;
    const checkbox = optionsBody[i].getElementsByTagName(`td`)[0].childNodes[0];
    // Get stored state for checkbox
    chrome.storage.sync.get([courseName], (result) => {
      if (result[courseName] === true) {
        checkbox.checked = result[courseName];
        showOrHideCourse(courseName, `visible`);
      }
      else if (result[courseName] === false) {
        checkbox.checked = result[courseName];
        showOrHideCourse(courseName, `hidden`);
      }
    });
  }
}
function getEventStatesFromChromeStorage() {
  const allCourseEvents = document.getElementsByClassName(`event`);
  for (const event of allCourseEvents) {
    const identifier = `${getUniqueEventIdentifier(event)}_state`;
    chrome.storage.sync.get([identifier], (result) => {
      const state = result[identifier];
      if (state === `hidden`) {
        event.style.visibility = `hidden`;
      }
      else if (state === `visible`) {
        event.style.visibility = `visible`;
      }
    });
  }
}
function getEventTimesFromChromeStorage() {
  const allCourseEventsTime = document.getElementsByClassName(`time`);
  for (const time of allCourseEventsTime) {
    const identifier = `${getUniqueEventIdentifier(time.parentNode)}_time`;
    chrome.storage.sync.get([identifier], (result) => {
      if (result[identifier] !== undefined) {
        time.innerText = result[identifier];
      }
    });
  }
}
