export default defineBackground({
  main() {
    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId === 'paraphrase') {
        chrome.tabs.sendMessage(tab?.id!, 
          { action: 'getSelectedText' },
          function (response) {
            console.info("response", response);
          }
        );
      }
    });

    // Listen for when the user visits ChatGPT.com
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url && tab.url.includes('chatgpt.com')) {
        // Check if we should show the notification
        chrome.storage.session.get(['notificationShown'], (result) => {
          if (!result.notificationShown) {
            // Show the popup
            chrome.action.openPopup();
          }
        });
      }
    });
  }
});