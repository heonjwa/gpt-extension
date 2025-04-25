import React, { useState } from 'react';

const Popup: React.FC = () => {
  const [chatGPTText, setChatGPTText] = useState<string>('');
  const [paraphrasedText, setParaphrasedText] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchChatGPTInput = async (): Promise<void> => {
    setIsLoading(true);
    setMessage('');
    
    try {
      // Get the active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (!activeTab.id) {
        setMessage('No active tab found');
        setIsLoading(false);
        return;
      }

      // Send message to content script
      chrome.tabs.sendMessage(
        activeTab.id, 
        { action: 'getChatGPTInput' },
        (response) => {
          setIsLoading(false);
          
          if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError);
            setMessage(`Error: ${chrome.runtime.lastError.message || 'Could not communicate with page'}`);
            return;
          }
          
          if (response && response.success) {
            setChatGPTText(response.text);
            setMessage('Text fetched successfully!');
          } else {
            setMessage(response?.message || 'Could not get text from the page');
          }
        }
      );
    } catch (error) {
      console.error('Error fetching text:', error);
      setMessage('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleParaphrase = (): void => {
    if (!chatGPTText.trim()) {
      setMessage('Please fetch or enter some text first');
      return;
    }
    
    setIsLoading(true);
    
    // Mock paraphrasing - replace with your actual implementation
    setTimeout(() => {
      const words = chatGPTText.split(' ');
      const paraphrased = `${words.slice(0, Math.ceil(words.length / 2)).join(' ')}`;
      setParaphrasedText(paraphrased);
      setIsLoading(false);
      setMessage('Text paraphrased!');
    }, 1000);
  };

  const replaceChatGPTInput = async (): Promise<void> => {
    if (!paraphrasedText.trim()) {
      setMessage('Please paraphrase the text first');
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      // Get the active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (!activeTab.id) {
        setMessage('No active tab found');
        setIsLoading(false);
        return;
      }

      // Send message to content script
      chrome.tabs.sendMessage(
        activeTab.id, 
        { 
          action: 'replaceChatGPTInput',
          text: paraphrasedText 
        },
        (response) => {
          setIsLoading(false);
          
          if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError);
            setMessage(`Error: ${chrome.runtime.lastError.message || 'Could not communicate with page'}`);
            return;
          }
          
          if (response && response.success) {
            setMessage('Text replaced in ChatGPT!');
          } else {
            setMessage(response?.message || 'Could not replace text');
          }
        }
      );
    } catch (error) {
      console.error('Error replacing text:', error);
      setMessage('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 bg-white p-4 font-sans">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold ml-2 text-gray-800">ChatGPT Helper</h1>
      </div>
      
      {message && (
        <div className="mb-4 text-sm px-3 py-2 rounded bg-blue-50 text-blue-700">
          {message}
        </div>
      )}
      
      <button
        className={`w-full py-2 px-4 mb-4 rounded-md font-medium ${
          isLoading 
            ? 'bg-purple-400 text-white cursor-wait' 
            : 'bg-purple-600 hover:bg-purple-700 text-white transition duration-200'
        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
        onClick={fetchChatGPTInput}
        disabled={isLoading}
      >
        {isLoading ? 'Working...' : 'Fetch from ChatGPT'}
      </button>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Original Text:
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={4}
          value={chatGPTText}
          onChange={(e) => setChatGPTText(e.target.value)}
          placeholder="Text will appear here..."
        />
      </div>
      
      <button
        className={`w-full py-2 px-4 mb-4 rounded-md font-medium ${
          isLoading || !chatGPTText
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 text-white transition duration-200'
        } focus:outline-none focus:ring-2 focus:ring-green-500`}
        onClick={handleParaphrase}
        disabled={isLoading || !chatGPTText}
      >
        Paraphrase
      </button>
      
      {paraphrasedText && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paraphrased Text:
            </label>
            <div className="p-3 bg-gray-100 rounded-md text-gray-800 text-sm">
              {paraphrasedText}
            </div>
          </div>
          
          <button
            className={`w-full py-2 px-4 mb-4 rounded-md font-medium ${
              isLoading 
                ? 'bg-blue-400 text-white cursor-wait' 
                : 'bg-blue-600 hover:bg-blue-700 text-white transition duration-200'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            onClick={replaceChatGPTInput}
            disabled={isLoading}
          >
            Replace in ChatGPT
          </button>
        </>
      )}
      
      <div className="mt-4 pt-2 border-t border-gray-200 text-xs text-gray-500 text-center">
        © ChatGPT Helper Extension
      </div>
    </div>
  );
};

export default Popup;