import React, { useState } from 'react';

const ParaphrasePopup: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleParaphrase = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Replace this with your actual API call to paraphrasing service
      // For demonstration, I'm using a simple mock
      setTimeout(() => {
        const paraphrased = `Concise version: ${inputText.split(' ').slice(0, Math.ceil(inputText.split(' ').length / 2)).join(' ')}`;
        setOutputText(paraphrased);
        setIsLoading(false);
      }, 1000);
      
      // Example API call:
      // const response = await fetch('https://your-paraphrase-api.com/paraphrase', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: inputText })
      // });
      // const data = await response.json();
      // setOutputText(data.paraphrasedText);
    } catch (error) {
      console.error('Error paraphrasing text:', error);
      setOutputText('Error paraphrasing text. Please try again.');
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-4 font-sans">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold ml-2 text-gray-800">Concise Paraphraser</h1>
      </div>
      
      <div className="mb-4">
        <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-1">
          Enter your text:
        </label>
        <textarea
          id="input-text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your text here..."
        />
      </div>
      
      <button
        className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          isLoading 
            ? 'bg-purple-400 text-white cursor-wait' 
            : 'bg-purple-600 hover:bg-purple-700 text-white transition duration-200'
        }`}
        onClick={handleParaphrase}
        disabled={isLoading || !inputText.trim()}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Paraphrasing...
          </span>
        ) : (
          'Paraphrase'
        )}
      </button>
      
      {outputText && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Paraphrased text:
            </label>
            <button 
              onClick={copyToClipboard}
              className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
          <div className="p-3 bg-gray-100 rounded-md text-gray-800 text-sm">
            {outputText}
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-2 border-t border-gray-200 text-xs text-gray-500 text-center">
        © Concise Paraphraser Extension
      </div>
    </div>
  );
};

export default ParaphrasePopup;