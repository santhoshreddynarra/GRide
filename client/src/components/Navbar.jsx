import React from 'react';
import { Home, Car, DollarSign, User, LifeBuoy } from 'lucide-react';

const Navbar = ({ user, onViewChange }) => {
  const linkStyle = { cursor: 'pointer' };

  return (
    <nav className="navbar">
      <div
        className="logo"
        onClick={() => (user ? onViewChange('dashboard') : onViewChange('landing'))}
        style={linkStyle}
      >
        GigRide
      </div>
      <ul className="nav-links">
        <li onClick={() => onViewChange('dashboard')} style={linkStyle}>
          <Home size={20} /> Home
        </li>
        <li onClick={() => onViewChange('gigs')} style={linkStyle}>
          <Car size={20} /> Gigs
        </li>
        <li onClick={() => onViewChange('earnings')} style={linkStyle}>
          <DollarSign size={20} /> Earnings
        </li>
        <li onClick={() => onViewChange('profile')} style={linkStyle}>
          <User size={20} /> Profile
        </li>
        <li style={linkStyle}>
          <LifeBuoy size={20} /> Support
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
