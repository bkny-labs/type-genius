import React from 'react';
import logo from '../../assets/img/logo.svg';
import logo2 from '../../assets/img/icon-128.png';
import Greetings from '../../containers/Greetings/Greetings';
import './Popup.css';

const Popup = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo2} width="64"/>
        <h1>Type Genius is enabled</h1>
        <p>Start typing in any input on the page to see suggestions.</p>
      </header>
    </div>
  );
};

export default Popup;
