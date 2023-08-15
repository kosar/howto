document.addEventListener('DOMContentLoaded', function() {
    const openaiApiKeyInput = document.getElementById('openai_api_key');
  
    document.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      chrome.storage.sync.set({ openai_api_key: openaiApiKeyInput.value }, function() {
        console.log('Value is set to ' + openaiApiKeyInput.value);
      });
    });
  });
  