chrome.runtime.sendMessage({todo: "showPageAction"});
addCourseOptions();

function addCourseOptions() {
    const course_table = document.getElementById("kursustable");
    const options_header = course_table.tHead.rows[0];
    const options_body = course_table.getElementsByTagName('tbody')[0].rows;

    // Adds checkboxes to "kursustable"
    // - Header
    const checkbox_header_cell = options_header.insertCell(0);
    checkbox_header_cell.innerHTML = "Show course";
    checkbox_header_cell.setAttribute("id", "show_course");
    // - Body
    for(let i = 0; i < options_body.length; i++){
        const course_name = options_body[i].getElementsByTagName('td')[1].innerText;
        // const reg_exp = /\s(\w+)/;
        // let course_identifier_arr = reg_exp.exec(course_name);
        // let course_identifier = course_identifier_arr[1]; // Course identifier is gonna be the first word of the course_name
        let course_identifier = "course_NO" + i;

        // Create checkbox
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("checkbox");
        options_body[i].getElementsByTagName('td')[0].appendChild(checkbox);
        // Get stored state for checkbox
        chrome.storage.sync.get([course_identifier], result => {
            if(result[course_identifier] === true){
                checkbox.checked = result[course_identifier];
                showOrHideCourse(course_name, 'visible');
            }
            else if(result[course_identifier] === false){
                checkbox.checked = result[course_identifier];
                showOrHideCourse(course_name, 'hidden');
            }
        });
        
        // Waits for a change of state in each checkbox
        checkbox.addEventListener('change', e => {
            if(e.target.checked) {
                chrome.storage.sync.set({[course_identifier]: true});
                showOrHideCourse(course_name, 'visible');
            }
            else {
                chrome.storage.sync.set({[course_identifier]: false});
                showOrHideCourse(course_name, 'hidden');
            }
        });
    }
}

function showOrHideCourse(course_name, visibility) {
    const all_course_events = document.getElementsByClassName("event");

    for(let event of all_course_events){
        if(event.getElementsByTagName("a")[0].text === course_name){
            event.style.visibility = visibility;
        }
    }
}