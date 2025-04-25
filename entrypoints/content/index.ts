export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    console.log('Content script initialized');

    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("Message received:", request.action);
      
      if (request.action === 'getChatGPTInput') {
        console.log("Attempting to find ChatGPT input field");
        
        // Get the specific div you identified
        const chatGPTInput = document.querySelector('div[contenteditable="true"][id="prompt-textarea"]');
        console.log("Input element found:", chatGPTInput);
        
        if (chatGPTInput) {
          // Get the text - for contenteditable divs we need to use textContent
          const text = chatGPTInput.textContent || '';
          console.log("Found text:", text);
          
          sendResponse({ success: true, text: text });
        } else {
          console.log("Could not find ChatGPT input element");
          sendResponse({ success: false, message: 'Could not find ChatGPT input field' });
        }
      }
      
      // New action to replace text in ChatGPT's input
      if (request.action === 'replaceChatGPTInput' && request.text) {
        console.log("Attempting to replace ChatGPT input text with:", request.text);
        
        const chatGPTInput = document.querySelector('div[contenteditable="true"][id="prompt-textarea"]');
        
        if (chatGPTInput) {
          // Clear the current content first
          chatGPTInput.innerHTML = '';
          
          // Create a paragraph element (ChatGPT expects content in paragraphs)
          const paragraph = document.createElement('p');
          paragraph.textContent = request.text;
          
          // Add the paragraph to the input div
          chatGPTInput.appendChild(paragraph);
          
          // Trigger events to make ChatGPT recognize the change
          const inputEvent = new Event('input', { bubbles: true });
          chatGPTInput.dispatchEvent(inputEvent);
          
          console.log("Text replaced successfully");
          sendResponse({ success: true });
        } else {
          console.log("Could not find ChatGPT input to replace text");
          sendResponse({ success: false, message: 'Could not find ChatGPT input field' });
        }
      }
      
      // Keep the message channel open for async response
      return true;
    });
  },
});