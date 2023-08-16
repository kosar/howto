async function callModerationAPI(inputText, apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          input: inputText
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }      


// Listen for messages from the background script
chrome.runtime.onMessage.addListener(async ({ name, data }) => {
    if (name === 'update-side-panel') {
        // Hide instructions.
        document.querySelector('#select-text-to-moderate').style.display = 'none';
    
        // Check moderation result
        document.querySelector('#moderation-text').innerText = data.selectedText;
        // document.querySelector('#openai_api_key_value').innerText = data.openai_api_key;

        // Check the moderation result
        // call the moderation function if we have a valid open_api_key
        if (data.openai_api_key) {
            const result = await callModerationAPI(data.selectedText, data.openai_api_key);
            const categories = result.results[0].categories;
            const categoryScores = result.results[0].category_scores;
            
            let output = '';
            for (const category in categories) {
              output += `${category}: ${categories[category]}\n`;
              output += `Score: ${categoryScores[category]}\n\n`;
            }
            document.querySelector('#openai_api_key_value').innerText = output;
        }
        
    }    
    return true;
  });  
  