chrome.storage.sync.get('openai_api_key', function(data) {
    console.log('Fetching Setting: openai_api_key is ' + data.openai_api_key);
  });
  
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if ('openai_api_key' in changes) {
      var newValue = changes.openai_api_key.newValue;
      console.log('Changes!: openai_api_key is ' + newValue);
    }
  });
  