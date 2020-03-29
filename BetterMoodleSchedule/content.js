/* HEAD */

const COURSE_TABLE      = document.getElementById(`kursustable`);
// const SCHEDULE          = document.getElementById(`schedule`); // Unused for now
const ALL_DAYS          = document.getElementsByClassName(`day`);
const ALL_COURSE_EVENTS = document.getElementsByClassName(`event`);
const CUR_DATE = new Date();

/* BODY */

chrome.runtime.sendMessage({ todo: `showPageAction` });

addCourseOptions(); // Adds option to hide all events of a course
hideSpecificEvent(); // User can hide specific event by doubleclicking
showAllEventsOfDay(); // User can show all hidden events of a day by clicking on the date or the day of the week
changeSpecificEventTime(); // User can change an events time by clicking on it
highlightDay(CUR_DATE); // Highlights the current day
getFromChromeStorage(); // Retrieves all values from chrome storage and applies them

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
    checkbox.title = `Uncheck to hide course from schedule`;
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
}
// Set courseName to either 'visible' or 'hidden'
function showOrHideCourse(courseName, visibility) {
  for (const event of ALL_COURSE_EVENTS) {
    if (event.getElementsByTagName(`a`)[0].text === courseName) {
      event.style.visibility = visibility;
    }
  }
}

/* ****************************** HIDESPECIFICEVENT ****************************** */
function hideSpecificEvent() {
  for (const event of ALL_COURSE_EVENTS) {
    event.title = `Double click to hide from schedule`;
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
function getChildNodeIndex(child, ofSameClass = false) {
  let i = 0;
  let elem = child.previousSibling;
  while (elem !== null) {
    elem = elem.previousSibling;
    if (!ofSameClass || (elem !== null && elem.className === child.className)) {
      i++;
    }
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
    const identifier = `${getUniqueEventIdentifier(time.parentNode)}_time`;
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

/* ****************************** HIGHLIGHTDAY ****************************** */
function highlightDay(day) {
  const dayElem = getDayElem(day);
  if (dayElem) {
    dayElem.style.backgroundColor = `LightGray`;
    changeAllDaysOfWeekHeight(dayElem);
  }
}
function getDayElem(day) {
  const dates = document.getElementsByClassName(`date`);
  let done = false;
  let i = 0;
  while (dates[i] !== undefined && !done) {
    const dayDate = convertDateToDate(dates[i].innerText);
    switch (compareDates(dayDate, day)) {
      case -1: i++;                 break; // The date being checked is lower than today's date
      case  1: done = true;         break; // The day being checked is in the future
      case  0: return dates[i].parentNode; // The day being checked is today's date
      default: throw new Error(`compareDates() returned something funky.`);
    }
  }
  return undefined;
}
function convertDateToDate(date) {
  const dayDateArr = date.split(`/`);
  return new Date(dayDateArr[2], dayDateArr[1] - 1, dayDateArr[0]);
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
function changeAllDaysOfWeekHeight(dayElem) {
  const dayDate = convertDateToDate(dayElem.querySelector(`.date`).innerText);
  const dayDayOfWeek = (dayDate.getDay() + 6) % 7; // Monday = 0 and sunday = 6
  const monday = ALL_DAYS[getChildNodeIndex(dayElem, true) - dayDayOfWeek];
  const mondayIndex = getChildNodeIndex(monday, true);

  let weekMaxHeight = 0;
  for (let i = mondayIndex; i < mondayIndex + 7; i++) {
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
