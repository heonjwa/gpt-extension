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
    // Check if we're on ChatGPT.com and this is the first time showing the popup
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url && currentTab.url.includes('chatgpt.com')) {
        // Check if we've shown the notification before in this session
        chrome.storage.session.get(['notificationShown'], (result) => {
          if (!result.notificationShown) {
            setShowNotification(true);
            // Mark that we've shown the notification
            chrome.storage.session.set({ notificationShown: true });
          }
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