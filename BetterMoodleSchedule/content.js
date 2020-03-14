chrome.runtime.sendMessage({todo: "showPageAction"});
addCourseOptions(); // Adds option to hide all events of a course
hideSpecificEvent(); // User can hide specific event by doubleclicking
showAllEventsOfDay(); // User can show all hidden events of a day by clicking on the date or the day of the week
changeSpecificEventTime(); // User can change an events time by clicking on it
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
    const instructions_text = document.createTextNode(`Uncheck the check boxes above to hide entire course from schedule.\
                                                  Click the extension icon for more functionalities (found in the top right corner of the Chrome interface).`);
    para.appendChild(instructions_text);
    para.id = "BMS-instructions";
    const instructions = course_table.parentNode.insertBefore(para, course_table.nextSibling);
    // Adds a button which resets chrome.storage underneath the instructions
    const btn = document.createElement("button");
    btn.innerHTML = "Restore original schedule";
    const reset_btn = instructions.parentNode.insertBefore(btn, instructions.nextSibling);
    reset_btn.onclick = () => {
        chrome.storage.sync.clear();
        chrome.storage.local.clear();
        // Display a confirmation message
        const reset_msg_p = document.createElement("p");
        const reset_msg_text = document.createTextNode(`Your Moodle Schedule has been restored to original. Reload the page to see the effects.`)
        const reset_msg_elem = reset_msg_p.appendChild(reset_msg_text);
        reset_msg_p.id = "BMS-reset";
        reset_btn.parentNode.insertBefore(reset_msg_p, reset_btn.nextSibling);
        setTimeout(() => {reset_msg_elem.remove();}, 5000);
    }
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

// CHANGESPECIFICEVENTTIME //
function changeSpecificEventTime() {
    const all_course_events_time = document.getElementsByClassName("time");
    for(let time of all_course_events_time){
        time.addEventListener('click', () => {
            let reg_ex = /\w+:(\w+ - \w+:\w+)/
            let event_time = reg_ex.exec(time.innerText)[0]; // Gets the time of the event to use in the prompt
            let done = false;
            let wanted_time = prompt(`Enter new time of event:`, event_time);
            do {
                let correct_syntax = testTimeForSyntax(wanted_time);
                if(!correct_syntax) {
                    wanted_time = prompt(`ERROR! WRONG SYNTAX!\nPlease try again maintaining the following syntax: "01:23 - 01:23"`, event_time);
                }
                else {
                    done = true;
                }
            } while (!done)
            if(wanted_time !== null){
                time.innerText = "Time: " + wanted_time;
                let identifier = getUniqueEventIdentifier(time.parentNode) + "_time";
                chrome.storage.sync.set({[identifier]: time.innerText});
            }
        });
    }
}
// This function checks string for follwoing syntax: "01:23 - 01:23"
function testTimeForSyntax(str) { 
    if(str === null) { // This means that the user pressed cancel on the prompt
        return true; 
    }
    else if(str.length !== 13) {
        return false;
    }
    else {
        const reg_ex = /([0-9][0-9]:[0-9][0-9] - [0-9][0-9]:[0-9][0-9])/;
        return reg_ex.test(str);
    }
}

// GETFROMCHROMESTORAGE //
async function getFromChromeStorage() {
    await getCheckboxStateFromChromeStorage();
    await getEventStatesFromChromeStorage();
    await getEventTimesFromChromeStorage();
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

async function getEventTimesFromChromeStorage() {
    const all_course_events_time = document.getElementsByClassName("time");
    for(let time of all_course_events_time){
        let identifier = getUniqueEventIdentifier(time.parentNode) + "_time";
        await chrome.storage.sync.get([identifier], result => {
            if(result[identifier] !== undefined) {
                time.innerText = result[identifier];
            }
        });
    }
}