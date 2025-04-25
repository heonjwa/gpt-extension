import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import { Toaster } from 'react-hot-toast';
import Popup from './components/Popup.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster/>
    <Popup/>
  </React.StrictMode>,
);
