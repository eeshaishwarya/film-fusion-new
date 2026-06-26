import React from 'react';
import Header from './Header';
import icon from '../images/images.png'; // ✅ import icon
import '../css/enter.css';

function Enter() {
  return (
    <div>
      <Header />
      <div className="background"></div>
      <div className="overlay"></div>
      <div className="content">
        <div className="content-box">
          <br />
          <div className="title-with-icon">
            <img src={icon} alt="Logo" className="logo-icon" />
            <h1>MOVIE DECIDER</h1>
          </div>
          <br />
          <br />bv. 
          <p>Blending Two Movies to Generate a Unique Movie</p>
          <br />
          <a href="/home">
            <button className="btn">Click Here</button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Enter;