export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    console.log('Content script initialized');
    function getChatGPTInput() {
      const chatGPTInput = document.querySelector('div[contenteditable="true"][id="prompt-textarea"]');
      return chatGPTInput;
    }

    // Function to create and add the button
    function addCustomButton() {
      const footerActionsDiv = document.querySelector('[data-testid="composer-footer-actions"]');
      
      // Check if footer exists and our button doesn't already exist
      if (footerActionsDiv && !document.getElementById('my-custom-button')) {
        console.log("Footer actions div found, adding button");
        
        // Create button container to match ChatGPT's button structure
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'my-custom-button';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.alignItems = 'center';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.margin = '0 5px';
        
        // Create the button element with circular border
        const button = document.createElement('button');
        button.type = 'button';
        button.style.backgroundColor = 'transparent';
        button.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        button.style.borderRadius = '20px'; // Make it more circular
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.padding = '6px 12px';
        button.style.color = '#c5c5d2';
        button.style.fontSize = '14px';
        button.style.fontFamily = 'inherit';
        button.style.gap = '6px'; // Space between icon and text
        
        // Create SVG for icon
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.style.color = '#c5c5d2';
        
        // Create a stick figure icon
        // Head
        const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        head.setAttribute('cx', '12');
        head.setAttribute('cy', '5');
        head.setAttribute('r', '3');
        
        // Body
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        body.setAttribute('x1', '12');
        body.setAttribute('y1', '8');
        body.setAttribute('x2', '12');
        body.setAttribute('y2', '16');
        
        // Arms
        const arms = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        arms.setAttribute('x1', '8');
        arms.setAttribute('y1', '12');
        arms.setAttribute('x2', '16');
        arms.setAttribute('y2', '12');
        
        // Left leg
        const leftLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        leftLeg.setAttribute('x1', '12');
        leftLeg.setAttribute('y1', '16');
        leftLeg.setAttribute('x2', '9');
        leftLeg.setAttribute('y2', '21');
        
        // Right leg
        const rightLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rightLeg.setAttribute('x1', '12');
        rightLeg.setAttribute('y1', '16');
        rightLeg.setAttribute('x2', '15');
        rightLeg.setAttribute('y2', '21');
        
        // Add all parts to the SVG
        svg.appendChild(head);
        svg.appendChild(body);
        svg.appendChild(arms);
        svg.appendChild(leftLeg);
        svg.appendChild(rightLeg);
        
        // Create span for text
        const text = document.createElement('span');
        text.textContent = 'No thank you';
        
        // Add hover effect
        button.addEventListener('mouseover', () => {
          button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        button.addEventListener('mouseout', () => {
          button.style.backgroundColor = 'transparent';
        });
        
        button.addEventListener('click', () => {
          const chatGPTInput = getChatGPTInput();
          if (chatGPTInput) {
            chatGPTInput.textContent = 'No thank you';
          }
        });
        
        button.appendChild(svg);
        button.appendChild(text);
        buttonContainer.appendChild(button);
        footerActionsDiv.appendChild(buttonContainer);
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