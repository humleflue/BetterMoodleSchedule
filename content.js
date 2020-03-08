chrome.runtime.sendMessage({todo: "showPageAction"});
addCourseOptions();

function addCourseOptions() {
    const events = document.getElementsByClassName("event");
    const course_table = document.getElementById("kursustable");
    const options_header = course_table.tHead.rows[0];
    const options_body = course_table.getElementsByTagName('tbody')[0].rows;

    // Adds checkboxes to "kursustable"
    // - Header
    const checkbox_header_cell = options_header.insertCell(0);
    checkbox_header_cell.innerHTML = "Show course";
    checkbox_header_cell.style = "width: 7%";
    // - Body
    for(let i = 0; i < options_body.length; i++){
        const course_name = options_body[i].getElementsByTagName('td')[1].innerText;
        let checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.classList.add("checkbox");
        options_body[i].getElementsByTagName('td')[0].appendChild(checkbox);
        checkbox.addEventListener('change', e => {                                  // Waits for a change in each checkbox
            if(e.target.checked) {
                for(let event of events){
                    if(event.getElementsByTagName("a")[0].text === course_name){
                        event.style.visibility = 'visible';
                    }
                }
            }
            else {
                for(let event of events){
                    if(event.getElementsByTagName("a")[0].text === course_name){
                        event.style.visibility = 'hidden';
                    }
                }
            }
        })
    }
}