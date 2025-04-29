import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import { Toaster } from 'react-hot-toast';
import Popup from './components/Popup.tsx';
import NotificationPopup from './components/NotificationPopup.tsx';

// Component to handle conditional rendering
const App = () => {
  const [showNotification, setShowNotification] = useState(false);
  
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url && currentTab.url.includes('chatgpt.com')) {
        // First, check if user opted to not see the notification again
        chrome.storage.local.get(['dontShowAgain'], (localResult) => {
          if (localResult.dontShowAgain) {
            // Respect user's choice — don't show the popup
            setShowNotification(false);
            return;
          }
  
          // Otherwise, always show the notification and reset the session flag
          chrome.storage.session.remove('notificationShown', () => {
            setShowNotification(true);
            chrome.storage.session.set({ notificationShown: true });
          });
        });
      }
    });
  }, []);
  

  // Render the appropriate component
  return (
    <>
      <Toaster />
      {showNotification ? <NotificationPopup /> : <Popup />}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);