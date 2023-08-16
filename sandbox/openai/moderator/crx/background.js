chrome.storage.sync.get('openai_api_key', function (data) {
  console.log('Fetching Setting: openai_api_key is ' + data.openai_api_key);
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if ('openai_api_key' in changes) {
    var newValue = changes.openai_api_key.newValue;
    console.log('Changes!: openai_api_key is ' + newValue);
  }
});

// Create a context menu item
chrome.contextMenus.create({
  id: "processText",
  title: "Process with Moderator",
  contexts: ["selection"] // Show the menu only when text is selected
});

// Handle context menu item click event
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "processText") {
    const selectedText = info.selectionText;
    console.log("Selected text:", selectedText);
    //TBD from here (get setting)    

    chrome.storage.sync.get('openai_api_key', function (data) {
      console.log(data.openai_api_key);
    });
    
  }
});
