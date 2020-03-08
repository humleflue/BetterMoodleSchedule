chrome.runtime.sendMessage({todo: "showPageAction"});
addCourseOptions();

function addCourseOptions() {
    const events = document.getElementsByClassName("event");
    const course_table = document.getElementById("kursustable");
    const options_header = course_table.tHead.rows[0];
    const options_body = course_table.getElementsByTagName('tbody')[0].rows;

    // Adds checkboxes to "kursustable"
    options_header.insertCell(0).innerHTML = "Show course";
    for(let i = 0; i < options_body.length; i++){
        const course_name = options_body[i].getElementsByTagName('td')[1].innerText;
        let checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = true;
        chrome.storage.sync.get([course_name, 'foo'], result => {
            console.log(result.course_name);
            console.log("Foo: " + result.foo)
        });
        checkbox.classList.add("checkbox");
        options_body[i].getElementsByTagName('td')[0].appendChild(checkbox);
        checkbox.addEventListener('change', e => {
            if(e.target.checked) {
                chrome.storage.sync.set({course_name: 'true'}, () => {
                    console.log(course_name+': Value is set to true');
                });
                for(let event of events){
                    if(event.getElementsByTagName("a")[0].text === course_name){
                        event.style.visibility = 'visible';
                    }
                }
            }
            else {
                chrome.storage.sync.set({course_name: 'false'}, () => {
                    console.log(course_name+': Value is set to false');
                });
                for(let event of events){
                    if(event.getElementsByTagName("a")[0].text === course_name){
                        event.style.visibility = 'hidden';
                    }
                }
            }
        })
    }
}