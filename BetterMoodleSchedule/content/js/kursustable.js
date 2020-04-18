/* eslint no-undef: 0 */
/* eslint no-loop-func: 0 */

addCourseOptions(); // Adds option to hide all events of a course
getCheckboxStateFromChromeStorage();

/* ***************************** ADDCOURSEOPTIONS ****************************** */
function addCourseOptions() {
  const courseTable = document.getElementById(`kursustable`);
  const courseTableBody = courseTable.getElementsByTagName(`tbody`)[0].rows;
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
  const allCourseEvents = document.getElementsByClassName(`event`);
  for (const event of allCourseEvents) {
    if (event.getElementsByTagName(`a`)[0].text === courseName) {
      event.style.visibility = visibility;
    }
  }
}

function getCheckboxStateFromChromeStorage() {
  const courseTable = document.getElementById(`kursustable`);
  const courseTableBody = courseTable.getElementsByTagName(`tbody`)[0].rows;

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
