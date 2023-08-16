// Listen for messages from the background script
chrome.runtime.onMessage.addListener(({ name, data }) => {
    if (name === 'update-side-panel') {
        // Hide instructions.
        document.querySelector('#select-text-to-moderate').style.display = 'none';
    
        // Check moderation result
        document.querySelector('#moderation-text').innerText = data.selectedText;
        document.querySelector('#openai_api_key_value').innerText = data.openai_api_key;

        //document.querySelector('#moderation-result').innerText = callOpenAI(data.value.openai_key) // placeholder
    }    
    return true;
  });  
  