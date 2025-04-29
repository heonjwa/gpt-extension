import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { estimateTokenCount, optimizeTokens } from './TokenService';

const Popup: React.FC = () => {
  const [chatGPTText, setChatGPTText] = useState<string>('');
  const [paraphrasedText, setParaphrasedText] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [tokenStats, setTokenStats] = useState<{original: number, optimized: number, savings: number, percentage: string} | null>(null);

  // Automatically fetch text when popup opens
  useEffect(() => {
    fetchChatGPTInput();
  }, []);

  const fetchChatGPTInput = async (): Promise<void> => {
    setIsFetching(true);
    setMessage('');
    
    try {
      // Get the active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (!activeTab.id) {
        setMessage('No active tab found');
        setIsFetching(false);
        return;
      }

      // Send message to content script
      chrome.tabs.sendMessage(
        activeTab.id, 
        { action: 'getChatGPTInput' },
        (response) => {
          setIsFetching(false);
          
          if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError);
            setMessage(`Error: ${chrome.runtime.lastError.message || 'Could not communicate with page'}`);
            return;
          }
          
          if (response && response.success) {
            setChatGPTText(response.text);
            if (response.text) {
              setMessage('Text fetched successfully! Click "Reduce Tokens" to optimize.');
            } else {
              setMessage('No text found in the ChatGPT input. Try typing something first.');
            }
          } else {
            setMessage(response?.message || 'Could not get text from the page');
          }
        }
      );
    } catch (error) {
      console.error('Error fetching text:', error);
      setMessage('An unexpected error occurred');
      setIsFetching(false);
    }
  };

  const handleParaphrase = async (): Promise<void> => {
    if (!chatGPTText.trim()) {
      setMessage('Please make sure there is text in the ChatGPT input box');
      toast.error('No text to optimize');
      return;
    }
    
    setIsLoading(true);
    setMessage('Optimizing your text...');
    
    try {
      // Use our token optimization service
      const result = await optimizeTokens(chatGPTText);
      setParaphrasedText(result.optimized);
      
      // Get token statistics
      if (result.tokenMetrics) {
        setTokenStats({
          original: result.tokenMetrics.originalTokenCount,
          optimized: result.tokenMetrics.simplifiedTokenCount,
          savings: result.tokenMetrics.tokensSaved,
          percentage: result.tokenMetrics.percentSaved.toFixed(1)
        });
        
        if (result.tokenMetrics.tokensSaved > 0) {
          toast.success(`Saved ${result.tokenMetrics.tokensSaved} tokens!`);
          setMessage(`Text optimized! Review changes and click "Replace in ChatGPT" to apply.`);
        } else {
          toast('Your text is already well optimized');
          setMessage('No significant token savings found. Your prompt is already well optimized!');
        }
      } else {
        // Fallback to local estimation
        const originalTokens = await estimateTokenCount(chatGPTText);
        const optimizedTokens = await estimateTokenCount(result.optimized);
        const tokenSavings = originalTokens - optimizedTokens;
        const savingsPercentage = ((tokenSavings / originalTokens) * 100).toFixed(1);
        
        setTokenStats({
          original: originalTokens,
          optimized: optimizedTokens,
          savings: tokenSavings,
          percentage: savingsPercentage
        });
        
        setMessage(`Text optimized! Review and click "Replace in ChatGPT" if you approve.`);
      }
    } catch (error) {
      console.error('Error optimizing text:', error);
      setMessage('Error during optimization. Is the API server running?');
      toast.error('Optimization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const replaceChatGPTInput = async (): Promise<void> => {
    if (!paraphrasedText.trim()) {
      setMessage('Please optimize the text first');
      toast.error('No optimized text to replace');
      return;
    }
    
    setIsLoading(true);
    setMessage('Replacing text in ChatGPT...');
    
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
            setMessage('Text replaced in ChatGPT! You can now send your optimized prompt.');
            toast.success('Text replaced successfully');
          } else {
            setMessage(response?.message || 'Could not replace text');
            toast.error('Failed to replace text');
          }
        }
      );
    } catch (error) {
      console.error('Error replacing text:', error);
      setMessage('An unexpected error occurred');
      toast.error('Replacement failed');
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
      
      {/* Status indicator */}
      {isFetching && (
        <div className="flex items-center justify-center mb-4 text-sm text-gray-600">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Fetching text from ChatGPT...
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Current ChatGPT Text:
          </label>
          <button 
            className="text-xs text-purple-600 hover:text-purple-800"
            onClick={fetchChatGPTInput}
            disabled={isFetching}
          >
            {isFetching ? 'Fetching...' : 'Refresh'}
          </button>
        </div>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 max-h-28 overflow-y-auto">
          {chatGPTText || (isFetching ? 'Loading...' : 'No text found in ChatGPT input')}
        </div>
      </div>
      
      <button
        className={`w-full py-2 px-4 mb-4 rounded-md font-medium ${
          isLoading || !chatGPTText || isFetching
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 text-white transition duration-200'
        } focus:outline-none focus:ring-2 focus:ring-green-500`}
        onClick={handleParaphrase}
        disabled={isLoading || !chatGPTText || isFetching}
      >
        {isLoading ? 'Optimizing...' : 'Reduce Tokens'}
      </button>
      
      {paraphrasedText && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Optimized Text:
            </label>
            <div className="p-3 bg-gray-100 rounded-md text-gray-800 text-sm max-h-28 overflow-y-auto">
              {paraphrasedText}
            </div>
          </div>
          
          {tokenStats && (
            <div className="mb-4 text-xs bg-gray-50 p-2 rounded border border-gray-200">
              <div className="flex justify-between mb-1">
                <span>Original tokens:</span>
                <span className="font-medium">{tokenStats.original}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Optimized tokens:</span>
                <span className="font-medium">{tokenStats.optimized}</span>
              </div>
              <div className={`flex justify-between ${tokenStats.savings > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                <span>Tokens saved:</span>
                <span className="font-medium">{tokenStats.savings} ({tokenStats.percentage}%)</span>
              </div>
            </div>
          )}
          
          <button
            className={`w-full py-2 px-4 mb-4 rounded-md font-medium ${
              isLoading 
                ? 'bg-blue-400 text-white cursor-wait' 
                : 'bg-blue-600 hover:bg-blue-700 text-white transition duration-200'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            onClick={replaceChatGPTInput}
            disabled={isLoading}
          >
            {isLoading ? 'Replacing...' : 'Replace in ChatGPT'}
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