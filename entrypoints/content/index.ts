import { optimizeTokens } from "../popup/components/TokenService";

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    console.log('Content script initialized');
    
    function getChatGPTInput() {
      const chatGPTInput = document.querySelector('div[contenteditable="true"][id="prompt-textarea"]');
      return chatGPTInput;
    }

    // Function to handle token optimization and text replacement
    async function optimizeAndReplaceText() {
      try {
        // Find the ChatGPT input element
        const chatGPTInput = getChatGPTInput();
        
        if (!chatGPTInput) {
          console.error("Could not find ChatGPT input field");
          return;
        }
        
        // Get current text
        const currentText = chatGPTInput.textContent || '';
        
        if (!currentText.trim()) {
          console.log("Input is empty, nothing to optimize");
          return;
        }
        
        // Show a small notification that we're working
        showToast("Optimizing your prompt...", "info");
        
        // Call the optimization API
        const result = await optimizeTokens(currentText);
        
        if (result.optimized) {
          // Replace text in the input field
          replaceInputText(chatGPTInput, result.optimized);
          
          // Show success message with token savings if available
          if (result.tokenMetrics) {
            const savings = result.tokenMetrics.tokensSaved;
            const percentage = result.tokenMetrics.percentSaved.toFixed(1);
            
            if (savings > 0) {
              showToast(`Optimized! Saved ${savings} tokens (${percentage}%)`, "success");
            } else {
              showToast("Already well optimized!", "info");
            }
          } else {
            showToast("Text optimized successfully!", "success");
          }
        } else {
          showToast("Could not optimize text", "error");
        }
      } catch (error) {
        console.error("Error during optimization:", error);
        showToast("Optimization failed", "error");
      }
    }
    
    // Helper function to replace text in ChatGPT input
    function replaceInputText(inputElement, newText) {
      // Clear the current content
      inputElement.innerHTML = '';
      
      // Create a paragraph element (ChatGPT expects content in paragraphs)
      const paragraph = document.createElement('p');
      paragraph.textContent = newText;
      
      // Add the paragraph to the input div
      inputElement.appendChild(paragraph);
      
      // Trigger events to make ChatGPT recognize the change
      const inputEvent = new Event('input', { bubbles: true });
      inputElement.dispatchEvent(inputEvent);
      
      console.log("Text replaced successfully");
    }
    
    // Create and inject a simple toast notification system
    function setupToastSystem() {
      // Check if our toast container already exists
      if (!document.getElementById('chatgpt-helper-toasts')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'chatgpt-helper-toasts';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '10000';
        toastContainer.style.display = 'flex';
        toastContainer.style.flexDirection = 'column';
        toastContainer.style.gap = '10px';
        document.body.appendChild(toastContainer);
      }
    }
    
    // Show a toast notification
    function showToast(message, type = 'info') {
      // Ensure toast system is set up
      setupToastSystem();
      
      const toastContainer = document.getElementById('chatgpt-helper-toasts');
      
      // Create a new toast
      const toast = document.createElement('div');
      toast.style.padding = '10px 15px';
      toast.style.borderRadius = '4px';
      toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      toast.style.fontFamily = 'inherit';
      toast.style.fontSize = '14px';
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.animation = 'fadeIn 0.3s forwards';
      
      // Style based on type
      if (type === 'success') {
        toast.style.backgroundColor = '#10B981';
        toast.style.color = 'white';
      } else if (type === 'error') {
        toast.style.backgroundColor = '#EF4444';
        toast.style.color = 'white';
      } else {
        toast.style.backgroundColor = '#3B82F6';
        toast.style.color = 'white';
      }
      
      toast.textContent = message;
      
      // Add to container
      toastContainer.appendChild(toast);
      
      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
      
      // Remove after 3 seconds
      setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => {
          if (toast.parentNode) {
            toastContainer.removeChild(toast);
          }
        }, 300);
      }, 3000);
    }

    // Function to create and add the custom button
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
        button.style.border = '1px solid #9333EA';
        button.style.borderRadius = '20px'; 
        button.style.cursor = 'pointer';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.padding = '6px 12px';
        button.style.color = '#c5c5d2';
        button.style.fontSize = '14px';
        button.style.fontFamily = 'inherit';
        button.style.gap = '6px';
        
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
        
        // Create a spark/star icon for optimization
        // Center point
        const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerCircle.setAttribute('cx', '12');
        centerCircle.setAttribute('cy', '12');
        centerCircle.setAttribute('r', '2');
        
        // Lines radiating out from center (8 lines)
        const lines = [];
        for (let i = 0; i < 8; i++) {
          const angle = i * Math.PI / 4;
          const innerX = 12 + Math.cos(angle) * 3;
          const innerY = 12 + Math.sin(angle) * 3;
          const outerX = 12 + Math.cos(angle) * 7;
          const outerY = 12 + Math.sin(angle) * 7;
          
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', innerX.toString());
          line.setAttribute('y1', innerY.toString());
          line.setAttribute('x2', outerX.toString());
          line.setAttribute('y2', outerY.toString());
          lines.push(line);
        }
        
        // Add all parts to the SVG
        svg.appendChild(centerCircle);
        lines.forEach(line => svg.appendChild(line));
        
        // Create span for text
        const text = document.createElement('span');
        text.textContent = 'Optimize';
        
        // Add hover effect
        button.addEventListener('mouseover', () => {
          button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        button.addEventListener('mouseout', () => {
          button.style.backgroundColor = 'transparent';
        });
        
        // Add click event to optimize text
        button.addEventListener('click', optimizeAndReplaceText);
        
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
        
        const chatGPTInput = getChatGPTInput();
        console.log("Input element found:", chatGPTInput);
        
        if (chatGPTInput) {
          const text = chatGPTInput.textContent || '';
          console.log("Found text:", text);
          
          sendResponse({ success: true, text: text });
        } else {
          console.log("Could not find ChatGPT input element");
          sendResponse({ success: false, message: 'Could not find ChatGPT input field' });
        }
      }

      // Handle replace text action
      if (request.action === 'replaceChatGPTInput' && request.text) {
        console.log("Attempting to replace ChatGPT input text with:", request.text);
        
        const chatGPTInput = getChatGPTInput();
        
        if (chatGPTInput) {
          replaceInputText(chatGPTInput, request.text);
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