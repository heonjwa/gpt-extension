export default defineBackground({
  main() {
    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.create({
        id: 'paraphrase',
        title: 'Paraphrase with Concise No thank you',
        contexts: ['all'],
      });
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId === 'paraphrase') {
        // find accurate textbox in the current tab
        // get the selected text and paraphrase it
        chrome.tabs.sendMessage(tab?.id!, 
          { action: 'getSelectedText' },
          function (response) {
            console.info("response", response);
          }
        );
      }
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      // Make sure the page is completely loaded
      if (changeInfo.status === 'complete' && tab.url) {
        // Check if the URL contains your target website
        if (tab.url.includes('chatgpt.com')) {
          // Open your popup programmatically
          chrome.action.openPopup();
        }
      }
    });
  }
});
