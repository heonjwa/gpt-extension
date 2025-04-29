import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  onComplete: () => void;
}

const NotificationPopup: React.FC<Props> = ({ onComplete }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleGetStarted = () => {
    // If the user checked "Don't show again", save that preference
    if (dontShowAgain) {
      chrome.storage.local.set({ dontShowAgain: true }, () => {
        toast.success("Preference saved");
      });
    } else {
      // User wants to see it again next time, but we still mark this time as completed
      chrome.storage.local.set({ 
        // Keep firstTimeShown but don't set dontShowAgain
        firstTimeShown: true 
      });
    }
    
    // Move to the main popup
    onComplete();
  };

  return (
    <div className="w-80 bg-white p-4 font-sans">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold ml-2 text-gray-800">GPTree</h1>
      </div>

      <div className="mb-4 p-3 rounded bg-yellow-50 text-gray-700 border border-yellow-200">
        <p className="font-medium mb-2">How to use:</p>
        <ol className="list-decimal list-inside text-sm space-y-2">
          <li>Type your prompt in the ChatGPT input box</li>
          <li>Click Optimize or the extension icon in your toolbar</li>
          <li>The extension will automatically optimize your prompt</li>
          <li>Click "Replace in ChatGPT" if you want to use it</li>
        </ol>
      </div>

      <button
        className="w-full py-2 px-4 mb-4 rounded-md font-medium bg-purple-600 hover:bg-purple-700 text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        onClick={handleGetStarted}
      >
        Get Started
      </button>

      <div className="text-center">
        <label className="inline-flex items-center text-xs text-gray-600">
          <input
            type="checkbox"
            className="form-checkbox h-3 w-3 text-purple-600"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          <span className="ml-2">Don't show this again</span>
        </label>
      </div>

      <div className="mt-4 pt-2 border-t border-gray-200 text-xs text-gray-500 text-center">
        © GPTree
      </div>
    </div>
  );
};

export default NotificationPopup;