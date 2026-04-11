import React from 'react';
import { Home, Car, DollarSign, User, LifeBuoy } from 'lucide-react';

const Navbar = ({ onViewChange }) => {
  return (
    <nav className="navbar">
      <div className="logo" onClick={() => onViewChange('landing')} style={{ cursor: 'pointer' }}>
        GigRide
      </div>
      <ul className="nav-links">
        <li onClick={() => onViewChange('landing')}>
          <Home size={20} /> Home
        </li>
        <li onClick={() => onViewChange('gigs')} style={{ cursor: 'pointer' }}>
          <Car size={20} /> Gigs
        </li>
        <li onClick={() => onViewChange('earnings')} style={{ cursor: 'pointer' }}>
          <DollarSign size={20} /> Earnings
        </li>
        <li onClick={() => onViewChange('profile')} style={{ cursor: 'pointer' }}>
          <User size={20} /> Profile
        </li>
        <li style={{ cursor: 'pointer' }}>
          <LifeBuoy size={20} /> Support
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
