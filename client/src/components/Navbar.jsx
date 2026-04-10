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
        <li>
          <Car size={20} /> Rides
        </li>
        <li>
          <DollarSign size={20} /> Earnings
        </li>
        <li>
          <User size={20} /> Profile
        </li>
        <li>
          <LifeBuoy size={20} /> Support
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
