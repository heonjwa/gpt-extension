export default defineBackground({
  main() {
    // We'll keep declarativeContent for activating the extension on ChatGPT
    chrome.runtime.onInstalled.addListener(() => {
      chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
          conditions: [
            new chrome.declarativeContent.PageStateMatcher({
              pageUrl: { hostContains: 'chatgpt.com' },
            })
          ],
          actions: [
            new chrome.declarativeContent.ShowAction(),
          ]
        }]);
      });
    });

    // We need to add back a way to detect navigation to ChatGPT
    // This can be done with web navigation API which is less invasive than tabs
    chrome.webNavigation.onCompleted.addListener((details) => {
      // Check if this is the main frame (not iframes)
      if (details.frameId === 0 && details.url.includes('chatgpt.com')) {
        // Check if we should show the notification
        chrome.storage.session.get(['notificationShown'], (result) => {
          if (!result.notificationShown) {
            // Show the popup
            chrome.action.openPopup();
            // Set flag so we don't show it again in this session
            chrome.storage.session.set({ notificationShown: true });
          }
        });
      }
    });

    // Listen for messages from the content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      // Handle any messages that were previously dependent on contextMenus
      if (request.action === 'openPopup') {
        // Check if the sender tab is on chatgpt.com
        if (sender.tab && sender.tab.url && sender.tab.url.includes('chatgpt.com')) {
          chrome.action.openPopup();
        }
      }
      return true;
    });
  }
});