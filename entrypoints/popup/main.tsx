import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import { Toaster } from 'react-hot-toast';
import Popup from './components/Popup.tsx';
import NotificationPopup from './components/NotificationPopup.tsx';

// Component to handle conditional rendering
const App = () => {
  const [showNotification, setShowNotification] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    // First, check if the user has opted to not see the notification again
    chrome.storage.local.get(['dontShowAgain', 'firstTimeShown'], (localResult) => {
      if (localResult.dontShowAgain) {
        // User has chosen to not see the notification again
        setShowNotification(false);
        setInitialized(true);
        return;
      }

      // Check if this is the first time the user is opening the extension
      // If firstTimeShown is not set, this is their first time
      if (!localResult.firstTimeShown) {
        // This is the first time, show notification and mark it as shown
        chrome.storage.local.set({ firstTimeShown: true });
        setShowNotification(true);
        setInitialized(true);
        return;
      }
      
      // If we reach here, it's not the first time, and they haven't opted out
      // So we should show the notification popup again
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab && currentTab.url && currentTab.url.includes('chatgpt.com')) {
          setShowNotification(true);
        } else {
          // Not on ChatGPT, show main popup directly
          setShowNotification(false);
        }
        setInitialized(true);
      });
    });
  }, []);

  const handleCompleteNotification = () => {
    setShowNotification(false);
  };

  // Only render once we've completed our storage checks
  if (!initialized) {
    return <div className="w-80 h-64 flex items-center justify-center">Loading...</div>;
  }

  // Render the appropriate component
  return (
    <>
      <Toaster />
      {showNotification ? <NotificationPopup onComplete={handleCompleteNotification} /> : <Popup />}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);