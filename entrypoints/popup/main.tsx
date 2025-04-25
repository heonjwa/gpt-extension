import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import ParaphrasePopup from './components/ParaphrasePopup.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ParaphrasePopup/>
  </React.StrictMode>,
);
