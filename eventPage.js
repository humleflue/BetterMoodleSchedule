// Makes the icon active only on the Moodle Schedule page
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.todo == "showPageAction"){
        chrome.tabs.query({active:true,currentWindow: true}, function(tabs){
            chrome.pageAction.show(tabs[0].id);
        });
    }
});
