chrome.runtime.sendMessage({todo: "showPageAction"});
addCourseOptions(); // Adds option to hide all events of a course
hideSpecificEvent(); // User can hide specific event by doubleclicking
showAllEventsOfDay(); // User can show all hidden events of a day by clicking on the date or the day of the week
getFromChromeStorage(); // Retrieves all values from chrome storage and applies them

// ADDCOURSEOPTIONS //
function addCourseOptions() {
    const course_table = document.getElementById("kursustable");
    const options_body = course_table.getElementsByTagName('tbody')[0].rows;

    // Adds checkboxes to "kursustable"
    for(let i = 0; i < options_body.length; i++){
        const course_name = options_body[i].getElementsByTagName('td')[1].innerText;

        // Create checkbox
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("BMS-checkbox");
        options_body[i].getElementsByTagName('td')[0].appendChild(checkbox);
        checkbox.checked = true;
        // Waits for a change of state in each checkbox
        checkbox.addEventListener('change', e => {
            if(e.target.checked) {
                chrome.storage.sync.set({[course_name]: true});
                showOrHideCourse(course_name, 'visible');
            }
            else {
                chrome.storage.sync.set({[course_name]: false});
                showOrHideCourse(course_name, 'hidden');
            }
        });
    }
    // Adds instructions underneath table
    const para = document.createElement("p");
    const instructions = document.createTextNode(`Uncheck the check boxes above to hide entire course from schedule.\
                                                  Click the extension icon for more functionalities.`);
    para.appendChild(instructions);
    para.id = "BMS-instructions";
    course_table.parentNode.insertBefore(para, course_table.nextSibling);
}
// Set course_name to either 'visible' or 'hidden'
function showOrHideCourse(course_name, visibility) {
    const all_course_events = document.getElementsByClassName("event");

    for(let event of all_course_events){
        if(event.getElementsByTagName("a")[0].text === course_name){
            event.style.visibility = visibility;
        }
    }
}

// HIDESPECIFICEVENT //
function hideSpecificEvent() {
    const all_course_events = document.getElementsByClassName("event");
    for(let event of all_course_events){
        event.addEventListener('dblclick', () => {
            event.style.visibility = 'hidden';
            setEventStateInChromeStorage(event, 'hidden');
        });
    }
}
function setEventStateInChromeStorage(event, state){
    const identifier = getUniqueEventIdentifier(event);
    chrome.storage.sync.set({[identifier]: state});
}
function getUniqueEventIdentifier(event){
    const index = getChildNodeIndex(event);
    const date = event.parentNode.childNodes[1].innerText;
    return date + ": Event NO" + index;
}
function getChildNodeIndex(child){
    let i = 0;
    while( (child = child.previousSibling) != null ) 
        i++;
    return i;
}

// SHOWALLEVENTSOFDAY //
function showAllEventsOfDay() {
    const all_days = document.getElementsByClassName("day");
    for(let day of all_days){
        showAllEventsOfDayOnClick(day.childNodes[0]);
        showAllEventsOfDayOnClick(day.childNodes[1]);
    }
}
function showAllEventsOfDayOnClick(elem) {
    elem.addEventListener('click', () => {
        const events = elem.parentNode.childNodes;
        // Starts from 2 as the first two elements are day of week and date - rest of the elements will be events
        for(let i = 2; i < events.length; i++){
            events[i].style.visibility = 'visible';
            setEventStateInChromeStorage(events[i], 'visible')
        }
    });
}

// GETFROMCHROMESTORAGE //
async function getFromChromeStorage() {
    await getCheckboxStateFromChromeStorage();
    await getEventStatesFromChromeStorage();
}

async function getCheckboxStateFromChromeStorage() {
    const course_table = document.getElementById("kursustable");
    const options_body = course_table.getElementsByTagName('tbody')[0].rows;
    
    for(let i = 0; i < options_body.length; i++){
        const course_name = options_body[i].getElementsByTagName('td')[1].innerText;
        const checkbox = options_body[i].getElementsByTagName('td')[0].childNodes[0];
        // Get stored state for checkbox
        await chrome.storage.sync.get([course_name], result => {
            if(result[course_name] === true){
                checkbox.checked = result[course_name];
                showOrHideCourse(course_name, 'visible');
            }
            else if(result[course_name] === false){
                checkbox.checked = result[course_name];
                showOrHideCourse(course_name, 'hidden');
            }
        });
    }
}

async function getEventStatesFromChromeStorage() {
    const all_course_events = document.getElementsByClassName("event");
    for(let event of all_course_events){
        const identifier = getUniqueEventIdentifier(event);
        await chrome.storage.sync.get([identifier], result => {
            const state = result[identifier];
            if(state === 'hidden'){
                event.style.visibility = 'hidden';
            }
            else if(state === 'visible'){
                event.style.visibility = 'visible';
            }
        });
    }
}