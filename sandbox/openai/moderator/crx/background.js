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
function setupContextMenu() {
  chrome.contextMenus.create({
  id: "processText",
  title: "Process with Moderator",
  contexts: ["selection"] // Show the menu only when text is selected
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

// Send a message to the side panel with the selected text and openai_api_key value
chrome.contextMenus.onClicked.addListener((data) => {
  const selectedText = data.selectionText;
  chrome.storage.sync.get('openai_api_key', function(storageData) {
    const openaiApiKey = storageData.openai_api_key;
    chrome.runtime.sendMessage({ 
      name: 'update-side-panel', 
      data: { selectedText: selectedText, openai_api_key: openaiApiKey }
    });
  });
});
