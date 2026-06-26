import React from 'react';
import '../css/header.css';
import icon from '../images/images.png'; // ✅ Import image

function Header() {
  return (
    <div className="header">
      <img src={icon} alt="Logo" className="logo-icon" />
      <span>MOVIE DECIDER</span>
    </div>
  );
}

export default Header;