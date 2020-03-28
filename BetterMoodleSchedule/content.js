const COURSE_TABLE      = document.getElementById(`kursustable`);
// const SCHEDULE          = document.getElementById(`schedule`); // Unused for now
const ALL_DAYS          = document.getElementsByClassName(`day`);
const ALL_COURSE_EVENTS = document.getElementsByClassName(`event`);
const CUR_DATE = new Date();

chrome.runtime.sendMessage({ todo: `showPageAction` });

addCourseOptions(); // Adds option to hide all events of a course
hideSpecificEvent(); // User can hide specific event by doubleclicking
showAllEventsOfDay(); // User can show all hidden events of a day by clicking on the date or the day of the week
changeSpecificEventTime(); // User can change an events time by clicking on it
getFromChromeStorage(); // Retrieves all values from chrome storage and applies them
highlightDay(); // Highlights the current day

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
  const courseTableBody = COURSE_TABLE.getElementsByTagName(`tbody`)[0].rows;
  // Adds checkboxes to "kursustable"
  for (let i = 0; i < courseTableBody.length; i++) {
    const courseName = courseTableBody[i].getElementsByTagName(`td`)[1].innerText;

    // Create checkbox
    const checkbox = document.createElement(`input`);
    checkbox.type = `checkbox`;
    checkbox.classList.add(`BMS-checkbox`);
    courseTableBody[i].getElementsByTagName(`td`)[0].appendChild(checkbox);
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
  const instructions = insertDomNode(`div`, COURSE_TABLE.nextSibling, ``, [{ type: `id`, val: `BMS-instructions` }]);
  const instructionsText = appendDomNode(`p`, instructions, `Uncheck the check boxes above to hide entire course from schedule.`);
  instructionsText.appendChild(document.createElement(`br`));
  instructionsText.appendChild(document.createTextNode(
    `Click the extension icon for more functionalities (found in the top right corner of the Chrome interface).`,
  ));
}
// Set courseName to either 'visible' or 'hidden'
function showOrHideCourse(courseName, visibility) {
  for (const event of ALL_COURSE_EVENTS) {
    if (event.getElementsByTagName(`a`)[0].text === courseName) {
      event.style.visibility = visibility;
    }
  }
}

// Inserts a DOM node before the given element
function insertDomNode(tagName, insBeforeThisElem, text, selectors) {
  const node = createDomNode(tagName, text, selectors);
  insBeforeThisElem.parentNode.insertBefore(node, insBeforeThisElem);
  return node;
}

// Appends a DOM node to the given parent
function appendDomNode(tagName, parent, text, selectors) {
  const node = createDomNode(tagName, text, selectors);
  parent.appendChild(node);
  return node;
}

function createDomNode(tagName, text, selectors) {
  const elem = document.createElement(tagName);
  if (selectors) {
    for (const selector of selectors) {
      elem[selector.type] = selector.val;
    }
  }
  switch (tagName) {
    case `p`:      elem.appendChild(document.createTextNode(text)); break;
    case `button`: elem.innerHTML = text;                           break;
    default:                                                        break;
  }
  return elem;
}

/* ****************************** HIDESPECIFICEVENT ****************************** */
function hideSpecificEvent() {
  for (const event of ALL_COURSE_EVENTS) {
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
  let elem = child.previousSibling;
  while (elem != null) {
    elem = elem.previousSibling;
    i++;
  }
  return i;
}

/* ****************************** SHOWALLEVENTSOFDAY ****************************** */
function showAllEventsOfDay() {
  for (const day of ALL_DAYS) {
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

function highlightDay() {
  const dates = document.getElementsByClassName(`date`);
  let done = false;
  let i = 0;
  while (dates[i] !== undefined && !done) {
    const dayDateArr = dates[i].innerText.split(`/`);
    const dayDate = new Date(dayDateArr[2], dayDateArr[1] - 1, dayDateArr[0]);
    switch (compareDates(dayDate, CUR_DATE)) {
      case -1: i++;         break;
      case  1: done = true; break;
      case  0:
        dates[i].parentNode.style.backgroundColor = `LightGray`;
        changeDayHeight();
        done = true;
        break;
      default:
        throw new Error(`compareDates() returned something funky.`);
    }
  }
}
/* Compares two dates by returning
 * * -1 if date1 comes earlier than date2
 * *  0 if the dates are the same
 * *  1 if date1 comes later than date2
 */
function compareDates(date1, date2) {
  if (date1.getDate() === date2.getDate()
      && date1.getMonth() === date2.getMonth()
      && date1.getFullYear() === date2.getFullYear()) {
    return 0;
  }

  return date1 < date2 ? -1 : 1;
}
// This function makes sure, that all days of the week has the same height, such that the highlight is homogenious
function changeDayHeight() {
  let weekMaxHeight = 0;
  for (let i = 0; i < ALL_DAYS.length; i++) {
    weekMaxHeight = Math.max(ALL_DAYS[i].clientHeight, weekMaxHeight);
    if (i % 7 === 6) {
      for (let j = i - 6; j <= i; j++) {
        ALL_DAYS[j].style.minHeight = `${weekMaxHeight}px`;
      }
      weekMaxHeight = 0;
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
  const courseTableBody = COURSE_TABLE.getElementsByTagName(`tbody`)[0].rows;

  for (let i = 0; i < courseTableBody.length; i++) {
    const courseName = courseTableBody[i].getElementsByTagName(`td`)[1].innerText;
    const checkbox = courseTableBody[i].getElementsByTagName(`td`)[0].childNodes[0];
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
  for (const event of ALL_COURSE_EVENTS) {
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
