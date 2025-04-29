export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    console.log('Content script initialized');

    // Function to create and add the button
    function addCustomButton() {
      const footerActionsDiv = document.querySelector('[data-testid="composer-footer-actions"]');
      
      // Check if footer exists and our button doesn't already exist
      if (footerActionsDiv && !document.getElementById('my-custom-button')) {
        console.log("Footer actions div found, adding button");
        const button = document.createElement('button');
        button.id = 'my-custom-button'; // Add an ID to easily check if it exists
        button.innerText = 'My Button';
        button.style.padding = '8px 12px';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';

        button.addEventListener('click', () => {
          console.log('Button clicked');
        });

        footerActionsDiv.appendChild(button);
        return true;
      }
      return false;
    }

    // Add the button initially
    addCustomButton();

    // Set up an interval to periodically check if the button exists
    setInterval(() => {
      if (!document.getElementById('my-custom-button')) {
        addCustomButton();
      }
    }, 1000); // Check every 1 second

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