innerHTMLReplace(`.event`, /Time: /, ``);// 🕒
innerHTMLReplace(`.event`, /Location: /, ``);// 📍
innerHTMLReplace(`.event`, /Note: /, ``);// 📄
addCourseAliasInputs();
updateCourseNames();

function innerHTMLReplace(element, search, replace) {
  if (typeof element === `string`) {
    element = document.querySelectorAll(element);
    for (const el of element) {
      el.innerHTML = el.innerHTML.replace(search, replace);
    }
  }
  else {
    element.innerHTML = element.innerHTML.replace(search, replace);
  }
}

function addCourseAliasInputs() {
  const courseRows = document.querySelectorAll(`table#kursustable tr`);
  insertCourseAliasHeader(courseRows[0]);

  // Start from 1 to avoid the "Courses" row
  for (let i = 1; i < courseRows.length; ++i) {
    // Get the course row
    const tr = courseRows[i];
    // Create new table cell with a text input element inside
    const td = document.createElement(`td`);
    td.innerHTML = `<input title="Click to change alias" type="text">`;
    // Read course name from second column in that row
    const courseName = tr.childNodes[1].innerHTML;
    // Get default course alias
    const courseAlias = courseName.match(/\([A-Z]+\)/);
    // Insert default course alias as input field value or first word after semester if no course alias
    td.childNodes[0].value = courseAlias ? courseAlias[0].match(/[A-Z]+/)[0] : courseName.match(/[a-zA-Z]+/g)[1];
    // Add new table cell at the end of the row
    tr.appendChild(td);

    // Get the saved alias' and update when loaded if they exist
    chrome.storage.sync.get([`${courseName}_alias`], (result) => {
      if (Object.keys(result).length > 0) {
        const key = Object.keys(result)[0];
        const courseRows = document.querySelectorAll(`table#kursustable tr`);
        // Start from 1 to avoid the "Courses" row
        for (let i = 1; i < courseRows.length; ++i) {
          // Get the course row
          const tr = courseRows[i];
          // If it is the matching course
          if (key.indexOf(tr.childNodes[1].innerHTML) !== -1) {
            // Update alias input and course name
            tr.childNodes[2].childNodes[0].value = result[key];
            updateCourseName(tr.childNodes[1].innerHTML, result[key]);
            break;
          }
        }
      }
    });
  }

  const classNames = document.querySelectorAll(`div.event a`);
  for (const className of classNames) {
    // Insert new a after original a
    className.parentNode.insertBefore(document.createElement(`a`), className.nextSibling);
    className.nextSibling.setAttribute(`href`, className.getAttribute(`href`));
    className.nextSibling.setAttribute(`class`, `alias`);
    className.setAttribute(`class`, `courseName`);

    // Hide original <a> used for searching for courses when hidden/showing
    className.style.display = `none`;
  }

  // Add event listener to alias input field to update course names if updated
  for (const aliasInput of document.querySelectorAll(`td+td+td>input`)) {
    aliasInput.addEventListener(`input`, (event) => {
      // Update course name of this row (name taken from second column) and set it to the value of the input field
      updateCourseName(event.target.parentNode.previousSibling.innerHTML, event.target.value);
      // Save new alias
      chrome.storage.sync.set({ [`${event.target.parentNode.previousSibling.innerHTML}_alias`]: event.target.value });
    });
  }
}

function insertCourseAliasHeader(headerRow) {
  const aliasHeaderElem = document.createElement(`td`);
  aliasHeaderElem.innerText = `Course aliases`;
  headerRow.appendChild(aliasHeaderElem);
}

// Updates all course names
function updateCourseNames() {
  const courseTable = document.querySelectorAll(`#kursustable tr`);

  // Skip first row since it is the Courses message/header
  for (let i = 1; i < courseTable.length; ++i) {
    const course = courseTable[i];
    // Get alias from the input field in 3rd columns input field
    const alias = course.querySelector(`td+td+td>input`).value;
    // Update courses with the name from second column to alias
    updateCourseName(course.querySelector(`td+td`).innerHTML, alias);
  }
}

// Updates all courses (on schedule) with the course name to an alias
function updateCourseName(courseName, alias) {
  // Get all classes/courses
  const classNames = document.querySelectorAll(`div.event a.courseName`);
  for (const className of classNames) {
    // If it is one that should use a different alias
    if (className.innerHTML === courseName) {
      // Update visible anchor to be alias (default name is in a different anchor for searching)
      className.nextSibling.innerHTML = alias;
    }
  }
}
