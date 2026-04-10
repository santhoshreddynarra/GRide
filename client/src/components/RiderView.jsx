import React, { useState } from 'react';
import { MapPin, Navigation, Tag, CheckCircle } from 'lucide-react';

const RiderView = () => {
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="view-container" style={{ textAlign: 'center' }}>
        <CheckCircle size={64} color="#0d9488" style={{ marginBottom: '1rem' }} />
        <h2>Ride Booked Successfully!</h2>
        <p>A driver is on their way to your pickup location.</p>
        <button className="btn btn-primary" onClick={() => setConfirmed(false)} style={{ marginTop: '2rem' }}>
          Book Another Ride
        </button>
      </div>
    );
  }

  return (
    <div className="view-container">
      <h2 style={{ marginBottom: '2rem' }}>Book Your Ride</h2>
      <form onSubmit={(e) => { e.preventDefault(); setConfirmed(true); }}>
        <div className="form-group">
          <label><MapPin size={18} /> Pickup Location</label>
          <input type="text" placeholder="e.g. 123 Main St" required />
        </div>
        
        <div className="form-group">
          <label><Navigation size={18} /> Destination</label>
          <input type="text" placeholder="e.g. Central Park" required />
        </div>

        <div className="form-group">
          <label><Tag size={18} /> Ride Type</label>
          <select required>
            <option value="standard">Standard - $12.50</option>
            <option value="premium">Premium (SUV) - $24.00</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Confirm & Book Ride
        </button>
      </form>
    </div>
  );
};

export default RiderView;
