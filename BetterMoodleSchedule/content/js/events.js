hideSpecificEvent(); // User can hide specific event by doubleclicking
showAllEventsOfDay(); // User can show all hidden events of a day by clicking on the date or the day of the week
changeSpecificEventTime(); // User can change an events time by clicking on it
getEventStatesFromChromeStorage();
getEventTimesFromChromeStorage();

/* ****************************** HIDESPECIFICEVENT ****************************** */
function hideSpecificEvent() {
  const allCourseEvents = document.getElementsByClassName(`event`);
  for (const event of allCourseEvents) {
    event.title = `Double click to hide from schedule`;
    event.addEventListener(`dblclick`, () => {
      event.style.visibility = `hidden`;
      setEventStateInChromeStorage(event, `hidden`);
    });
  }
}
function setEventStateInChromeStorage(event, state) {
  const identifier = `${getUniqueEventIdentifier(event)}_state`; // Er i "helperFunctions.js"
  chrome.storage.sync.set({ [identifier]: state });
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
  elem.title = `Click here to show all events for this day`; /* eslint-disable-line no-param-reassign */
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
    const identifier = `${getUniqueEventIdentifier(time.parentNode)}_time`; // Er i "helperFunctions.js"
    const originaltext = time.innerText;
    time.title = `Click to change time - Right click to revert`;
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

function getEventStatesFromChromeStorage() {
  const allCourseEvents = document.getElementsByClassName(`event`);

  for (const event of allCourseEvents) {
    const identifier = `${getUniqueEventIdentifier(event)}_state`; // Er i "helperFunctions.js"
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
    const identifier = `${getUniqueEventIdentifier(time.parentNode)}_time`; // Er i "helperFunctions.js"
    chrome.storage.sync.get([identifier], (result) => {
      if (result[identifier] !== undefined) {
        time.innerText = result[identifier];
      }
    });
  }
}
